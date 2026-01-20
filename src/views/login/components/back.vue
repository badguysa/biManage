<template>
  <div class="back">
    <span>返回</span>
  </div>
</template>

<style lang="less" scoped>
.back {
  width: 100%;
  height: 22px;
  span {
    height: 100%;
    font-size: 16px;
    color: #2b67ff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    &::before {
      display: inline-block;
      content: '';
      width: 14px;
      height: 14px;
      background: url(@/assets/icons/back_icon.png) center/cover;
    }
  }
}
</style>
