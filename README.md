# Sw-Table

Sw-Table是一个基于Vue的PC端表格组件，支持虚拟行/虚拟列以及大部分el-table相关属性

## 安装

```
npm install sw-table
```

### 使用

```javascript
import Vue from 'vue'
import SwTable from 'sw-table'
import 'sw-table/dist/sw-table.css'

Vue.use(SwTable)
```

## 示例

注意：sw-table使用的属性是table-data而不是data

```vue
<template>
    <sw-table :table-data="tableData">
      <sw-table-column
        prop="date"
        label="日期"
        width="180">
      </sw-table-column>
      <sw-table-column
        prop="name"
        label="姓名"
        width="180">
      </sw-table-column>
      <sw-table-column
        prop="address"
        label="地址">
      </sw-table-column>
    </sw-table>
  </template>

  <script>
    export default {
      data() {
        return {
          tableData: [{
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄'
          }, {
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1517 弄'
          }, {
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }, {
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1516 弄'
          }]
        }
      }
    }
  </script>
```

## API

### Table Attributes

| 参数                   | 说明                                                         | 类型                                                  | 可选值                         | 默认值                                                     |
| :--------------------- | :----------------------------------------------------------- | :---------------------------------------------------- | :----------------------------- | :--------------------------------------------------------- |
| table-data             | 显示的数据 **(el-table中为data)**                            | array                                                 | —                              | —                                                          |
| height                 | Table 的高度，默认为自动高度。                               | string/number                                         | —                              | —                                                          |
| max-height             | Table 的最大高度。合法的值为数字或者单位为 px 的高度。       | string/number                                         | —                              | —                                                          |
| stripe                 | 是否为斑马纹 table                                           | boolean                                               | —                              | false                                                      |
| border                 | 是否带有纵向边框                                             | boolean                                               | —                              | false                                                      |
| highlight-current-row  | 是否要高亮当前行                                             | boolean                                               | —                              | false                                                      |
| row-class-name         | 行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className。 | Function({row, rowIndex})/String                      | —                              | —                                                          |
| row-style              | 行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style。 | Function({row, rowIndex})/Object                      | —                              | —                                                          |
| cell-class-name        | 单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。 | Function({row, column, rowIndex, columnIndex})/String | —                              | —                                                          |
| cell-style             | 单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有单元格设置一样的 Style。 | Function({row, column, rowIndex, columnIndex})/Object | —                              | —                                                          |
| header-row-class-name  | 表头行的 className 的回调方法，也可以使用字符串为所有表头行设置一个固定的 className。 | Function({row, rowIndex})/String                      | —                              | —                                                          |
| header-row-style       | 表头行的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style。 | Function({row, rowIndex})/Object                      | —                              | —                                                          |
| header-cell-class-name | 表头单元格的 className 的回调方法，也可以使用字符串为所有表头单元格设置一个固定的 className。 | Function({row, column, rowIndex, columnIndex})/String | —                              | —                                                          |
| header-cell-style      | 表头单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有表头单元格设置一样的 Style。 | Function({row, column, rowIndex, columnIndex})/Object | —                              | —                                                          |
| default-sort           | 默认的排序列的 prop 和顺序。它的`prop`属性指定默认的排序的列，`order`指定默认排序的顺序 | Object                                                | `order`: ascending, descending | 如果只指定了`prop`, 没有指定`order`, 则默认顺序是ascending |
| span-method            | 合并行或列的计算方法                                         | Function({ row, column, rowIndex, columnIndex })      | —                              | —                                                          |

### Table Events

| 事件名             | 说明                                                         | 参数                                   |
| :----------------- | :----------------------------------------------------------- | :------------------------------------- |
| select             | 当勾选数据行的 Checkbox 时触发的事件                         | selection, row                         |
| select-all         | 当勾选全选 Checkbox 时触发的事件                             | selection                              |
| cell-mouse-enter   | 当单元格 hover 进入时会触发该事件                            | { row, column, rowIndex, columnIndex } |
| cell-mouse-leave   | 当单元格 hover 退出时会触发该事件                            | { row, column, rowIndex, columnIndex } |
| cell-click         | 当某个单元格被点击时会触发该事件                             | { row, column, rowIndex, columnIndex } |
| cell-dblclick      | 当某个单元格被双击击时会触发该事件                           | { row, column, rowIndex, columnIndex } |
| row-click          | 当某一行被点击时会触发该事件                                 | { row, rowIndex }                      |
| row-contextmenu    | 当某一行被鼠标右键点击时会触发该事件                         | { row, rowIndex }                      |
| row-dblclick       | 当某一行被双击时会触发该事件                                 | { row, rowIndex }                      |
| header-click       | 当某一列的表头被点击时会触发该事件                           | { rowIndex, columnIndex }              |
| header-contextmenu | 当某一列的表头被鼠标右键点击时触发该事件                     | { rowIndex, columnIndex }              |
| sort-change        | 当表格的排序条件发生变化的时候会触发该事件                   | { column, prop, order }                |
| current-change     | 当表格的当前行发生变化的时候会触发该事件，如果要高亮当前行，请打开表格的 highlight-current-row 属性 | currentRow, oldCurrentRow              |
| header-dragend     | 当拖动表头改变了列的宽度的时候会触发该事件                   | newWidth, oldWidth, column             |

### Table Methods

| 方法名             | 说明                                                         | 参数                        |
| :----------------- | :----------------------------------------------------------- | :-------------------------- |
| clearSelection     | 用于多选表格，清空用户的选择                                 | —                           |
| toggleRowSelection | 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中） | row, selected               |
| toggleAllSelection | 用于多选表格，切换所有行的选中状态                           | -                           |
| setCurrentRow      | 用于单选表格，设定某一行为选中行，如果调用时不加参数，则会取消目前高亮行的选中状态。 | row                         |
| clearSort          | 用于清空排序条件，数据会恢复成未排序的状态                   | —                           |
| refresh            | 强行对 Table 进行重新布局。                                  | —                           |
| sort               | 手动对 Table 进行排序。参数`prop`属性指定排序列，`order`指定排序顺序。 | prop: string, order: string |

### Table Slot

| name   | 说明                                                         |
| :----- | :----------------------------------------------------------- |
| append | 插入至表格最后一行之后的内容，如果需要对表格的内容进行无限滚动操作，可能需要用到这个 slot。 |

### Table-column Attributes

| 参数              | 说明                                                         | 类型                              | 可选值            | 默认值 |
| :---------------- | :----------------------------------------------------------- | :-------------------------------- | :---------------- | :----- |
| type              | 对应列的类型。如果设置了 `selection` 则显示多选框；如果设置了 `index` 则显示该行的索引（从 1 开始计算）； | string                            | selection/index   | —      |
| index             | 如果设置了 `type=index`，可以通过传递 `index` 属性来自定义索引 | number, Function(index)           | —                 | —      |
| label             | 显示的标题                                                   | string                            | —                 | —      |
| prop              | 对应列内容的字段名，也可以使用 property 属性                 | string                            | —                 | —      |
| width             | 对应列的宽度                                                 | string, number                    | —                 | —      |
| min-width         | 对应列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列 | string, number                    | —                 | —      |
| fixed             | true 表示固定在左侧                                          | boolean                           | true, false       | —      |
| sortable          | 对应列是否可以排序                                           | boolean                           | true, false       | —      |
| resizable         | 对应列是否可以通过拖动改变宽度                               | boolean                           | —                 | true   |
| align             | 对齐方式                                                     | String                            | left/center/right | left   |
| header-align      | 表头对齐方式，若不设置该项，则使用表格的对齐方式             | String                            | left/center/right | —      |
| class-name        | 列的 className                                               | string                            | —                 | —      |
| selectable        | 仅对 type=selection 的列有效，类型为 Function，Function 的返回值用来决定这一行的 CheckBox 是否可以勾选 | Function(row, rowIndex, cellType) | —                 | —      |
| reserve-selection | 仅对 type=selection 的列有效，类型为 Boolean，为 true 则会在数据更新之后保留之前选中的数据（需指定 `row-key`） | Boolean                           | —                 | false  |

### Table-column Scoped Slot

| name   | 说明                                           |
| :----- | :--------------------------------------------- |
| —      | 自定义列的内容，参数为 { row, column, $index } |
| header | 自定义表头的内容. 参数为 { column, $index }    |

