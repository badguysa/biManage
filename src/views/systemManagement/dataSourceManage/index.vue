<script setup>
import { ref, onMounted, computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { modalStore } from '@/Stores/modalStore';
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { getDataSourceList, deleteDataSource, getSourceInfo, changeSourceStatus } from '@/apis/dataSourceManage'
import { formatTimeToSecond } from '@/utils/utils'
import { dataSourceMap } from '@/utils/enums'
import myButton from '@/components/buttons/myButton.vue'
import mySelect from '@/components/select/index.vue'
import noData from '@/components/noData'
import dataTableModal from '../components/dataSource/modal/dataTableModal.vue'
import addDataSourceModal from '../components/dataSource/modal/addDataSourceModal.vue'
import apiParamsModal from '@/views/dataCenter/centerLayout/modals/apiParamsModal'
import apiParamsDelModal from '@/views/dataCenter/centerLayout/modals/apiParamsDelModal'
import createDialog from '@/utils/dialog'
import apiImportPage from '@/views/dataCenter/centerLayout/mainArea/apiImport/index'

const useModalStore = modalStore()

const {
  apiParamsModalVisible,
  apiParamsDelModalVisible
} = storeToRefs(useModalStore)

const { t } = useI18n()

const checkList = ref([
  {
    id: 'DBSource',
    label: 'DB数据源',
    value: 1,
    checked: true
  },
  {
    id: 'APISource',
    label: 'API数据源',
    value: 2,
    checked: true
  },
  {
    id: 'KafkaSource',
    label: 'Kafka',
    value: 4,
    checked: true
  }
])

const current = ref(1)
const total = ref(1)
const spinning = ref(false)

const showDataModal = ref(false)

const showDataSource = ref(false)
const showApiDataSource = ref(false)

const sourceSearchValue = ref()

const router = useRouter()

const checkType = ref('1,2,4') // 默认选中值

const tableHead = [
  '数据源名称',
  '数据源类型',
  '数据源参数',
  '应用数据表',
  '创建人',
  '创建时间',
  '更新时间',
  '操作',
]
const pageSize = 12

const sourceList = ref([])

const sourceId = ref('')

// 弹窗模式:  add | editAPI | editDB | editKafka
const modalMode = ref('add')

const sourceInfo = ref(null)

provide('dataSourceInfo', sourceInfo)
provide('modalMode', modalMode)

onMounted(() => {
  getSourceList()
})

watch(() => sourceSearchValue.value, () => {
  getSourceList()
})

// 编辑db api 跳转数据源使用
watch(router.currentRoute, (route) => {
  if(route?.query?.sourceName) {
    sourceSearchValue.value = route.query.sourceName
  }
}, {
  immediate: true
})

const getSourceList = () => {
  spinning.value = true
  getDataSourceList({
    pageNum: current.value,
    kw: sourceSearchValue.value ?? undefined,
    pageSize,
    checks: checkType.value
  }).then((res) => {
    if(res.code === 1) {
      sourceList.value = res.data?.records || []
      total.value = parseInt(res.data.total)
    } else {
      message.error(res.message)
    }
    spinning.value = false
  })
}

const changeType = () => {
  current.value = 1
  // 未选择数据源类型
  if(checkType.value === -1) {
    sourceList.value = []
    return
  }
  getSourceList()
}

const addDataSource = () => {
  modalMode.value = 'add'
  sourceInfo.value = null
  showDataSource.value = true
}

// 查看数据源信息
const checkDataSource = async (item) => {
  let sourceType = dataSourceMap[item.sourceType?.value]
  
  if(sourceType === 'API') {
    modalMode.value = 'editAPI'
  } else if(sourceType === 'Kafka') {
    modalMode.value = 'editKafka'
  } else {
    modalMode.value = 'editDB'
  }

  let res = await getSourceInfo({id: item.id})

  if(res.code === 1) {
    sourceInfo.value = res.data
    if(modalMode.value === 'editDB') {
      sourceInfo.value.dbId = item.id
      showDataSource.value = true
    } else if(modalMode.value === 'editKafka') {
      sourceInfo.value.kafkaId = item.id
      showDataSource.value = true
    } else {
      sourceInfo.value.apiId = item.id
      showApiDataSource.value = true
    }
  }
}

const switchShowApiDataSource = () => {
  showApiDataSource.value = !showApiDataSource.value
}

const checkDataTable = (item) => {
  sourceId.value = item.sourceId
  showDataModal.value = true
}

const operateFn = (item) => {
  const dialogTips = {
      title: '提示',
      content: `禁止后，该数据源导入的数据表都将停止更新改为禁止状态，启用后禁止过程中产生的数据可能不会更新。确认禁止“${item.sourceName}” ？`,
      okText: '禁止',
      cancelText: '取消',
      confirmDelay: 3,
  }

  if(item.sourceStatus === 1) { // 启用
    dialogTips.okText = '启用'
    dialogTips.content = `启用后，该数据源导入的数据表更新策略恢复为禁止前的状态，禁止过程中产生的数据可能不会更新。确定启用“${item.sourceName}” ？`
    dialogTips.confirmDelay = 0
  } 

  createDialog(dialogTips)
    .then(() => {
      changeSourceStatus({
        id: item.id
      }).then((res) => {
        if(res.code === 1) {
          getSourceList()
        } else {
          message.error(res.message)
        }
      })
    }).catch(() => {})
}

const deleteFn = (item) => {
  createDialog({
    title: '提示',
    content: `删除后，该数据源导入的所有数据表都将停止更新并无法恢复。确认删除“${item.sourceName}” ？`,
    okText: '删除',
    cancelText: '取消',
  }).then(() => {
    deleteDataSource({
      ids: item.id
    }).then(() => {
      getSourceList()
    })
  }).catch(() => {})
}

const pageChange = () => {
  getSourceList()
}

const closeDataSourceModal = () => {
  showDataSource.value = false
}

const selectFn = (val) => {
  checkType.value = val
  changeType()
}

</script>

<template>
  <div class="mainPage"  v-if="!showApiDataSource">
    <div class="topWrap">
      <span>{{ t('dataSource.dataSourceManage') }}</span>
    </div>
    <div class="checkContainer">
      <div class="checkWrap">
        <div class="search">
            <input type="text" v-model.trim="sourceSearchValue" :placeholder="t('common.search')">
            <img class="sear" src="@/assets/icons/search.png" alt="">
        </div>
        <mySelect :dataOptions="checkList" @select="selectFn" placeholder="请选择数据源类型"></mySelect>
      </div>
      <myButton @click="addDataSource">
        <BiIcon name="addSymbol" color="#2B67FF"></BiIcon>新建数据源
      </myButton>
    </div>
    <div class="tableWrap">
      <a-spin :spinning="spinning">
        <table v-if="sourceList.length">
          <tr>
            <th v-for="it in tableHead">{{ it }}</th>
          </tr>
          <tr v-for="item in sourceList" :class="{disabled: item.sourceStatus === 1}">
            <td :title="item.sourceName"><div class="desc">{{ item.sourceName }}</div></td>
            <td>{{ item.sourceType.description }}</td>
            <td class="dataSrouce" @click="checkDataSource(item)">点击查看</td>
            <td class="dataTable" @click="checkDataTable(item)">{{ item.tableCount ?? 0 }}</td>
            <td>{{ item.creatorName }}</td>
            <td>{{ formatTimeToSecond(item.createTime) }}</td>
            <td>{{ formatTimeToSecond(item.updateTime) }}</td>
            <td class="operate">
              <span @click="operateFn(item)">{{ item.sourceStatus === 0 ? '禁止' : '启用' }}</span>
              <span @click="deleteFn(item)">删除</span>
            </td>
          </tr>
        </table>
        <noData v-else/>
      </a-spin>
    </div>
    <div class="pageWrap" v-if="total > 12">
      <a-pagination
        v-model:current="current"
        :total="total"
        :pageSize="pageSize"
        show-less-items
        @change="pageChange"
      />
    </div>
  </div>

  <!-- 应用数据表弹窗 -->
  <dataTableModal v-if="showDataModal" @modalCancel="showDataModal = false" :sourceId="sourceId"/>

  <!-- 新建/编辑 数据源弹窗 -->
  <addDataSourceModal
    v-if="showDataSource" 
    :modalMode="modalMode"
    @cancel="closeDataSourceModal" 
    @updateList="getSourceList"
    @goBack="switchShowApiDataSource"
  />

  <!-- API导入 参数设置 -->
  <apiParamsModal v-if="apiParamsModalVisible" />

  <!-- API导入 删除参数 -->
  <apiParamsDelModal v-if="apiParamsDelModalVisible" />
  <!-- api导入 -->
  <div v-if="showApiDataSource">
    <apiImportPage :style="{height: `calc(100vh - 120px)`}" @goBack="switchShowApiDataSource"></apiImportPage>
  </div>
</template>

<style lang="less" scoped>
.mainPage {
  height: calc(100% - 36px);
  padding: 20px 30px 30px 30px;
  background-color: #fff;
  position: relative;
  .topWrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      font-size: 18px;
      font-weight: 600;
    }
  }
  .checkContainer{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .checkWrap {
      margin: 16px 0;
      display: flex;
      gap: 20px;
      .checkItem {
        display: flex;
        align-items: center;
        input {
          width: 14px;
          height: 14px;
          margin-right: 6px;
          appearance: none;
          background: url(@/assets/icons/not_select.png) center / cover;
          cursor: pointer;
          &:checked {
            background-image: url(@/assets/icons/is_select.png);
          }
        }
        label {
          cursor: pointer;
          font-size: 13px;
          font-weight: 400;
        }
      }
      .search {
          width: 210px;
          // height: 46px;
          padding: 8px 12px;
          padding-left: 0;
          position: relative;
          input {
              width: 176px;
              height: 30px;
              padding-right: 33px;
          }
          .sear {
              width: 16px;
              position: absolute;
              top: 15.2px;
              right: 40.6px;
              cursor: pointer;
          }
          .clear {
              position: absolute;
              top: 15.5px;
              right: 46.6px;
              width: 16px;
              cursor: pointer;
          }
      }
    }
    button {
      display: flex;
      align-items: center;
      svg {
        width: 20px;
        height: 20px;
        margin-right: 2px;
      }
    }
  }
  .tableWrap {
    height: calc(100% - 106px);
    overflow: auto;
    font-size: 13px;
    color: #000000cc;
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
        th {
          text-align: left;
        }
        th,
        td {
          padding: 10px 12px;
          border: 1px solid #e0ebff;
          .desc{
            max-width: 200px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }

          &.dataSrouce,
          &.dataTable,
          &.operate > span {
            cursor: pointer;
            color: #2b67ff;
          }
          &.operate {
            span:first-of-type {
              margin-right: 16px;
            }
          }
        }
        &.disabled{
          td:first-of-type,
          td:nth-of-type(2),
          td:nth-of-type(5),
          td:nth-of-type(6){
            opacity: 0.5;
          }
        }
      }
    }
  }
  .pageWrap {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
