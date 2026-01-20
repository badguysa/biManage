<template>
  <div class="iframWrap">
    <iframe :src="bigScreenUrl" frameborder="0"></iframe>
  </div>
</template>
<script setup>

const useMainStore = mainStore()
const { mirrorInfo } = storeToRefs(useMainStore)

const defaultUrl = '//mh.chaoxing.com/v2/big-screen'

// 镜像单位 大屏地址从接口获取
const bigScreenUrl = computed(() => {
  if (mirrorInfo.value.mirror) {
    return mirrorInfo.value.bigScreenUrl || defaultUrl
  }
  return defaultUrl
})


</script>
<style lang="less" scoped>
.iframWrap {
  height: calc(100% - 36px);
  background-color: #fff;

  &>iframe {
    width: calc(100vw - 220px);
    height: 100%;
  }
}
</style>