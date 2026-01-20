<script setup>
import useRegularUpdate from '@/hooks/dataCenter/useRegularUpdate'
const useModalStore = modalStore()
const useMainStore = mainStore()

// 定时更新逻辑处理
const { uuid } = useRegularUpdate(props.setType)
const regularUpdateInfo = ref({
  tips: '每隔 1 天，从 0 点 0 分 开始更新',
  cronStr:'0 0 0 0/1 * ?'
})
const targetPolicy = ['INCR_UPDATE', 'FULL_UPDATE', 'API_UPDATE_PULL', 'API_INCR_APPEND', 'FULL_PUSH']
const props = defineProps({
  updatePolicy: {
    type: String,
    required: true
  },
  setType: {  // 设置定时更新类型
    type: String
  }
})

// 展示更新频率
const showUpdateRate = computed(() => {
  let result = targetPolicy.includes(props.updatePolicy)
  if(result){
    regularUpdateInfo.value = useMainStore.getRegularUpdateInfo(uuid.value)    
  }
  return result
})

const editRateFn = () => {
  useModalStore.changeRegularUpdateModalVisible(uuid.value)
}
defineExpose({
  uuid,
  reset() {
    regularUpdateInfo.value = {
      tips: '每隔 1 天，从 0 点 0 分 开始更新',
      cronStr:'0 0 0 0/1 * ?'
    }
  }
})
</script>

<template>
  <div v-if="showUpdateRate" class="updateWrap">
    <div class="label">定时更新</div>
    <div class="editWrap">
      <span class="tips" :title="regularUpdateInfo?.tips">{{ regularUpdateInfo?.tips }}</span>
      <span class="editRate" @click="editRateFn">编辑</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.updateWrap {
  height: 18px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 13px;
  margin-bottom: 8px;
  .label{
    flex-shrink: 0;
  }
  .editWrap {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    .tips{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .editRate {
      color: #2b67ff;
      margin-left: 20px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
      &::before {
        content: '';
        display: inline-block;
        width: 14px;
        height: 14px;
        background: url(@/assets/icons/edit1.png) center/cover;
      }
    }
  }
}
</style>
