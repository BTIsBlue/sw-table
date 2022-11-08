<template functional>
  <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <path d="M0 0 L10 0 L5 5 Z" transform="rotateX(180deg)" fill="#c0c4cc" />
  </svg>
</template>

<script>
export default {
  name: "table-sort",
  props: {
    activated: Boolean,
    isUp: Boolean
  }
}
</script>
<style scoped>
  .sort--up {
    transform: rotateZ(90deg);
  }
</style>
