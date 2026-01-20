<script setup>
const emits = defineEmits(['change'])
</script>

<template>
  <div class="pagination-wrap">
    <a-pagination v-bind="$attrs" @change="$emit('change')" />
  </div>
</template>

<style lang="less" scoped>
  :deep(.ant-pagination-item-active) {
    border-color: none !important;
    background: #2b67ff;
    a {
      color: #fff !important;
    }
  }
</style>
