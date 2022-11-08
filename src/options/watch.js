import { findIndex } from "../utils";

const watchCol = [['tableWidth', 'baseConfig.column'], function () {
  this.recalColWidth()
}]
const watchScrollLeft = [['scrollXOffset', 'contentWidth', 'tableWidth'], function () {
  this.scrollLeft = Math.max(Math.min(this.scrollXOffset, this.contentWidth - this.tableWidth), 0)
}]
const watchScrollTop = [['scrollYOffset', 'tableHeight', 'contentHeight'], function () {
  this.scrollTop = Math.max(Math.min(this.scrollYOffset, this.contentHeight - this.tableHeight), 0)
}]
const watchRenderRange = [[
  'colWidthConfig', 'rowHeight', 'tableWidth', 'tableHeight',
  'scrollLeft', 'scrollTop', 'fixedColIdx'], function () {
  const startCol = this.scrollLeft <= 0 ? 0 : findIndex(this.colWidthConfig, ({ colWidth, colLeft }) => colLeft + colWidth >= this.scrollLeft)
  const endCol = findIndex(this.colWidthConfig, ({ colLeft }) => colLeft >= this.scrollLeft + this.tableWidth, startCol)
  const startRow = Math.floor(this.scrollTop / this.rowHeight)
  const endRow = Math.ceil((this.scrollTop + this.tableHeight) / this.rowHeight)
  this.renderRange = {
    col: [startCol, endCol, Math.min(this.fixedColIdx, startCol)],
    row: [startRow, endRow]
  }
}]
const watchObj = [watchCol, watchScrollLeft, watchScrollTop, watchRenderRange].reduce((map, [keyList, cb]) => {
  keyList.forEach((k) => {
    const list = map[k] || (map[k] = [])
    list.push(cb)
  })
  return map
}, {})
export default Object.entries(watchObj).reduce((res, [k, cbList]) => {
  const watchFn = function () {
    cbList.forEach(cb => cb.call(this))
  }
  return Object.assign(res, { [k]: watchFn })
}, {})
