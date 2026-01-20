<template>
  <myModal :modalName="modalTitle" @onCancel="$emit('onCancel')" :showBottom="false" width="840px">
    <template #modal-name>
      <p class="colorDeep backBtn" @click="goBack">返回</p>
    </template>
    <template #modal-body>
      <div class="modalContainer">
        <div class="topBox">
          <Button @click="exportFn">{{ t('common.export')}}</Button>
          <span class="tips">下载有效期一周，请于{{ ddlTime }}前下载完成（异常数据总量最多展示{{ MAX_ERROR_NUM }}条）</span> 
        </div>
        <div class="tableWrapper">
          <!-- 异常数据详情 -->
          <tempalte v-if="!isDetail">
            <!-- JSON数组 -->
             <div class="tableContainer">
                <table v-if="dataList.length">
                  <tr>
                    <th v-for="head in tableHeadInfo">{{ head }}</th>
                  </tr>
                  <tr v-for="item in dataList">
                    <td>{{ item.fieldName }}</td>
                    <td>{{ item.msg }}</td>
                    <td class="count" @click="showDetail(item)">{{ errorCount(item) }}</td>
                  </tr>
                </table>
                <Empty v-else />
             </div>
          </tempalte>
          <!-- 异常数据任务结果详情 -->
          <preview-table 
            v-else
            :tableLoading="state.tableLoading" 
            :tableColumns="state.previewColumns"
            :tableData="state.previewData" 
            :showTip="false"
          />
        </div>
        <div class="bottomBox" v-if="dataList.length || state.previewColumns.length">
          <span>
            {{ t('pushManage.showHundredError') }}
          </span>
        </div>
      </div>
    </template>
  </myModal>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import Button from '@/components/buttons/myButton.vue'
import Empty from '@/components/empty'
import previewTable from '@/components/selfconfig/previewTable'
import { getCheckErrorData, getCheckTaskResultErrorData, exportCheckErrorData, exportCheckTaskResultErrorData} from '@/apis/task/index'
import { formatTimeToSecond, getimgType } from '@/utils/utils'

const { t } = useI18n()

const props = defineProps({
  sourceObj: {
    type: Object,
    default: '',
  },
})

const tableHeadInfo = ['异常字段', '异常信息', '异常数据量']
const isDetail = ref(false)
const dataList = ref([])
const totalDataCount = ref(0)

const state = reactive({
  tableLoading: false,
  previewColumns: [],
  previewData: [],
  totalDataCount: 0,
  originObj: {}
})

const MAX_ERROR_NUM = 1000

// 弹窗标题
const modalTitle = computed(() => {
    return isDetail.value ? '' : t('task.errorDataDetail')
})

// 到期时间转换 添加一周
const ddlTime = computed(()=>{
  let addWeekTimeStamp = Number(props.sourceObj.updateTime) + 604800000
  return formatTimeToSecond(addWeekTimeStamp)
})

onMounted(()=>{
  getData()
})

const getData = async()=>{
  const params = {
    taskId: props.sourceObj.id
  }
  const res = await getCheckErrorData(params)
  if(res.code === 1){
    if(res.data.records.length>0){
      dataList.value = res.data.records
      totalDataCount.value = res.data.total
    }
  }
}

const goBack = ()=>{
  isDetail.value = false
  getData()
}

const exportFn = async () => {
  let exportRes
  if(!isDetail.value) {
    const params1 = {
      taskId: props.sourceObj.id
    }
    exportRes = await exportCheckErrorData(params1)
  } else {
    const { attrId, bizAttrId } = state.originObj
    const params2 = {
      taskId: props.sourceObj.id,
      attrId,
      bizAttrId,
    }
    exportRes = await exportCheckTaskResultErrorData(params2)
  }
  const name = `${modalTitle.value}_${Date.now()}`
  const blob = new Blob([exportRes])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = name + '.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const showDetail = async (item)=>{
  if(item.count === '0') return
  isDetail.value = true
  state.originObj = item
  const { attrId, bizAttrId } = item
  const params = {
    taskId: props.sourceObj.id,
    attrId,
    bizAttrId,
    pageSize: 100
  }
  state.tableLoading = true
  const res = await getCheckTaskResultErrorData(params)
  if(res.code === 1){
    state.previewColumns = res.data.columns.map((item)=>{
      return {
        ...item,
        imgType: getimgType(item.columnType),
        dataIndex: item.columnName
      }
    })
    state.previewData = res.data.records
    state.totalDataCount = res.data.total 
  }
  state.tableLoading = false
}

const errorCount = (item) => {
  if(!item?.count) return '-'
  if(item.count === '0') return '-'
  if(item.count > MAX_ERROR_NUM) return MAX_ERROR_NUM + '+'
  return item.count
}

</script>
<style scoped lang="less">
.backBtn {
  cursor: pointer;
  color: #2B67FF;
  font-weight: 400;
}
.modalContainer {
  padding: 24px;
  .topBox {
    background-color: #fff;
    position: relative;
    .tips{
        color: #00000066;
        font-size: 12px;
        margin-left: 10px;
    }
  }
  .tableWrapper {
    height: 400px;
    overflow: auto;
    margin: 16px 0;
    .tableContainer{
      padding: 12px;
    }
    table {
      width: 100%;
      tr {
        th,
        td {
          border: 1px solid #e0ebff;
          padding: 12px;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.8);
          &:first-child {
            width: 40%;
          }
          &:nth-child(2) {
            width: 50%;
          }
          &:nth-child(3) {
            width: 10%;
          }
        }
        .count {
          color:#2B67FF;
          cursor: pointer;
        }
        th {
          text-align: left;
          background-color: #ecf3ff;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.6);
        }

        &:first-of-type {
          position: sticky;
          top: 0;
        }
        &:nth-of-type(odd) {
          background-color: #f7faff;
        }
      }
    }
    :deep(.tableContainer) {
      height: 100%;
    }
  }
  .bottomBox {
    & > span {
      color: #00000066;
      font-size: 12px;
      font-weight: 600;
      i {
        font-style: normal;
        color: #2b67ff;
      }
    }
    display: flex;
    justify-content: space-between;
  }
}
</style>