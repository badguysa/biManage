<script setup>
import basePagination from '@/components/pagination/base.vue'
import monitorModal from './monitorModal.vue'
import { getTaskDatasourceSummary, getTaskPushSummary } from '@/apis/dataMonitor'

const props = defineProps(['type', 'dateStr', 'collectionId'])

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  sw: '',
  total: 0
})

const spinning = ref(false)

const columns = reactive([
  {
    title: '数据源名称',
    dataIndex: 'dataSourceName',
    key: 'dataSourceName'
  },
  {
    title: '监控对象数',
    dataIndex: 'objectNum',
    key: 'objectNum'
  },
  {
    title: '运行成功任务数 ',
    dataIndex: 'successNum',
    key: 'successNum'
  },
  {
    title: '运行失败任务数',
    dataIndex: 'failNum',
    key: 'failNum'
  },
  {
    title: '运行中任务数',
    dataIndex: 'runningNum',
    key: 'runningNum'
  },
  {
    title: '未运行对象',
    dataIndex: 'notRunningNum',
    key: 'notRunningNum'
  }
])

const dataSource = ref([])

const showModal = ref(false)
const viewType = ref('')
const viewInfo = ref({})

onMounted(() => {
  updateName()
  getTableData()
})

watch(
  () => props.dateStr,
  () => {
    params.pageNum = 1
    getTableData()
  }
)

watch(
  () => props.type,
  () => {
    updateName()
    params.pageNum = 1
    getTableData()
  }
)

const updateName = () => {
  if (props.type === 'dataSource') {
    columns[0].title = '数据源名称'
  } else if (props.type === 'pushTask') {
    columns[0].title = '推送集合名称'
  }
}

const getTableData = async () => {
  if(!props.type) return
  
  let requestRes = null

  let requestParams = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    sw: params.sw,
    day: props.dateStr,
    collectionId: props.collectionId
  }

  spinning.value = true

  if (props.type === 'dataSource') {
    requestRes = await getTaskDatasourceSummary(requestParams)
  } else if (props.type === 'pushTask') {
    requestRes = await getTaskPushSummary(requestParams)
  }

  if (requestRes.code === 1) {
    params.total = Number(requestRes.data.total)
    dataSource.value = requestRes.data.records || []
  }
  spinning.value = false
}

const viewInfoFn = (dataIndex, record) => {
  showModal.value = true
  viewType.value = dataIndex
  viewInfo.value = record
}
</script>

<template>
  <div class="table-container">
    <a-spin :spinning="spinning">
      <BiTable :columns="columns" :dataSource="dataSource">
        <template #bodyCell="{ column, record }">
          <div :title="record.dataSourceName" v-if="column.key === 'dataSourceName'">
            {{ record.dataSourceName }}
          </div>
          <a @click="viewInfoFn(column.dataIndex, record)" v-else>{{
            record[column.dataIndex]
          }}</a>
        </template>
      </BiTable>
    </a-spin>
    <basePagination
      v-if="params.total > params.pageSize"
      v-model:current="params.pageNum"
      :total="params.total"
      :pageSize="params.pageSize"
      show-less-items
      @change="getTableData"
    />
  </div>
  <monitorModal
    v-if="showModal"
    @onCancel="showModal = false"
    :cellType="viewType"
    :cellInfo="viewInfo"
  />
</template>

<style lang="less" scoped>
.pagination-wrap {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}
</style>
