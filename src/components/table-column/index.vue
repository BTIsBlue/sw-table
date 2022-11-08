<template>
  <div v-if="!false">
    <slot :row="{}" :column="{}"></slot>
  </div>
</template>

<script>
export default {
  name: "sw-table-column",
  props: {
    type: String,
    label: String,
    prop: String,
    fixed: Boolean,
    sortable: Boolean,
    resizable: Boolean,
    className: String,
    align: String,
    headerAlign: String,
    reserveSelection: Boolean,
    index: [Number, Function],
    width: [Number, String],
    minWidth: {
      type: [Number, String],
      default: 100
    },
    selectable: Function
  },
  methods: {
    refresh (parent = this.$parent) {
      if (parent.refresh) {
        parent.refresh()
      } else {
        this.refresh(parent.$parent)
      }
    }
  },
  updated () {
    this.refresh()
  },
  created () {
    this.$watch(() => {
      Object.keys(this.$options.props).forEach(p => this[p])
    }, { before: this.refresh.bind(this) })
    this.refresh()
  },
  beforeDestroy () {
    this.refresh()
  }
}
</script>
