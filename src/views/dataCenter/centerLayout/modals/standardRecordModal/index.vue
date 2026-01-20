<template>
    <myModal :modalName="t('dataStandard.standardRecord')" @onCancel="onCancel" :showBottom="false" width="640px">
      <template #modal-body>
        <div class="tableWrap">
          <a-spin :spinning="spinning">
            <div class="tableContainer">
              <table v-if="dataTableList.length">
                <tr>
                  <td>序号</td>
                  <td>来源标准表</td>
                  <td>执行状态</td>
                  <td>任务开始时间</td>
                  <td>任务结束时间</td>
                  <td>异常字段</td>
                  <td>操作人</td>
                  <td>详情</td>
                </tr>
                <tr v-for="(item, index) in dataTableList">
                  <td>{{ index + 1 + (current-1)*pageSize }}</td>
                  <td :title="item.standardTableName">{{ item.standardTableName }}</td>
                  <td :title="item.taskStatus">{{ item.taskStatus ? '已完成' : '进行中' }}</td>
                  <td :title="formatTime(item.taskStartTime)">{{ formatTime(item.taskStartTime) }}</td>
                  <td :title="formatTime(item.taskEndTime)">{{ formatTime(item.taskEndTime) }}</td>
                  <td :title="item.dataNum">{{ item.dataNum }}</td>
                  <td :title="item.operator">{{ item.operator }}</td>
                  <td class="detail" @click="goTaskCenter">{{ t('excel.goTaskCenter') }}</td>
                </tr>
              </table>
              <noData v-else/>
            </div>
            <div class="pageWrap" v-if="total > pageSize">
              <a-pagination
                v-model:current="current"
                :total="total"
                :pageSize="pageSize"
                show-less-items
                @change="getList"
              />
            </div>
          </a-spin>
        </div>
      </template>
    </myModal>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore'
import { formatTime } from '@/utils/utils'
import { standardRecordTableList } from '@/apis/dataStandard'
import noData from '@/components/noData'
import { useRouter } from 'vue-router'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const { t } = useI18n()
const emits = defineEmits(['modalCancel'])

const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)
const router = useRouter()
const dataTableList = ref([])
const current = ref(1)
const total = ref(1)
const spinning = ref(false)
const pageSize = ref(20)

onMounted(() => {
  getList()
})

const activeTableId = computed(() => {
    let activeData = {}
    if (indexTableActiveId.value.length) {
        activeData = indexTableActiveId.value.find(i => i.tabId === activeTabKey.value)
    }
    if (activeData) {
        return activeData.id
    } 
    return ''
})

const getList = async () => {
  spinning.value = true
  let api = standardRecordTableList
  const res = await  api({
    id: activeTableId.value,
    pageSize: pageSize.value,
    pageNum: current.value
  })
  if (res.code === 1) {
    if(res.data && res.data.records.length > 0 ){
      dataTableList.value = res.data.records
    } else {
      dataTableList.value = []
    }
    if(res.data) {
      total.value = res.data.total
    } 
  }
  spinning.value = false
}

const onCancel = () => {
  emits('modalCancel')
}

const goTaskCenter = () =>{
    emits('modalCancel')
    useApiManageStore.setTaskSearchType(0)
    useApiManageStore.setTaskHistoryDiff(0)
    useApiManageStore.initTaskList()
    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.TASK_CENTER)
    useApiManageStore.addApiTab({
        name: 'task.taskCenter',
        id: SYSTEM_MENU_MAP.TASK_CENTER,
        path: '/system/taskCenter',
    })
    router.push('/system/taskCenter')
}
</script>

<style lang="less" scoped>
.tableWrap {
  font-size: 13px;
  height: 427px;
  padding: 24px;
  padding-right: 0;
  .ant-spin-nested-loading{
    height: 100%;
    :deep(.ant-spin-container){
      height: 100%;
    }
  }
  .tableContainer {
    height: calc(100% - 50px);
    overflow-y: auto;
    padding-right: 24px;
    table {
      width: 100%;
      border-collapse: collapse;
      tr {
        &:nth-of-type(odd) {
          background-color: #f7faff;
        }
        &:first-of-type {
          font-weight: 600;
          background-color: #ecf3ff;
        }
        th,
        td {
          max-width: 200px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          padding: 10px 12px;
          border: 1px solid #e0ebff;
          width: calc(100% / 8);
        }
        .detail{
          color: #2B67FF;
          cursor: pointer;
          font-weight: 400;
        }
      }
    }
  }
  .pageWrap {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    &>ul{
      display: flex;
    }
  }
}
</style>
