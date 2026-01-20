<script setup>
const props = defineProps({
  showTopArea: {
    type: Boolean,
    default: true
  },
  pageTitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
<div class="mainArea">
  <div class="topArea" v-if="showTopArea">
    <span class="pageTitle" v-if="pageTitle">{{ pageTitle }}</span>
    <slot name="title"></slot>
    <slot name="topRight"></slot>
  </div>
  <slot></slot>
</div>
</template>

<style lang='less' scoped>
.mainArea{
  padding: 20px 30px 30px 30px;
  background-color: #fff;
  height: calc(100% - 36px);
  position: relative;
  .topArea{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    .pageTitle{
      color: rgba(0, 0, 0, 0.80);
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>