<script setup>
const props = defineProps({
  tipsType: {
    type: String,
  },
  tipsContent: {
    type: String,
  },
  tipsPlacement: {  // 自定义提示内容
    type: String,
    default: 'top',
  },
  getContainer: {  // getPopupContainer是否使用parentElement
    type: Boolean,
    default: false,
  },
})

const TIPS_MAP = {
  totalCallNum: '中台创建的全部API接口，当天被请求的次数',
  createAPINum: '当前中台创建的API接口总数',
  importAPIExecptionNum: '导入中台的API接口，当天的异常次数',
  callExecptionNum: '中台创建的API接口，当天被请求异常的次数',
  apiSitution: '导入中台的全部API接口，当天的运行情况',
  dataSetApiMonitor: '按分组监控分组内数据表创建的全部API接口，当天被请求的次数和详细情况',
  timeCosumeTop5: '导入中台的全部API接口，当天连接耗时排行最长前5',
  failedNumTop5: '导入中台的全部API接口，当天连接失败次数最高前5',
}

const getPopupContainer = trigger => {
  return props.getContainer?trigger.parentElement:document.body
}
</script>

<template>
  <div class="tips-wrap">
    <a-tooltip :placement="tipsPlacement" :getPopupContainer="getPopupContainer">
      <template #title>
        <span>{{ tipsContent ?? TIPS_MAP[tipsType] }}</span>
      </template>
      <img :class="{tips_icon: true, pos_abs: !tipsContent}" src="@/assets/icons/tips-small-icon.png" alt="" />
    </a-tooltip>
  </div>
</template>

<style lang="less" scoped>
.tips-wrap{
  display: flex;
}
.tips_icon {
  width: 15px;
  height: 15px;
  &.pos_abs{
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
