<template>
  <div class="scroller" :style="outerStyle" @scroll="handleScroll" v-if="isShow">
    <div class="scroller__inner" :style="innerStyle"></div>
  </div>
</template>

<script>
export default {
  name: "sw-table-scroller",
  props: {
    scrollOffset: {
      type: Number,
      default: 0
    },
    scrollType: {
      type: String,
      require: true
    },
    config: {
      type: Object,
      require: true
    }
  },
  computed: {
    isShow ({ config }) {
      const { inner, outer } = config
      return inner > outer
    },
    outerStyle ({ scrollType, config }) {
      const { outer, offset } = config
      const offsetStyle = scrollType === 'height' ?
        { position: 'absolute', top: `${offset}px`, right: '1px' } :
        { position: 'relative', left: `${offset}px` }
      return { [scrollType]: `${outer}px`, ...offsetStyle }
    },
    innerStyle ({ scrollType, config }) {
      return { [scrollType]: `${config.inner}px` }
    }
  },
  methods: {
    handleScroll (e) {
      this.$emit('scroll', e.target)
    },
    scrollTo (val) {
      const scrollDir = this.scrollType === 'height' ? 'top' : 'left'
      this.$el.scrollTo({ [scrollDir]: this.scrollOffset + val })
    }
  }
}
</script>

<style scoped>
.scroller {
  width: 8px;
  height: 8px;
  overflow: auto;
}
.scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scroller::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.4);
}
.scroller::-webkit-scrollbar-button {
  display: none;
}
.scroller::-webkit-scrollbar-corner {
  display: none;
}
.scroller__inner {
  width: 8px;
  height: 8px;
}
</style>
