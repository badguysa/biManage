<script setup>
const props = defineProps(['title'])
const emits = defineEmits(['cancel'])
</script>

<template>
  <div class="tag-wrap">
    <span>{{ title ? title : '-' }}</span>
    <i @click="$emit('cancel')"></i>
  </div>
</template>

<style lang="less" scoped>
.tag-wrap {
  background: #f2f4f7;
  border-radius: 2px;
  color: #00000066;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  & > i {
    display: inline-block;
    width: 12px;
    height: 12px;
    cursor: pointer;
    background: url(../../assets/icons/close1.png) center/cover;
  }
}
</style>
