import { generateTblConfigs } from "../utils";

export default {
  setCurrentRow (row) {
    const oldRow = this.highlightRow
    this.highlightRow = row;
    this.$emit('current-change', row, oldRow)
  },
  handleToggleRowSelection (eve) {
    const { rowIndex, type } = eve.target.dataset
    if (type === 'header') {
      this.toggleAllSelection()
    } else {
      this.toggleRowSelection(this.tableData[rowIndex])
    }
  },
  toggleRowSelection (row) {
    const selectIdx = this.selectionList.indexOf(row)
    if (~selectIdx) {
      this.selectionList.splice(selectIdx, 1)
    } else {
      this.selectionList.push(row)
    }
    this.$emit('select', this.selectionList, row)
  },
  toggleAllSelection () {
    if (this.tableData.length > this.selectionList.length) {
      this.selectionList = [...this.tableData]
    } else {
      this.selectionList = []
    }
    this.$emit('select-all', this.selectionList)
  },
  clearSelection () {
    if (!this.selectionList.length) return
    this.selectionList = []
  },
  clearSort () {
    this.sortInfo = null
  },
  initConfigs () {
    const [
      headerConfigs,
      baseColumnConfigs,
      headerRowNum,
      headerNum
    ] = generateTblConfigs(this.$slots.default.filter(s => s.tag), this.renderTypeTbl.bind(this))
    Object.assign(this.baseConfig, {
      headerNum,
      headerRowNum,
      header: headerConfigs,
      column: baseColumnConfigs
    })
  },
  sort ({ prop, order }) {
    if (!this.sortInfo || this.sortInfo.prop !== prop || this.sortInfo.order !== order) {
      this.sortInfo = { prop, order }
    } else {
      this.sortInfo = null
    }
  }
}
