<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import myModal from '@/components/myModal'
import Button from '@/components/buttons/myButton.vue'
import Empty from '@/components/empty'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const props = defineProps({
  errorInfo: {
    type: String,
    default: '',
  },
  pushRecordMethod: {
    type: Number,
  }
})

const tableHeadInfo = ['主键名称', '主键值', '消息']

const keyMap = ['key', 'value', 'msg']

// const originInfoMap = ['程序逻辑异常','对方返回异常']

const errorData = computed(() => {
  let tempInfo = props.errorInfo
  try{
    console.log(JSON.parse(tempInfo),"JSON.parse(tempInfo)");
    return JSON.parse(tempInfo)
  } catch(e) {
    console.log('e', e)
    return tempInfo
  }
})

// 弹窗标题
const modalTitle = computed(() => {
    switch(props.pushRecordMethod) {
      case 6:
        return t('common.check')
      default:
        return t('common.exceptionDetail')
    }
})

// 校验数据结构是否为 [{'key', 'value', 'msg'}]
// const validateStructure = computed(() => {
//   let arrayValidate = Array.isArray(errorData.value) && errorData.value[0]

//   if(!arrayValidate) return false

//   let str = JSON.stringify(errorData.value[0])
//   let keyValidate = ['key', 'msg'].every(k => str.includes(k))

//   return keyValidate
// })

const errorInfoStr = () => {
  try{
    return JSON.stringify(errorData.value, null, 4)
  } catch(e){
    return ''
  }
}

const exportFn = () => {
  let exportData = []

  if(Array.isArray(errorData.value)) {  // JSON数组
    exportData = errorData.value.map(it => keyMap.map(k => it[k]))
    // 插入表头
    exportData.unshift(tableHeadInfo)
  } else {  // JSON对象
    // exportData = [
    //   Object.keys(errorData.value),
    //   Object.values(errorData.value)
    // ]
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(exportData)
  // 指定列宽
  worksheet['!cols'] = [{wch:10},{wch:30},{wch:50}];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
  XLSX.writeFile(workbook, `异常详情_${Date.now()}.xlsx`)
}

</script>

<template>
  <myModal
    :modalName="modalTitle"
    @onCancel="$emit('onCancel')"
    :showBottom="false"
    width="840px"
  >
    <template #modal-body>
      <div class="modalContainer">
        <div class="topBox">
          <Button @click="exportFn" v-if="Array.isArray(errorData) && errorData.length">{{ t('common.export') }}</Button>
        </div>
        <div class="tableWrapper">
          <!-- JSON数组 -->
          <table v-if="Array.isArray(errorData) && errorData.length">
            <tr>
              <th v-for="head in tableHeadInfo">{{ head }}</th>
            </tr>
            <tr v-for="item in errorData">
              <td>{{ item.key }}</td>
              <td>{{ item.value }}</td>
              <td>{{ item.msg }}</td>
              <!-- <td>{{ originInfoMap[item.origin] }}</td> -->
            </tr>
          </table>
          <Empty v-else-if="Array.isArray(errorData) && !errorData.length" />
          <!-- JSON对象 -->
          <div v-else class="errorInfo">
            <div v-if="props.pushRecordMethod === 6" class="errorInfoTitle">{{ t('common.detailParams') }}</div>
            <textarea disabled rows="8">{{ errorInfoStr() }}</textarea>
          </div>
        </div>
        <div class="bottomBox" v-if="Array.isArray(errorData) && errorData.length">
          <span>
            {{ t('pushManage.showHundredError') }}
          </span>
        </div>
      </div>
    </template>
  </myModal>
</template>

<style scoped lang="less">
.modalContainer {
  padding: 24px;
  .topBox {
    background-color: #fff;
    position: relative;
  }
  .tableWrapper {
    max-height: 400px;
    overflow: auto;
    margin: 16px 0;
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
            width: 12.5%;
          }
          &:nth-child(2) {
            width: 43.75%;
          }
          &:nth-child(3) {
            width: 43.75%;
          }
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
    .errorInfo{
      display: flex;
      .errorInfoTitle{
        width: 100px;
      }
      textarea{
        width: 100%;
        // max-height: 400px;
        border-radius: 0px;
        box-sizing: border-box;
        transform: translateZ(0);
        -webkit-font-smoothing: antialiased;
        flex: 1;
      }
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
