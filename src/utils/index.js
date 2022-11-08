export const generateTblConfigs = (slots = [], renderTbl, option = {}, headerAcc = {}) => {
  const { r = 0, parent } = option
  const { c: parentC = 0, props: parentProps } = parent || {}
  return slots.reduce(([headerAcc, columnAcc, rowAcc, headerNumAcc, startCol], slot) => {
    const { componentInstance, componentOptions, data } = slot
    const { children, Ctor } = componentOptions
    if (Ctor.options.name !== 'sw-table-column') return [headerAcc, columnAcc, rowAcc, headerNumAcc, startCol]
    const {
      label,
      fixed,
      type,
      index,
      prop,
      width,
      resizable,
      sortable,
      minWidth,
      className,
      selectable,
      align,
      headerAlign,
      reserveSelection
    } = componentInstance
    const renderFn = renderTbl(type, { index })
    const renderHeaderFn = type === 'selection' ? { header: renderFn } : {}
    const scopedSlots = renderFn ?
      { ...(data.scopedSlots || {}), default: renderFn, ...renderHeaderFn } :
        data.scopedSlots
    const isColumnFixed =
      (!columnAcc.length || columnAcc.at(-1).props.fixed) &&
      (r === 0 ? (fixed || typeof fixed === 'string') : parentProps.fixed)
    const props = Object.freeze({
      type,
      label,
      prop,
      selectable,
      align,
      headerAlign,
      reserveSelection,
      // 存在type就不允许排序
      sortable: type ? false : sortable,
      minWidth: parseInt(minWidth),
      width: parseInt(width),
      fixed: isColumnFixed,
      classColumn: className,
    })
    const columnConfig = { props, scopedSlots, r, c: startCol, parent }
    const option = { r: r + 1, parent: columnConfig }
    const [cColumnAcc, cRowAcc, cHeaderNumAcc] = generateTblConfigs(children, renderTbl, option, headerAcc).slice(1)
    const childColNum = cColumnAcc.length || 1
    // 暂不支持多层header的fixed以及跨层级fixed
    Object.assign(columnConfig, {
      w: childColNum,
      resizable: !cColumnAcc.length && resizable
    })
    if (!cRowAcc) {
      columnAcc.push(columnConfig)
    }
    const list = headerAcc[startCol] || (headerAcc[startCol] = [])
    list.push(columnConfig)
    return [
      headerAcc,
      columnAcc.concat(cColumnAcc),
      Math.max(rowAcc, cRowAcc + 1),
      headerNumAcc + cHeaderNumAcc,
      startCol + childColNum
    ]
  }, [headerAcc, [], 0, 0, parentC])
}

const generateHeader = (headerColumn, config) => {
  const { scopedSlots, props, r, c, w, resizable } = headerColumn
  const { baseConfig, colWidthConfig, rowHeight } = config
  const { headerRowNum, column } = baseConfig
  const columnNum = column.length
  const { sortable, label, prop } = props
  let width = colWidthConfig[c].colLeft
  if (c + w >= columnNum) {
    const { colWidth, colLeft } = colWidthConfig[columnNum - 1]
    width = (colWidth + colLeft) - width
  } else {
    width = colWidthConfig[c + w].colLeft - width
  }
  const height = w > 1 ? rowHeight : (headerRowNum - r) * rowHeight
  const left = colWidthConfig[c].colLeft
  const top =  r * rowHeight
  const content = (scopedSlots && scopedSlots.header) || label
  const rect = { left, top, width, height, fixed: column[c].props.fixed }
  const scopedData = { cellType: 'header', row: {}, column: headerColumn, columnIndex: c, rowIndex: r }
  return { key: `header-${c}-${r}`, type: 'header', rect, content, sortable, resizable, prop, scopedData }
}
const collectHeaderDataByRange = ({ list, parentList, cacheMap, config }, colRange) => {
  const header = config.baseConfig.header
  for (let columnIndex = colRange[0]; columnIndex < colRange[1]; columnIndex++) {
    (header[columnIndex] || []).forEach(h => {
      const { r, c, parent } = h
      list.push(generateHeader(h, config))
      parent && parentList.push(parent)
      cacheMap[`${r}-${c}`] = 1
    })
  }
}
const collectHeaderParent = ({ parentList, list, cacheMap, config }) => {
  parentList.forEach(h => {
    if (!h) return
    const {r, c, parent} = h
    if (!cacheMap[`${r}-${c}`]) {
      cacheMap[`${r}-${c}`] = 1
      list.push(generateHeader(h, config))
    }
    if (parent) {
      collectHeaderParent({ parentList: [parent], list, cacheMap, config })
    }
  })
}
export const generateHeaderData = (config) => {
  const colRange = config.renderRange.col
  const baseArgs = { parentList: [], list: [], cacheMap: {}, config }
  if (colRange[0] > 0 && ~colRange[2]) {
    collectHeaderDataByRange(baseArgs, [0, colRange[2]])
  }
  collectHeaderDataByRange(baseArgs, colRange)
  collectHeaderParent(baseArgs)
  return baseArgs.list
}

const collectCellDataByRange = (list, tableData, config, range) => {
  const { baseConfig, colWidthConfig, rowHeight, sortKeys, spanMethod } = config
  const { headerRowNum, column: columnConfigs } = baseConfig
  const { col: colRange, row: rowRange } = range
  const endColConfig = colWidthConfig.at(-1)
  for (let columnIndex = colRange[0]; columnIndex < colRange[1]; columnIndex++) {
    const { colWidth, colLeft } = colWidthConfig[columnIndex]
    const column = columnConfigs[columnIndex]
    const { props, scopedSlots } = column
    const { fixed, prop, classColumn } = props
    for (let rowIndex = rowRange[0]; rowIndex < rowRange[1]; rowIndex++) {
      const originIndex = (sortKeys && sortKeys.length) ? sortKeys[rowIndex] : rowIndex
      const row = tableData[originIndex]
      const scopedData = { column, row, columnIndex, rowIndex }
      const spanRes = spanMethod(scopedData) || [1, 1]
      const [rowspan, colspan] = Array.isArray(spanRes) ? spanRes : [spanRes.rowspan, spanRes.colspan]
      // 宽高均为0则直接跳过
      if (!rowspan || !colspan) continue
      const expectConfig = colWidthConfig[columnIndex + colspan]
      const width = colspan === 1 ?
        colWidth :
        ((expectConfig ? expectConfig.colLeft : (endColConfig.colLeft + endColConfig.colWidth)) - colLeft)
      const height = rowHeight * Math.min(rowspan, tableData.length - rowIndex)
      const left = colLeft
      const top =  (rowIndex + headerRowNum) * rowHeight
      // 不能立刻执行，否则会无法被renderWatch收集到而失去响应性
      const content = (scopedSlots && scopedSlots.default) || row[prop]
      const rect = { left, top, width, height, fixed }
      list.push({ key: `${columnIndex}-${rowIndex}`, type: 'base', rect, content, scopedData, classColumn })
    }
  }
}
export const generateCellData = (tableData, config) => {
  let { col: colRange, row: rowRange } = config.renderRange
  rowRange = [rowRange[0], Math.min(tableData.length, rowRange[1])]
  const cellList = []
  if (colRange[0] > 0 && ~colRange[2]) {
    const range = { col: [0, colRange[2]], row: rowRange }
    collectCellDataByRange(cellList, tableData, config, range)
  }
  collectCellDataByRange(cellList, tableData, config, { col: colRange, row: rowRange })
  return cellList
}

const getCellConfig = ([cellCs, rowCs], scopedData) => {
  const ccs = cellCs ? (typeof cellCs === 'string' ? cellCs : cellCs(scopedData)): void 0
  const rcs = rowCs ? (typeof rowCs === 'string' ? rowCs : rowCs(scopedData)): void 0
  return [ccs, rcs]
}
export const getCellStyle = ({ type, scopedData, rect }, options) => {
  const isBaseCell = type === 'base'
  const { scrollLeft, scrollTop, cellStyle, rowStyle, headerCellStyle, headerRowStyle } = options
  const { fixed, width, height, left, top } = rect
  const transLeft = left - (fixed ? 0 : scrollLeft)
  const transTop = top - (type !== 'header' ? scrollTop : 0)

  const [cellStyleOption, rowStyleOption] = isBaseCell ? [cellStyle, rowStyle] : [headerCellStyle, headerRowStyle]
  const styleCell = getCellConfig([cellStyleOption, rowStyleOption], scopedData)
  return {
    ...styleCell,
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate3d(${transLeft}px, ${transTop}px, 0)`
  }
}
export const getCellClass = ({ type, scopedData, rect, classColumn }, options) => {
  const {
    stripe,
    hoverIdx,
    highlightCurrentRow,
    highlightRow,
    cellClassName,
    rowClassName,
    headerCellClassName,
    headerRowClass
  } = options
  const { row, rowIndex } = scopedData
  const isBaseCell = type === 'base'
  const classPrefix = 'sw-table__cell'
  const classStripe = (stripe && isBaseCell && rowIndex % 2 === 1) ? `${classPrefix}--stripe` : void 0
  const classHover = (isBaseCell && hoverIdx === rowIndex) ? `${classPrefix}--hover` : void 0
  const [cellClassOption, rowClassOption] = isBaseCell ? [cellClassName, rowClassName] : [headerCellClassName, headerRowClass]
  const classCell = getCellConfig([cellClassOption, rowClassOption], scopedData)
  const classFixed = rect.fixed ? `${classPrefix}--fixed` : void 0
  const classHighlight = (isBaseCell && highlightCurrentRow && row === highlightRow) ?
    `${classPrefix}--highlight` : void 0
  return [
    `${classPrefix}--${type}`,
    classPrefix,
    classStripe,
    classHover,
    classFixed,
    classHighlight,
    classColumn,
    ...classCell
  ]
}

export const findIndex = (arr, fn, startIdx) => {
  const colLen = arr.length
  for (let i = startIdx || 0; i < colLen; i++) {
    if (!fn(arr[i])) continue
    return i
  }
  return typeof startIdx === 'number' ? arr.length : 0
}
