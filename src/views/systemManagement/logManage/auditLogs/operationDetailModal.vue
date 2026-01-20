<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import { getOperationDetailList } from '@/apis/logManage';
import noData from '@/components/noData'
import { getRuleTextLoop} from '@/hooks/dataStandard/useGetRuleText.js'
import { fieldTypeList } from '@/constants/dataStandard.js'

const { t } = useI18n()

const emits = defineEmits(['modalCancel'])
const props = defineProps(['sourceObj'])

const dataTableList = ref([])

const current = ref(1)
const total = ref(1)
const spinning = ref(false)
const pageSize = ref(20)

onMounted(() => {
  getList()
})

// 获取标准校验规则文本
const getRuleLabel = (value) => {
  if(!value) return ''
  let labels = []
  try {
    let obj = JSON.parse(value)
    let rules = getRuleTextLoop(t, {selfConfigWhere: obj}, false)
    labels = rules.map(rule => {
      let label = rule.text
      if(rule.showLogic && !rule.isLast) {
        label += rule.logic
      }
      return label
    })
  } catch(e) {
    console.log('parse error', e)
  }
  return labels.reduce((cur, pre) => cur + pre, '')
}

// 转换字段类型 CHARACTER: 字符
const convertTypeValue = (targetValue) => {
  let target = fieldTypeList.find(it => it.value === targetValue)
  if(target) {
    return t(target.label)
  }
  return targetValue
}

const getList = () => {
  spinning.value = true
  getOperationDetailList(props.sourceObj.id, {
    pageSize: pageSize.value,
    pageNum: current.value
  }).then((res) => {
    if(res.code === 1) {
      dataTableList.value = res.data.records || []
      dataTableList.value.map(it => {
        it.newValue = convertTypeValue(it.newValue)
        it.oldValue = convertTypeValue(it.oldValue)
        if(it.fieldName.includes('校验规则')) {
          it.newValue = getRuleLabel(it.newValue)
          it.oldValue = getRuleLabel(it.oldValue)
        }
      })
      total.value = Number(res.data.total)
    }
    spinning.value = false
  })
}

const openOrCloseMap = {
  0: '关闭',
  1: '开启',
}

// type 1:旧值  2:新值
const getVal = (item, type) => {
  const { newValue, oldValue } = item;
  const { bizType } = props.sourceObj;

  // 不确定是否是数字还是字符串 使用 ==
  const isOpenOrClose = (value) => value == 1 || value == 0;

  if (type === 1) {
    if (isOpenOrClose(newValue)) {
      return bizType === '用户管理' ? (newValue == 1 ? '开启' : '关闭') : openOrCloseMap[oldValue];
    }
    return oldValue;
  } else if (type === 2) {
    if (isOpenOrClose(newValue)) {
      return bizType === '用户管理' ? (newValue == 1 ? '关闭' : '开启') : openOrCloseMap[newValue];
    }
    return newValue;
  }
  return '';
}

const onCancel = () => {
  emits('modalCancel')
}
</script>

<template>
  <myModal modalName="详细参数" @onCancel="onCancel" :showBottom="false" width="640px">
    <template #modal-body>
      <div class="tableWrap">
        <a-spin :spinning="spinning">
          <div class="tableContainer">
            <table v-if="dataTableList.length">
              <tr>
                <th>序号</th>
                <th>操作对象</th>
                <th>操作详情</th>
                <th>旧值</th>
                <th>新值</th>
                <th>详细参数</th>
              </tr>
              <tr v-for="(item, index) in dataTableList">
                <td>{{ index + 1 + (current-1)*pageSize }}</td>
                <td :title="props.sourceObj.bizName">{{ props.sourceObj.bizName }}</td>
                <td>{{ item.fieldName || '-' }}</td>
                <td :title="getVal(item, 1)">{{ getVal(item, 1) }}</td>
                <td :title="getVal(item, 2)">{{ getVal(item, 2) }}</td>
                <td>{{ '-' }}</td>
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
          color: #000000;
          font-size: 13px;
        }
        td {
          font-weight: 400;
          opacity: 0.8;
        }
        th {
          text-align: left;
          opacity: 0.6;
          font-weight: 600;
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
