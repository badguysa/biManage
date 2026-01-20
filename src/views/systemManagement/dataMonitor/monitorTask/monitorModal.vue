<script setup>
import myModal from '@/components/myModal'
import { formatTime } from '@/utils/utils'
import {
  getTaskDatasourceList,
  getTaskDatasourceDetail,
  getTaskPushList,
  getTaskPushDetail
} from '@/apis/dataMonitor'
import basePagination from '@/components/pagination/base.vue'
import { statusMap } from './constants'

const props = defineProps(['cellType', 'cellInfo'])
const emits = defineEmits(['onCancel'])

const taskInfo = inject('MONITOR_TASK_INFO')
const selectedTab = inject('MONITOR_TAB_TYPE')
const dateStr = inject('MONITOR_DATE_STR')

const STATUS_MAP = {
  successNum: 'COMPLETED',
  failNum: 'FAILED',
  runningNum: 'RUNNING',
  notRunningNum: 'NOT_RUN'
}

const params = reactive({
  pageNum: 1,
  pageSize: 8,
  sw: '',
  day: dateStr.value,
  total: 0
})

const spinning = ref(false)

const columns = reactive([
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
])

const dataSource = ref([])

onMounted(() => {
  getTableData()
})

const getTableData = async () => {
  let requestRes = null

  let requestParams = {
    targetId: props.cellInfo.monitorItem.targetId,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    sw: params.sw,
    day: dateStr.value
  }

  spinning.value = true

  // 监控对象单独调用详情接口
  if (props.cellType === 'objectNum') {
    requestRes =
      selectedTab.value.key === 'dataSource'
        ? await getTaskDatasourceDetail(requestParams)
        : await getTaskPushDetail(requestParams)
  } else {
    if(selectedTab.value.key === 'pushTask') {
      requestParams.targetType = props.cellInfo.monitorItem.targetType
    }
    requestParams.taskStatus = STATUS_MAP[props.cellType]
    requestRes =
      selectedTab.value.key === 'dataSource'
        ? await getTaskDatasourceList(requestParams)
        : await getTaskPushList(requestParams)
  }

  if (requestRes.code === 1) {
    params.total = Number(requestRes.data.total)
    dataSource.value = requestRes.data.records || []
  }
  spinning.value = false
}
</script>

<template>
  <myModal
    :modalName="taskInfo.name"
    @onCancel="$emit('onCancel')"
    :showBottom="false"
    width="840px"
  >
    <template #modal-body>
      <div class="table-wrap">
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
                <div v-else>
                  {{ record[column.dataIndex] ? record[column.dataIndex] : '-' }}
                </div>
              </template>
            </BiTable>
          </a-spin>
        </div>
        <basePagination
          v-if="params.total > params.pageSize"
          v-model:current="params.pageNum"
          :total="params.total"
          :pageSize="params.pageSize"
          show-less-items
          @change="getTableData"
        />
      </div>
    </template>
  </myModal>
</template>

<style lang="less" scoped>
.table-wrap {
  padding: 24px;
  min-height: 500px;
  .table-container {
    max-height: 400px;
    overflow: auto;
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
  }
}
.pagination-wrap {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}
</style>
