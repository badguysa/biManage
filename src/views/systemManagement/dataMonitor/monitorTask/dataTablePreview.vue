<script setup>
import basePagination from '@/components/pagination/base.vue'
import { formatTime } from '@/utils/utils'
import { monitorTypeMap, CARD_TYPES, statusMap } from './constants'
import {
  getTaskTableList,
  getTaskTableTaskList,
  getTaskTableTop10Duration
} from '@/apis/dataMonitor'
import { reactive } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps(['currentType', 'collectionId', 'dateStr'])
const emits = defineEmits(['setMonitorObjNum'])

const params = reactive({
  pageNum: 1,
  pageSize: 8,
  sw: '',
  total: 0
})

const spinning = ref(false)

const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '任务当前状态',
    dataIndex: 'taskStatus',
    key: 'taskStatus'
  },
  {
    title: '运行开始时间',
    dataIndex: 'start',
    key: 'start'
  },
  {
    title: '运行时长',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator'
  }
]

const dataSource = ref([])

onMounted(() => {
  getTableData()
})

watch([() => props.currentType, () => props.dateStr], () => {
  params.sw = ''
  params.pageNum = 1
  getTableData()
})

watch(
  () => params.sw,
  () => {
    getTableData()
  }
)

const getTableData = async () => {
  let requestRes = null

  let requestParams = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    sw: params.sw,
    day: props.dateStr,
    collectionId: props.collectionId
  }

  spinning.value = true
  switch (props.currentType) {
    case CARD_TYPES.MONITOR_OBJ:
      requestRes = await getTaskTableList(requestParams)
      break
    case CARD_TYPES.SUCCESS_NUM:
      requestParams.status = 'COMPLETED'
      requestRes = await getTaskTableTaskList(requestParams)
      break
    case CARD_TYPES.FAIL_NUM:
      requestParams.status = 'FAILED'
      requestRes = await getTaskTableTaskList(requestParams)
      break
    case CARD_TYPES.EXCUTING_NUM:
      requestParams.status = 'RUNNING'
      requestRes = await getTaskTableTaskList(requestParams)
      break
    case CARD_TYPES.UN_EXCUTE:
      requestParams.status = 'NOT_RUN'
      requestRes = await getTaskTableTaskList(requestParams)
      break
    case CARD_TYPES.EXCEPTION_ANALYZE:
      delete requestParams.pageNum
      delete requestParams.pageSize
      requestRes = await getTaskTableTop10Duration(requestParams)
      break
  }

  if (requestRes.code === 1) {
    params.total = Number(requestRes.data.total)
    dataSource.value = requestRes.data.records || []

    if (props.currentType === CARD_TYPES.MONITOR_OBJ) {
      emits('setMonitorObjNum', requestRes.data.total)
    }
  } else {
    message.error(requestRes.message)
  }
  spinning.value = false
}
</script>

<template>
  <div class="table-wrap">
    <div class="top-container">
      <div class="left-label">
        <p>{{ monitorTypeMap[currentType].label }}</p>
        <span>{{ monitorTypeMap[currentType].tips }}</span>
      </div>
      <BiInput style="width: 220px" v-model="params.sw" placeholder="请输入" canSearch />
    </div>
    <div class="table-container">
      <a-spin :spinning="spinning">
        <BiTable :columns="columns" :dataSource="dataSource">
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'start'">
              {{ record.start ? formatTime(record.start) : '-' }}
            </div>
            <div :class="record.taskStatus" v-else-if="column.key === 'taskStatus'">
              {{ statusMap[record.taskStatus] }}
            </div>
            <div v-else-if="column.key === 'duration'">
              {{ record.duration ? record.duration / 1000 + '秒' : '-' }}
            </div>
            <div v-else-if="column.key === 'operator'">
              {{ record.operator ? record.operator : '-' }}
            </div>
          </template>
        </BiTable>
      </a-spin>
    </div>
    <!-- 潜在异常分析 不显示分页 -->
    <basePagination
      v-if="props.currentType !== CARD_TYPES.EXCEPTION_ANALYZE && params.total > params.pageSize"
      v-model:current="params.pageNum"
      :total="params.total"
      :pageSize="params.pageSize"
      show-less-items
      @change="getTableData"
    />
  </div>
</template>

<style lang="less" scoped>
.table-wrap {
  margin-top: 30px;
  .top-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .left-label {
      display: flex;
      align-items: center;
      gap: 12px;
      p {
        font-weight: 600;
        font-size: 18px;
        color: #000000cc;
        margin: 0;
      }
      span {
        font-size: 12px;
        color: #00000066;
      }
    }
  }

  .COMPLETED {
    color: #00b42a;
  }
  .FAILED {
    color: #f53f3f;
  }
  .RUNNING {
    color: #ff7d00;
  }
  .NOT_RUN {
    color: #000000cc;
  }

  .pagination-wrap {
    position: absolute;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
  }
}
</style>
