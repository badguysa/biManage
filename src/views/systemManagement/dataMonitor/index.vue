<script setup>
import { getMonitorList, deleteDataMonitor, updateNotifyStatus } from '@/apis/dataMonitor'
import { formatTime } from '@/utils/utils'
import createDialog from '@/utils/dialog'
import mainArea from '../layouts/mainArea.vue'
import iconButton from '@/components/buttons/iconButton.vue'
import tips from '@/components/tips'
import addEdit from './addEdit'
import monitorTask from './monitorTask'
import { tableColumns } from './constants'
import { message } from 'ant-design-vue'
import basePagination from '@/components/pagination/base.vue'

const pageType = ref('list')

const operateType = ref('add')

const operateId = ref('')
const viewId = ref('')

const spinning = ref(false)

const tableData = ref([])

const params = reactive({
  pageNum: 1,
  pageSize: 12,
  total: 0
})

onMounted(() => {
  getMonitorListData()
})

const addDataMonitor = () => {
  pageType.value = 'operateMonitor'
  operateType.value = 'add'
}

const changeStatus = item => {
  updateNotifyStatus(item.id).then(res => {
    if (res.code !== 1) {
      message.error(res.message)
    }
  })
}

const getMonitorListData = () => {
  spinning.value = true
  getMonitorList({
    pageNum: params.pageNum,
    pageSize: params.pageSize
  }).then(res => {
    spinning.value = false
    if (res.code === 1 && res.data?.records) {
      params.total = Number(res.data.total)
      tableData.value = res.data.records.map(it => {
        it.key = it.id
        it.lastUpdate = it.lastUpdate ? formatTime(it.lastUpdate) : '-'
        return it
      })
    }
  })
}

const removeMonitor = id => {
  // 数据量-1刚好等于每页数据量的倍数 
  if((params.total - 1) % params.pageSize === 0) {
    // 当前页数-1
    params.pageNum -= 1
  }
  deleteDataMonitor(id).then(res => {
    if (res.code === 1) {
      getMonitorListData()
    }
  })
}

const operateFn = (type, item) => {
  switch (type) {
    case 'view':
      pageType.value = 'monitorTask'
      viewId.value = item.id
      break
    case 'edit':
      pageType.value = 'operateMonitor'
      operateType.value = 'edit'
      operateId.value = item.id
      break
    case 'delete':
      createDialog({
        title: '提示',
        content: `确定删除？`,
        okText: '删除',
        cancelText: '取消'
      })
        .then(() => {
          removeMonitor(item.id)
        })
        .catch(() => {})
      break
    default:
      break
  }
}

const backFn = (loadList = false) => {
  pageType.value = 'list'
  loadList && getMonitorListData()
}

const recipientsTitle = arr => {
  if (!Array.isArray(arr)) return
  return arr.map(it => it.name).join('、')
}
</script>

<template>
  <mainArea v-if="pageType === 'list'" pageTitle="数据监控">
    <template #topRight>
      <iconButton title="新建数据监控" @addFn="addDataMonitor" />
    </template>
    <div class="table-container">
      <a-spin :spinning="spinning">
        <BiTable
          :columns="tableColumns"
          :dataSource="tableData"
          :columnWidthInfo="{ notifyStatus: 8 }"
        >
          <template #headerCell="{ column }">
            <div class="tips-wrap" v-if="column.key === 'numberOfException'">
              <span>异常数 </span>
              <tips tipsContent="监控任务发生总异常次数" />
            </div>
            <div class="tips-wrap" v-else-if="column.key === 'lastUpdate'">
              <span>最近更新</span>
              <tips tipsContent="监控任务内，最近一次任务的执行结束时间" />
            </div>
            <div class="tips-wrap" v-else-if="column.key === 'notifySwitch'">
              <span>通知状态</span>
              <tips tipsContent="控制是否开启监控任务通知" />
            </div>
          </template>
          <template #bodyCell="{ column, record }">
            <a
              :title="record.name"
              v-if="column.key === 'name'"
              @click="operateFn('view', record)"
              >{{ record.name }}</a
            >
            <div
              :title="recipientsTitle(record.recipients)"
              v-else-if="column.key === 'recipients'"
            >
              <span v-for="(it, index) in record.recipients">
                {{ it.name }}
                <template v-if="index !== record.recipients.length - 1">、</template>
              </span>
            </div>
            <a-switch
              v-else-if="column.key === 'notifySwitch'"
              size="small"
              @click="changeStatus(record)"
              :checkedValue="1"
              :unCheckedValue="0"
              v-model:checked="record.notifySwitch"
            />
            <div class="operate-wrap" v-else-if="column.key === 'operate'">
              <a @click="operateFn('view', record)">查看监控任务</a>
              <a @click="operateFn('edit', record)">编辑</a>
              <a @click="operateFn('delete', record)">删除</a>
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
      @change="getMonitorListData"
    />
  </mainArea>
  <addEdit
    v-if="pageType === 'operateMonitor'"
    @back="backFn"
    :operateId="operateId"
    :operateType="operateType"
  />
  <monitorTask v-if="pageType === 'monitorTask'" :viewId="viewId" @back="backFn" />
</template>

<style lang="less" scoped>
.table-container {
  height: calc(100% - 130px);
  overflow: auto;
  .tips-wrap {
    display: flex;
    gap: 4px;
    align-items: center;
    & > span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .recipient-wrap {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .operate-wrap {
    display: flex;
    white-space: nowrap;
    gap: 16px;
  }
}

.pagination-wrap {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}
</style>
