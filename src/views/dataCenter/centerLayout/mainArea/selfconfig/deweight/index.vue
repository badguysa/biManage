<script setup>
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { useErrorStep } from '@/hooks/selfConfig/useErrorStep'
import previewTable from '@/components/selfconfig/previewTable'
import selectColumns from './selectColumns.vue'

const useConfigStore = configStore()

const useMainStore = mainStore()

const { activeTabKey } = storeToRefs(useMainStore)

const { configUniqueData } = storeToRefs(useConfigStore)

const configData = computed(() => {
  return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})

const { previewData, previewColumns, tableLoading, totalDataCount, distinctDataLoaded } = toRefs(configData.value)

const { stepError } = useErrorStep()

</script>

<template>
  <div class="wrapper">
    <!-- 数据加载完毕后 开始渲染 -->
    <div class="top-area" v-if="distinctDataLoaded">
      <selectColumns />
    </div>
    <preview-table
      :tableLoading="tableLoading"
      :tableColumns="previewColumns"
      :tableData="previewData"
      :missingFields="stepError"
      :totalDataCount="totalDataCount"
    />
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  .top-area {
    padding: 12px 16px;
    background-color: #fff;
  }
}
</style>
