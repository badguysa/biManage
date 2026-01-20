<script setup>
import myButton from './myButton.vue'

const props = defineProps({
  title: {
    type: String,
    default: '新建'
  },
  name: {
    type: String,
    default: 'addSymbol'
  },
  color: {
    type: String,
    default: '#2B67FF'
  }
})

</script>

<template>
  <BiButton @click="$emit('addFn', $event)">
    <template #icon>
      <BiIcon :name="name" :color="color"/>
    </template>
    <span>{{ title }}</span>
  </BiButton>
</template>

<style lang="less" scoped>
.textBtn {
  display: flex;
  align-items: center;
  .svgIcon {
    width: 14px;
    height: 14px;
    margin-right: 2px;
  }
}
</style>
