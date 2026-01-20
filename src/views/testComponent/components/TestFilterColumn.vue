<script setup>
import { filterOption, columnsInfo } from '../filterData'
import filterColumn from '@/components/filterColumn/index.vue'
import { getimgType, getCodeType } from '@/utils/utils'

const filterRef = shallowRef()

const filterColumns = computed(() => {
  // 添加字段类型
  columnsInfo.forEach(item => {
    item.imgType = getimgType(item.columnType)
    item.type = getCodeType(item.columnType)
    item.dataIndex = item.columnName
  })
  return columnsInfo
})

// 字段筛选所需字段信息
provide('FILTER_COLUMNS', {
  allColumns: filterColumns.value
})

const getFilterOption = () => {
  filterRef.value.removeTrashKey()
  let filterInfo = filterRef.value.getFilterData()
  console.log('filterInfo', filterInfo)
}
</script>

<template>
  <div class="tips-wrap">
    <span>字段筛选测试</span>
    <BiButton type="link" @click="getFilterOption">获取筛选参数</BiButton>
  </div>
  <filterColumn ref="filterRef" />
</template>

<style lang="less" scoped>
.tips-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
