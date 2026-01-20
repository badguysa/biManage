<script setup>
const wrapHeightMap = {
  sort: 140,
  group: 230,
  merge: 236,
  add: 140,
  filter: 202
}

const props = defineProps({
  operateType: {
    type: String,
    required: true,
  },
  flexDirection: {
    type: String,
    default: 'row',
  },
})

const attrs = useAttrs()

const isFold = ref(false)

const wrapRef = ref(null)

defineExpose({
  // 滚动滚动条到最底部
  async setScrollTop() {
    await nextTick()
    let scrollTop = wrapRef.value.scrollHeight - wrapRef.value.clientHeight
    if(scrollTop > 0) {
      wrapRef.value.scrollTop = scrollTop
    }   
  },
})

</script>

<template>
  <div
    ref="wrapRef"
    :style="{ 
      'flex-direction': props.flexDirection, 
      'max-height': wrapHeightMap[props.operateType] + 'px',
      ...attrs.style
    }"
    :class="{ 'fold-wrap': true, 'is-fold': isFold, [`${props.operateType}-wrap`]: true }"
  >
    <slot></slot>
    <!-- 折叠图标 -->
    <div class="fold-icon" @click="isFold = !isFold">{{ isFold ? '展开' : '收起' }}</div>
  </div>
</template>

<style lang="less" scoped>
.fold-wrap {
  background: #ffffff;
  flex-shrink: 0;
  overflow: auto;
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  position: relative;

  .fold-icon {
    color: #2b67ff;
    display: inline-block;
    padding: 0 26px 0 12px;
    position: absolute;
    top: 12px;
    right: 16px;
    cursor: pointer;
    &::after {
      content: '';
      width: 10px;
      height: 10px;
      display: inline-block;
      background: url(@/assets/icons/top-arraw-icon.png) center/cover;
      position: absolute;
      top: 5px;
      right: 12px;
    }
  }

  &.add-wrap{
    .fold-icon{
      // display: none;
    }
  }

  &.is-fold {
    height: 56px;
    overflow: hidden;
    .fold-icon {
      &::after {
        background-image: url(@/assets/icons/down-arraw-icon.png);
      }
    }
  }
}
</style>
