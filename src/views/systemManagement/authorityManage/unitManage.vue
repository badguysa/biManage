<script setup>
import { message } from 'ant-design-vue'
import basePagination from '@/components/pagination/base.vue'
import headDropDown from '@/components/tableHeadDropdown'
import createDialog from '@/utils/dialog'
import tips from '@/components/tips'
import addUnitModal from './addUnitModal.vue'
import {
  getApiAuthList,
  deleteApiAuth,
  toggleApiStatus
} from '@/apis/apiAuth'

const requestParams = reactive({
  sw: '',
  pageNum: 1,
  pageSize: 12,
  total: 0
})

const spinning = ref(false)
const showAddModal = ref(false)
const tableData = ref([])
// 编辑信息
const editInfo = ref(null)

const tableColumns = [
  {
    title: '单位名称',
    dataIndex: 'unitName',
    key: 'unitName'
  },
  {
    title: '单位ID',
    dataIndex: 'unitFid',
    key: 'unitFid'
  },
  {
    title: '使用人',
    dataIndex: 'accessUser',
    key: 'accessUser'
  },
  {
    title: '手机号',
    key: 'phone',
    dataIndex: 'phone'
  },
  {
    title: '授权IP ',
    key: 'accessIp',
    dataIndex: 'accessIp'
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'enable'
  },
  {
    title: '操作',
    key: 'operate'
  }
]

const checkInfo = ref(null)
const statusList = reactive([
  { label: '已启用', value: 1 },
  { label: '已禁用', value: 0 }
])

onMounted(() => {
  getUnitList()
})

const getUnitList = async () => {
  let enable = undefined
  if (checkInfo?.value) {
    enable = checkInfo.value.length > 1 ? undefined : checkInfo.value[0]
  }

  spinning.value = true

  try {
    let res = await getApiAuthList({
      pageNum: requestParams.pageNum,
      pageSize: requestParams.pageSize,
      sw: requestParams.sw,
      // 禁用:0 启用: 1
      enable: enable
    })
    if (res.code !== 1) return message.error(res.message)
    requestParams.total = Number(res.data?.total)
    tableData.value = res.data?.records ?? []
  } catch (e) {
    console.log('get unit list error', e)
  }
  spinning.value = false
}

const operateFn = async (type, item) => {
  switch (type) {
    case 'edit':
      editInfo.value = item
      showAddModal.value = true
      break
    case 'toggle':
      // 更改状态
      let res = await toggleApiStatus({
        id: item.id
      })
      if (res.code != 1) message.error(res.message)
      message.success(res.message)
      getUnitList()
      break
    case 'delete':
      createDialog({
        title: '提示',
        content: `确定删除？`,
        okText: '删除',
        cancelText: '取消'
      })
        .then(async () => {
          let res = await deleteApiAuth({ ids: item.id })
          if (res.code != 1) message.error(res.message)
          message.success(res.message)
          getUnitList()
        })
        .catch(() => {})
      break
    default:
      break
  }
}

const updateCheckFn = value => {
  checkInfo.value = value
  requestParams.pageNum = 1
  getUnitList()
}

const inputFn = () => {
  requestParams.pageNum = 1
  getUnitList()
}

const confirmFn = () => {
  showAddModal.value = false
  getUnitList()
}

defineExpose({
  showAddModal: () => {
    showAddModal.value = true
    editInfo.value = null
  }
})
</script>

<template>
  <div class="table-container">
    <BiInput
      style="width: 220px"
      canSearch
      placeholder="搜索"
      @input="inputFn"
      v-model="requestParams.sw"
    />
    <div class="table-wrap">
      <a-spin :spinning="spinning">
        <BiTable
          :columns="tableColumns"
          :dataSource="tableData"
          :row-class-name="_record => (_record.enable ? null : 'disabled-row')"
        >
          <template #headerCell="{ column }">
            <headDropDown
              v-if="column.key === 'status'"
              :checkList="statusList"
              @updateCheck="updateCheckFn"
              title="状态"
            />
            <div class="tips-container" v-else-if="column.key === 'operate'">
              <span>操作</span>
              <tips
                tipsPlacement="topLeft"
                tipsContent="禁用后，将同步关闭该单位全部API接口权限；启用则恢复"
              />
            </div>
          </template>
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'accessIp'">
              <span :title="record.accessIp">{{ record.accessIp }}</span>
            </div>
            <div v-if="column.key === 'status'">
              <span>{{ record.enable ? '已启用' : '已禁用' }}</span>
            </div>
            <div class="operate-wrap" v-else-if="column.key === 'operate'">
              <a @click="operateFn('edit', record)">编辑</a>
              <a @click="operateFn('toggle', record)">
                {{ record.enable ? '禁用' : '启用' }}
              </a>
              <a @click="operateFn('delete', record)">删除</a>
            </div>
          </template>
        </BiTable>
      </a-spin>
    </div>
  </div>

  <!-- 分页 -->
  <basePagination
    v-if="requestParams.total > requestParams.pageSize"
    v-model:current="requestParams.pageNum"
    :total="requestParams.total"
    :pageSize="requestParams.pageSize"
    show-less-items
    @change="getUnitList"
  />
  <addUnitModal
    :editInfo="editInfo"
    v-if="showAddModal"
    @cancel="showAddModal = false"
    @confirm="confirmFn"
  />
</template>

<style lang="less" scoped>
.table-container {
  overflow: hidden;
  flex-grow: 1;

  .tips-container {
    display: flex;
    gap: 4px;
    align-items: center;

    & > span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .operate-wrap {
    display: flex;
    white-space: nowrap;
    gap: 16px;
  }

  .table-wrap {
    margin-top: 16px;
    height: calc(100% - 60px);
    overflow-y: auto;
  }

  :deep(.disabled-row) {
    td > div {
      color: #00000033;
    }
  }
}

.pagination-wrap {
  text-align: center;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
