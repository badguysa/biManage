<script setup>
import Table from '@/components/table/index'

const props = defineProps({
  tableColumns: Array,
  tableData: Array,
  tableLoading: {
    type: Boolean,
    default: false,
  },
  stepError: {
    // 步骤异常
    type: Boolean,
    default: false,
  },
  totalDataCount: {
    type: Number,
    default: 0
  },
  flag: {
    type: String,
    default: ''
  },
  showTip:{
    type: Boolean,
    default: true,
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="tableContainer">
    <div class="tips" v-if="!stepError && showTip">{{ t('common.previewNum') }}</div>
    <a-spin :spinning="tableLoading">
      <div class="tableWrap">
        <Table
          v-bind="$attrs"
          :flag="flag"
          :tableColumns="tableColumns" 
          :tableData="tableData"
          :missingFields="stepError" 
         />
      </div>
      <div class="total" v-if="totalDataCount">共<span>{{ totalDataCount }}</span>条数据</div>
    </a-spin>
  </div>
</template>

<style lang="less" scoped>
.tableContainer {
  padding: 12px;
  background-color: #fff;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
    line-height: 17px;
    text-align: right;
  }
  .ant-spin-nested-loading {
    height: calc(100% - 29px);
    :deep(.ant-spin-container) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
      .tableWrap {
        height: 100%;
        overflow: auto;
      }
      .total{
        font-size: 12px;
        color: rgba(0, 0, 0, 0.60);
        span{
          color: #2B67FF;
          margin: 0 6px;
        }
      }
    }
  }
}
</style>
