<template>
  <div class="back">
    <span @click="$emit('backFn')">返回</span>
  </div>
</template>

<style lang="less" scoped>
.back {
  width: 100%;
  border-bottom: 1px solid #F0F0F0;
  padding: 10px 16px;
  height: 36px;
  span {
    height: 100%;
    font-size: 14px;
    color: #2b67ff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    &::before {
      display: inline-block;
      content: '';
      width: 16px;
      height: 16px;
      background: url(@/assets/icons/return.png) center/cover;
    }
  }
}
</style>
