<script>
import {
  generateHeaderData,
  generateCellData,
  getCellStyle,
  getCellClass
} from './utils'
import watchObj from './options/watch'
import methodsObj from './options/methods'
import TableScroller from './components/table-scroller'
import debounce from 'lodash/debounce'
const SCROLLER_WIDTH = 8
const MIN_CELL_WIDTH = 40

export default {
  name: "sw-table",
  components: {
    TableScroller
  },
  props: {
    tableData: {
      type: Array,
      default: () => ([])
    },
    rowHeight: {
      type: Number,
      default: 50
    },
    spanMethod: {
      type: Function,
      default: () => ({ colspan: 1, rowspan: 1 })
    },
    maxHeight: {
      type: [String, Number],
      default: Number.MAX_SAFE_INTEGER
    },
    rowClassName: [Function, String],
    cellClassName: [Function, String],
    headerCellClassName: [Function, String],
    headerRowClass: [Function, String],
    cellStyle: [Function, Object],
    rowStyle: [Function, Object],
    headerCellStyle: [Function, Object],
    headerRowStyle: [Function, Object],
    highlightCurrentRow: Boolean,
    height: [String, Number],
    stripe: Boolean,
    border: Boolean,
    defaultSort: Object
  },
  data () {
    return {
      contentWidth: 0,
      fixedColIdx: 0,
      tableWidth: 0,
      baseConfig: {
        headerNum: 0,
        headerRowNum: 0,
        header: {},
        column: []
      },
      fixedLeft: 0,
      colWidthConfig: [],
      resizeLine: null,
      resizeConfig: [],
      hoverIdx: void 0,
      highlightRow: void 0,
      scrollXOffset: 0,
      scrollYOffset: 0,
      sortInfo: this.defaultSort,
      selectionList: [],
      scrollLeft: 0,
      scrollTop: 0,
      renderRange: {
        col: [0, 0, 0],
        row: [0, 0]
      },
      // 不需要主动refresh，当有column时自然会进行refresh
      refresh: debounce(this.initConfigs, 50)
    }
  },
  computed: {
    headerHeight ({ baseConfig, rowHeight }) {
      return baseConfig.headerRowNum * rowHeight
    },
    contentHeight ({ tableData, rowHeight, headerHeight }) {
      const dataRowNum = tableData.length
      return headerHeight + dataRowNum * rowHeight
    },
    tableHeight ({ height, maxHeight, contentHeight }) {
      return parseInt(height) || Math.min(contentHeight, parseInt(maxHeight))
    },
    isBald ({ border, baseConfig }) {
      const { headerNum, column } = baseConfig
      return !border && (headerNum !== column.length)
    },
    sortKeys ({ tableData, sortInfo }) {
      const { prop, order = 'ascending' } = sortInfo || {}
      if (!prop || !tableData.length || !tableData[0][prop]) return
      const sortRes = order === 'ascending' ? [-1, 0] : [0, -1]
      const sortFn = (a, b) => a.value > b.value ? sortRes[0] : sortRes[1]
      const sortList = tableData.map((row, index) => ({ index, value: row[prop], row })).sort(sortFn)
      return sortList.map(s => s.index)
    },
    cellData ({ tableData, colWidthConfig, rowHeight, baseConfig, sortKeys, spanMethod, renderRange }) {
      if (!colWidthConfig.length || renderRange.row[0] === renderRange.row[1]) return []
      const headerCell = generateHeaderData({ baseConfig, colWidthConfig, rowHeight, renderRange })
      const baseCell = generateCellData(tableData, {
        baseConfig,
        colWidthConfig,
        rowHeight,
        sortKeys,
        spanMethod,
        renderRange
      })
      return headerCell.concat(baseCell)
    },
    scrollerXConfig ({ tableWidth, contentWidth }) {
      return { outer: tableWidth + SCROLLER_WIDTH, inner: contentWidth }
    },
    scrollerYConfig ({ tableHeight, contentHeight, headerHeight }) {
      return {
        outer: tableHeight - headerHeight + SCROLLER_WIDTH,
        inner: contentHeight - headerHeight,
        offset: headerHeight
      }
    },
    tableClass ({ isBald, resizeLine }) {
      return [
        'sw-table__body',
        isBald ? 'sw-table__body--bald' : '',
        resizeLine ? 'sw-table__body--resizing' : ''
      ]
    },
    tableStyle ({ tableHeight }) {
      return { height: `${tableHeight}px` }
    },
    fixedStyle ({ tableWidth, tableHeight, scrollLeft, scrollTop, fixedLeft, baseConfig, rowHeight }) {
      const fixedArr = []
      if (scrollTop) {
        const style = { top: `${baseConfig.headerRowNum * rowHeight - 10}px`, width: `${tableWidth}px` }
        fixedArr.push({ key: 'row', style })
      }
      if (scrollLeft && fixedLeft) {
        const style = { left: `${fixedLeft - 10}px`, height: `${tableHeight}px` }
        fixedArr.push({ key: 'col', style })
      }
      return fixedArr
    },
    renderCellList ({
      scrollLeft,
      scrollTop,
      stripe,
      hoverIdx,
      highlightCurrentRow,
      highlightRow,
      sortInfo,
      cellData,
      cellStyle,
      rowStyle,
      headerCellStyle,
      headerRowStyle,
      cellClassName,
      rowClassName,
      headerCellClassName,
      headerRowClassName
    }) {
      // 先获取变量再计算，防止重复depend导致性能卡顿
      const styleOptions = {
        scrollLeft,
        scrollTop,
        cellStyle,
        rowStyle,
        headerCellStyle,
        headerRowStyle
      }
      const classOptions = {
        stripe,
        hoverIdx,
        cellClassName,
        rowClassName,
        headerCellClassName,
        headerRowClassName,
        highlightCurrentRow,
        highlightRow
      }
      const cellList = cellData.map((cell, index) => {
        const { type, key, scopedData, content } = cell
        const { rowIndex, columnIndex, column } = scopedData
        const cellStyle = getCellStyle(cell, styleOptions)
        const classList = getCellClass(cell, classOptions)
        const { align, headerAlign } = column.props
        const textAlign = (type === 'header' ? headerAlign : void 0) || align
        return (<div
          ref={ key }
          key={ key }
          data-type={ type }
          data-index={ index }
          data-row-index={ rowIndex }
          class={ classList }
          style={ cellStyle }
          onClick={ this.handleClickCell }
          onDblclick={ this.handleDblClickCell }
          onContextmenu={ this.handleContextMenuCell }
          onMouseenter={ this.handleMouseEnter }
          onMouseleave={ this.handleMouseLeave }>
          <div style={{ textAlign }}>
            { typeof content === 'function' ? content(scopedData) : content }
            { this.renderSortIcons(cell, sortInfo) }
            { this.renderResizer(cell, columnIndex) }
          </div>
        </div>)
      })
      return cellList
    },
    renderScroller ({ scrollXOffset, scrollerXConfig, scrollYOffset, scrollerYConfig, handleScroll }) {
      // todo 需要知道为什么会有多余的空白
      const scrollerX = <table-scroller
        key="table-scroller-x"
        data-key="scroller-x"
        scrollType="width"
        scrollOffset={ scrollXOffset }
        onScroll={ handleScroll }
        config={ scrollerXConfig }
      />
      const scrollerY = <table-scroller
        ref="scrollerY"
        key="table-scroller-y"
        data-key="scroller-y"
        scrollType="height"
        scrollOffset={ scrollYOffset }
        onScroll={ handleScroll }
        config={ scrollerYConfig }
      />
      return ([scrollerX, scrollerY])
    },
    renderFixed ({ fixedStyle }) {
      if (!fixedStyle) return null
      const el = fixedStyle.map(({ key, style }) => {
        return (
          <div
            key={`table-fixed--${key}`}
            class={['sw-table__fixed', `sw-table__fixed--${key}`]}
            style={ style }>
          </div>
        )
      })
      return el
    }
  },
  watch: watchObj,
  methods: {
    ...methodsObj,
    recalColWidth () {
      const tableWidth = this.tableWidth
      const column = this.baseConfig.column
      const resizeConfig = this.resizeConfig
      if (!tableWidth) return []
      const [leftWidth, leftNum] = column.reduce(([widthAcc, numAcc], col, colIdx) => {
        const width = resizeConfig[colIdx] || col.props.width
        if (!width) {
          numAcc += 1
        } else {
          widthAcc -= width
        }
        return [widthAcc, numAcc]
      }, [tableWidth, 0])
      const autoWidth = leftNum ? (leftWidth / leftNum) : 0
      const [config] = column.reduce(([colAcc, left], col, colIdx) => {
        const { width, minWidth } = col.props
        const colWidth = resizeConfig[colIdx] || width || Math.max(autoWidth, minWidth, MIN_CELL_WIDTH)
        colAcc.push({ colWidth, colLeft: left })
        return [colAcc, left + colWidth]
      }, [[], 0])

      this.colWidthConfig = config
      const index = column.findIndex(c => !c.props.fixed)
      this.fixedColIdx = index
      this.fixedLeft = ~index ? config[index].colLeft : 0
      const { colLeft = 0, colWidth = 0 } = config.at(-1) || {}
      this.contentWidth = colLeft + colWidth
    },

    initListeners () {
      const resizeObs = new ResizeObserver(() => {
        this.tableWidth = this.$el.offsetWidth
      })
      resizeObs.observe(this.$el)
      this.$once('hook:beforeDestroy', () => {
        resizeObs.disconnect()
      })
    },
    handleSort (eve) {
      // todo we get some problem here
      this.sort(eve.target.dataset || {})
    },
    handleMouseEnter (eve) {
      const { type, rowIndex, index } = eve.currentTarget.dataset
      const cell = this.cellData[index]
      if (type === 'header' || !cell) return
      eve.stopPropagation()
      this.hoverIdx = +rowIndex
      this.$emit('cell-mouse-enter', this.cellData[index].scopedData)
    },
    handleMouseLeave (eve) {
      const cell = this.cellData[eve.currentTarget.dataset.index]
      if (!cell) return
      eve.stopPropagation()
      this.hoverIdx = void 0
      this.$emit('cell-mouse-leave', cell.scopedData)
    },
    handleScroll (target) {
      const [scrollKey, scrollOffset] = target.dataset.key === 'scroller-x' ?
        ['scrollXOffset', 'scrollLeft'] : ['scrollYOffset', 'scrollTop']
      this[scrollKey] = target[scrollOffset]
    },
    handleTblScroll (e) {
      const scroller = this.$refs.scrollerY
      if (!scroller || !scroller.$el || !scroller.$el.scrollTo) return
      if ((this.scrollTop <= 0 && e.deltaY < 0) ||
        (this.scrollTop > 0 && this.scrollTop >= (this.contentHeight - this.tableHeight) && e.deltaY > 0)) return
      const scrollOffset = this.rowHeight * 1.5
      scroller.scrollTo(e.deltaY > 0 ? scrollOffset : -scrollOffset)
      e.preventDefault()
    },
    handleClickCell (eve) {
      const { type, scopedData } = this.handleCellOperate(eve, 'click') || {}
      if (!this.highlightCurrentRow || type === 'header' || !scopedData) return
      this.setCurrentRow(scopedData.row)
    },
    handleDblClickCell (eve) {
      this.handleCellOperate(eve, 'dblclick')
    },
    handleContextMenuCell (eve) {
      this.handleCellOperate(eve, 'contextmenu')
    },
    handleCellOperate (eve, eveName) {
      const cell = this.cellData[eve.currentTarget.dataset.index]
      if (!cell) return
      eve.stopPropagation()
      const { key, type, scopedData = {} } = cell
      const isHeader = type === 'header'
      const events = isHeader ? [`header-${eveName}`] : [`cell-${eveName}`, `row-${eveName}`]
      events.forEach((event) => this.$emit(event, { eve, cellDom: this.$refs[key] }, scopedData))
      return cell
    },
    handleResize (eve) {
      const colIdx = eve.target.dataset.columnIndex
      const { colWidth, colLeft } = this.colWidthConfig[colIdx]
      const [maxLeft, minLeft, initPlus] = [Number.MAX_SAFE_INTEGER, colLeft + MIN_CELL_WIDTH, colWidth]
      const initLeft = colLeft + initPlus
      let resizeWidth = colWidth
      this.resizeLine = (<div class="sw-table__line" style={{ left: `${initLeft}px` }}></div>)
      const initX = parseInt(eve.clientX)
      const mouseMove = (me) => {
        const resizeLeft = Math.min(Math.max(parseInt(me.clientX) - initX + initLeft, minLeft), maxLeft)
        resizeWidth = resizeLeft - colLeft
        this.resizeLine = (<div class="sw-table__line" style={{ left: `${resizeLeft}px` }}></div>)
      }
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', mouseMove)
        this.resizeLine = null
        if (resizeWidth === colWidth) return
        // 不需要响应式
        this.resizeConfig[colIdx] = resizeWidth
        const oldWidth = this.colWidthConfig[colIdx]
        const column = this.baseConfig.column[colIdx]
        this.recalColWidth()
        this.$emit('header-dragend', resizeWidth, oldWidth, column)
      }, { once: true })
    },
    renderResizer ({ resizable }, columnIndex) {
      if (!resizable) return
      return (<div
        key="resizer"
        data-column-index={ columnIndex }
        class={ ['sw-table__resizer'] }
        onMousedown={ this.handleResize }>
      </div>)
    },
    renderSortIcons ({ sortable, prop }, option) {
      const { prop: curProp, order: curOrder } = option || {}
      if (!sortable) return
      const sortTypes = [{ order: 'ascending', value: 'up' }, { order: 'descending', value: 'down' }]
      const mapFn = ({ order, value }) => {
        const activatedCls = ((curProp === prop && curOrder === order) ? 'sw-table__cell__sort--activated' : '')
        return <i
          data-prop={prop}
          data-order={order}
          key={`sort-${prop}-${order}`}
          class={`v v-icon-sort-${value} ` + activatedCls}
          onClick={this.handleSort}
        />
      }
      return (
        <div class="sw-table__cell__sort">
          { sortTypes.map(mapFn) }
        </div>
      )
    },
    renderTypeTbl (type, { index }) {
      return {
        selection: ({ cellType, row, rowIndex, column }) => {
          const selectable = column.props.selectable
          const isChecked = cellType === 'header' ?
            (this.selectionList.length === this.tableData.length) :
            this.selectionList.includes(row)
          return (
            <input
              type="checkbox"
              class="sw-table__cell__selection"
              data-type={ cellType }
              data-row-index={ rowIndex }
              checked={ isChecked }
              disabled={ selectable && !selectable(row, rowIndex, cellType) }
              onChange={ this.handleToggleRowSelection } />
          )
        },
        index: ({ rowIndex: idx }) => {
          if (!index) return idx
          if (typeof index === 'number') return index + idx
          return index(idx)
        }
      }[type]
    }
  },
  mounted () {
    this.initListeners()
  },
  render () {
    const { tableClass, tableStyle, renderCellList, resizeLine, renderScroller, renderFixed, $slots } = this
    const el = (
      <div class="sw-table" onWheel={ this.handleTblScroll }>
        <div
          key="table-body"
          class={ tableClass }
          style={ tableStyle }>
          { renderCellList }
          { resizeLine }
        </div>
        { renderScroller }
        { renderFixed }
        <div key="table-columns" class="sw-table__columns">
          { $slots.default }
        </div>
      </div>
    )
    return el
  }
}
</script>

<style>
.sw-table {
  position: relative;
}

.sw-table__body {
  position: relative;
  max-width: 100%;
  border: 1px solid lightgrey;
  overflow: hidden;
  box-sizing: border-box;
}
.sw-table__body--bald {
  border-right: none!important;
  border-left: none!important;
  border-top: none!important;
}
.sw-table__body--bald > .sw-table__cell {
  border-right: none!important;
}
.sw-table__body--resizing > .sw-table__cell {
  user-select: none;
}

.sw-table__fixed {
  pointer-events: none;
  position: absolute;
  z-index: 5;
}
.sw-table__fixed--col {
  width: 10px;
  top: 0;
  box-shadow: 5px 0 10px rgba(0, 0, 0, .12);
}
.sw-table__fixed--row {
  height: 10px;
  left: 0;
  box-shadow: 0 5px 10px rgb(0 0 0 / 12%)
}

.sw-table__columns {
  display: none;
}

.sw-table__resizer {
  position: absolute;
  top: 0;
  right: -4.5px;
  width: 10px;
  height: 100%;
  cursor: w-resize;
  z-index: 98;
}
.sw-table__line {
  position: absolute;
  top: 0;
  z-index: 99;
  height: 100%;
  width: 2px;
  background-color: #1675e0;
  transform: translateX(-1px);
}
/* 下面是单元格相关属性 --- START */
.sw-table__cell {
  display: flex;
  box-sizing: border-box;
  padding: 0 10px;
  position: absolute;
  left: 0;
  top: 0;
  align-items: center;
  border-bottom: 1px solid lightgrey;
  border-right: 1px solid lightgray;
}
.sw-table__cell > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.sw-table__cell--header {
  color: #909399;
  font-weight: 700;
  z-index: 2;
}
.sw-table__cell--header.sw-table__cell--fixed {
  z-index: 3;
}
.sw-table__cell--base {
  z-index: 0;
}
.sw-table__cell--base.sw-table__cell--fixed {
  z-index: 1;
}
.sw-table__cell--header, .sw-table__cell--base {
  background-color: #ffffff;
  transition: background-color 0.15s linear;
}
.sw-table__cell--stripe {
  background-color: #fafafa;
}
.sw-table__cell--highlight {
  background-color: #ecf5ff;
}
.sw-table__cell--hover {
  background-color: #f5f7fa;
}
.sw-table__cell__sort {
  margin-left: 5px;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
}
.sw-table__cell__sort > * {
  display: block;
}
.sw-table__cell__sort--activated {
  color: #1675e0;
}
.sw-table__cell__selection {
  cursor: pointer;
}
/* 下面是单元格相关属性 --- END */
</style>
<style>
@font-face {
  font-family: 'v';
  src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAJQAA0AAAAABggAAAH9AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGh4GYACCQhEICjhJCwwAATYCJAMSBCAFhC4HPhskBcguBuymYxiNtJZm2MZHj4/c2fQYhkYUjZXVs/uIYRKWyAKgUCejCI2IEjEmjizp6POf5vY+WupFxKNp6XdT+xuiIRIbS4lMATMnwgl//w+gP5y6yRn8iHOb83yDpV3iEyiwNIsnZVs4C7MAIWFqd84zrn0O+dXSHkkj4VFMQuDbl8CvTz+npYNprIISTRcdhd7lsxHqTQWf4Pr8M8k4ZaShv/CcfXzQUf7efd97+KZ990YAsBWhoWEjAgdVBRvVbAVdF36fhN8nWAMBGSWAFAoAEHByhhQYAZMojGIO0AEQae2OYd1MfbX6Quig0jweBOHQdpR3Nv9vqquYbke9m3pjXIFQ5PqbHdC+2m+G3gEdnaPWCCOagMKkSQwBLPohwJIWAhFHEShjziPQxG0EuniIwIgpzxAYFR8FTDrgj8CUpRxUlT6B3RBBlIOgzDoOmnIddOUuGLHKBKPKWzDpsk/blN1ZtpMySOzJOkG5UB2aSMhMMRyvaRWhVW4oMIABnGew5HxSCs/I0sDAxS8zpDIOV1IYGxjBcuKMByMkzlSHDKmcOZmCZYIxk2BKRQLCUeAbBp8vIsRSEZdBwwZwxI5mhTVhNjcX+l6TniD4z7b3AE8xFpsaGjKZQwNaTg2TpWYm052Zb/0yTGLjCKJSaRNjUe7rotIMdh4DAA==') format('woff2');
}

.v {
  font-family: "v" !important;
  font-size: 10px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-icon-sort-down:before {
  content: "\e843";
}

.v-icon-sort-up:before {
  content: "\e844";
}
</style>
