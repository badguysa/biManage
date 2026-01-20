<script setup>
import mainArea from '../layouts/mainArea.vue'
import { message } from 'ant-design-vue'
import basePagination from '@/components/pagination/base.vue'
import headDropDown from '@/components/tableHeadDropdown'

const tableColumns = [
  {
    title: '数据资源表名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime'
  },
  {
    title: '授权时间',
    dataIndex: 'authTime',
    key: 'authTime'
  },
  {
    title: '申请状态',
    dataIndex: 'applyStatus',
    key: 'applyStatus'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate'
  }
]

const applyStatusList = [
  { label: '待审批', value: 0 },
  { label: '已通过', value: 1 },
  { label: '未通过', value: 2 },
  { label: '已撤销', value: 3 }
]

const operateType = ref('add')

const spinning = ref(false)

const tableData = ref([])

const params = reactive({
  kw: '',
  pageNum: 1,
  pageSize: 12,
  total: 0
})

onMounted(() => {
  getDataSourceList()
})

const getDataSourceList = () => {
  return
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
        it.lastUpdate = formatTime(it.lastUpdate)
        return it
      })
    }
  })
}

const operateFn = (type, item) => {}

const updateCheckFn = (value) => {
  console.log('value', value)
}
</script>

<template>
  <mainArea :showTopArea="false">
    <div class="search-wrap">
      <BiInput canSearch v-model="params.kw" placeholder="搜索" />
      <div class="apply-record">
        <BiIcon name="plane" />
        <span>提交记录 </span>
      </div>
    </div>

    <div class="table-container">
      <a-spin :spinning="spinning">
        <BiTable :columns="tableColumns" :dataSource="tableData">
          <template #headerCell="{ column }">
            <headDropDown
              v-if="column.key === 'applyStatus'"
              :checkList="applyStatusList"
              @updateCheck="updateCheckFn"
              title="申请状态"
            />
          </template>
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'applyStatus'">
              <span>异常数 </span>
            </div>
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
      @change="getDataSourceList"
    />
  </mainArea>
</template>

<style lang="less" scoped>
.mainArea {
  padding: 16px;
  .search-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    .bi-input-wrap {
      width: 220px;
    }
    .apply-record {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #2b67ff;
      gap: 4px;
      cursor: pointer;
    }
  }

  .table-container {
    height: calc(100% - 130px);
    overflow: auto;
    .operate-wrap {
      display: flex;
      white-space: nowrap;
      gap: 16px;
    }
  }
}
</style>
