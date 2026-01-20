<script setup>
import { modalStore } from '@/Stores/modalStore';
import useGuide from '../useGuide.vue';
import regularUpdateModal from '@/views/dataCenter/centerLayout/modals/regularUpdateModal/regularUpdate'

// 异步加载组件全局搜索弹窗
const globalSearchModal = defineAsyncComponent(() => import('@/views/dataCenter/centerLayout/modals/globalSearchModal/index.vue'))
const useModalStore = modalStore()
const { globalSearchModalVisible, regularUpdateModalVisible, regularUpdateModalid } = storeToRefs(useModalStore)

</script>
<template>
  <!-- 搜索弹窗 -->
  <globalSearchModal v-if="globalSearchModalVisible"/>

  <!-- 定时更新弹窗 -->
  <regularUpdateModal :pageId="regularUpdateModalid" v-if="regularUpdateModalVisible"/>

  <!-- 使用指南悬浮球 -->
  <useGuide/>
</template>