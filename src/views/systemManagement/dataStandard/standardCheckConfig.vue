<template>
    <mainArea :pageTitle="t('dataStandard.standardCheckConfig')">
      <template #topRight>
        <myButton type="primary" @click="saveFn">{{ t('common.save') }}</myButton>
      </template>
      <div class="standardWrap">
        <a-form :model="formState" :label-col="labelCol">
          <a-form-item :label="t('dataStandard.configResultNotice')">
            <a-switch size="small" v-model:checked="formState.resultNotice" />
          </a-form-item>
          <a-form-item :label="t('dataStandard.noticeMethod')" v-if="formState.resultNotice">
            <div class="noticeInfo">{{ t('dataStandard.noticeMethodInfo') }}</div>
            <a-checkbox-group v-model:value="formState.noticeMethod" :options="methodOptions" />
          </a-form-item>
          <!-- 添加收件人 -->
          <a-form-item :label="t('dataStandard.recipient')" v-show="formState.resultNotice">
            <recipientInput v-model:puidStr="formState.notifyUser"/>
          </a-form-item>
          <p class="emptyImportRule">{{ t('dataStandard.emptyImportRule') }}</p>
          <a-form-item :label="t('dataStandard.incomingCheck')" :label-col="labelCol1">
            <a-radio v-model:checked="formState.incomingCheck" disabled>{{ t('dataStandard.incomingCheckInfo') }}</a-radio>
          </a-form-item>
          <a-form-item :label="t('dataStandard.fieldMatchingCheck')" >
            <div class="fieldCheck">
              <a-radio-group v-model:value="formState.fieldMatchingCheck">
                <a-radio :value="1">
                  <span class="radio-label">{{ t('dataStandard.phyFieldMatchingCheckInfo') }}</span>
                  <span class="configTable" @click.stop="showSelectTableModal(1)">{{ t('dataStandard.configTableInfo') }}</span>
                </a-radio>
                <div class="recipientListWrap" v-if="formState.fieldMatchingCheck === 1 && formState.fieldNameCheckNodes.length">
                  <tag 
                    v-for="(item,i) in formState.fieldNameCheckNodes" 
                    :title="item.tableAlias"
                    @cancel="deleteTable(item.id)"
                  />
                </div>
                <a-radio :value="2">
                  <span class="radio-label">{{ t('dataStandard.fieldMatchingCheckInfo') }}</span>
                  <span class="configTable" @click.stop="showSelectTableModal(2)">{{ t('dataStandard.phyConfigTableInfo') }}</span>
                </a-radio>
                <div class="recipientListWrap" v-if="formState.fieldMatchingCheck === 2 && formState.fieldNameCheckNodes.length">
                  <tag 
                    v-for="(item,i) in formState.fieldNameCheckNodes" 
                    :title="item.tableAlias"
                    @cancel="deleteTable(item.id)"
                  />
                </div>
              </a-radio-group>
            </div>
            
          </a-form-item>
        </a-form>
      </div>
    </mainArea>
    <!-- 切换提示 -->
    <exitTipModal v-if="exitTipModalVisible"></exitTipModal>
    <!-- 选多表 -->
    <chooseMultipleTable v-if="chooseMultipleTableVisible" :rightSelectedKey="formState.fieldNameCheck" @modalCancel="tableModalCancel" @modalConfirm="tableModalConfirm"></chooseMultipleTable>
</template>
<script setup>
import { getStandardConfig, updateStandardConfig, getCurrentUnitUsers } from '@/apis/dataStandard'
import mainArea from '../layouts/mainArea.vue'
import myButton from '@/components/buttons/myButton.vue'
import exitTipModal from '../components/exitTipModal'
import chooseMultipleTable from '@/components/chooseMultipleTable/index.vue'
import recipientInput from '@/components/chooseRecipient/recipientInput.vue'
import tag from '@/components/tag'
import { message } from 'ant-design-vue'
import { debounce } from 'loadsh'
import { dataStandardStore } from '@/Stores/dataStandardStore';

const { t } = useI18n()
const useModalStore = modalStore()
const useDataStandardStore = dataStandardStore()

const { exitTipModalVisible } = storeToRefs(useModalStore)
const chooseMultipleTableVisible = ref(false)
const methodOptions = [
  { label: '学习通收件箱', value: 1 },
  { label: '短信', value: 2 },
]

const formState = reactive({
  resultNotice: false, //校验结果通知
  noticeMethod: [], // 通知方式
  notifyUser: '', // 收件人
  incomingCheck: true, // 入库校验
  fieldMatchingCheck: 1, // 字段匹配校验
  fieldNameCheck: [], // 使用字段校验的表
  fieldNameCheckNodes: [], // 使用字段校验的表
})

// 计算得到后端所需结果通知的值
const notifyType = computed(()=>{
  if(!formState.resultNotice){
    return 0
  }else{
    if(formState.noticeMethod.length===1 && formState.noticeMethod.includes(1)){
      return 1
    }else if(formState.noticeMethod.length===1 && formState.noticeMethod.includes(2)){
      return 2
    }else if(formState.noticeMethod.length===2){
      return 3
    }
  }
})

const labelCol = {
  style: {
    width: '84px',
    marginRight: '12px',
    textAlign: 'left',
  },
}
const labelCol1= {
  style:{
    width: '84px',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center'
  }
}

// 初始化表单状态
let initFormState = ref(true)

onMounted(async () => {
  await getStandardConfigInfo()
})

// 获取通知信息
const getStandardConfigInfo = async () => {
  const res = await getStandardConfig()
  if(res.code === 1 && res.data){
    const data = res.data.standardGlobalManage
    getResultAndMethod(data.notifyType)
    formState.notifyUser = data.notifyUser
    // 兼容历史数据
    formState.fieldMatchingCheck = data.fieldMatchingCheck == 0 ? 1 : data.fieldMatchingCheck
    if(data.fieldNameCheck !== ''){
      formState.fieldNameCheck = data.fieldNameCheck.split(',')
    } else {
      formState.fieldNameCheck = []
    }
    formState.fieldNameCheckNodes = res.data.realTables || []
  }
}

const getResultAndMethod = (val)=>{
  switch(val){
    case 0:
      formState.resultNotice = false
      formState.noticeMethod = []
      break;
    case 1:
      formState.resultNotice = true
      formState.noticeMethod = [1]
      break;
    case 2:
      formState.resultNotice = true
      formState.noticeMethod = [2]
      break;
    case 3:
      formState.resultNotice = true
      formState.noticeMethod = [1, 2]
      break;
    default:
      formState.resultNotice = false
      formState.noticeMethod = []
      break;
  }
}

// 获取通知保存参数
const getStandardSaveParams = () => {
  let standardConfigParams = {
    ...formState,
    notifyType: notifyType.value,
    incomingCheck: formState.incomingCheck ? 1 : 0,
    notifyUser: formState.notifyUser,
    fieldNameCheck: formState.fieldNameCheck.join()
  }
  return standardConfigParams
}

const saveFn = debounce(() => {
  if(formState.noticeMethod.length===0 && formState.resultNotice ===true){
    message.warning('请选择通知方式')
    return
  }
  let params = getStandardSaveParams()
  updateStandardConfig(params).then((res) => {
    if(res.code === 1) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
  })
  useDataStandardStore.switchStandardConfigChange(false)
}, 500, {
  leading: true,
  trailing: false
})

const showSelectTableModal = (type)=>{
  if(formState.fieldMatchingCheck !== type) return
  chooseMultipleTableVisible.value = true
}

const tableModalCancel = ()=>{
  chooseMultipleTableVisible.value = false
}

const tableModalConfirm = (data)=>{
  // 去重添加
  formState.fieldNameCheck =  [...new Set([...formState.fieldNameCheck, ...data.checkedKeys])]
  formState.fieldNameCheckNodes = filterRepeat(formState.fieldNameCheckNodes, data.checkedNodes, 'id')
  chooseMultipleTableVisible.value = false
}

// 去重添加数据表
const filterRepeat = (arr1, arr2, property) =>{
  const combinedArray = [...arr1, ...arr2];
  const result = [];
  const puidSet = new Set();
  for (const obj of combinedArray) {
    if (!puidSet.has(obj[property])) {
      result.push(obj);
      puidSet.add(obj[property]);
    }
  }
  return result
}

const deleteTable = (id)=>{
  formState.fieldNameCheck = formState.fieldNameCheck.filter((it)=> it !== id) 
  formState.fieldNameCheckNodes = formState.fieldNameCheckNodes.filter((it)=> it.id !== id)
}

watch(formState, ()=>{
  // 非初始化修改 
  if(!initFormState.value) {
    useDataStandardStore.switchStandardConfigChange(true)
  } else {
    initFormState.value = false
  }
})
</script>
<style lang="less" scoped>
.standardWrap {
  max-width: 900px;
  min-width: 400px;

  .ant-form-item {
    margin-bottom: 16px;
    .fieldCheck>.ant-radio-group{
      display: flex;
      flex-direction: column;
      gap: 10px;
      :deep(.radio-label){
        display: inline-block;
        width: 200px;
      }
    }
  }
  .noticeInfo{
    color: rgba(0, 0, 0, 0.4);
    font-weight: 400;
    margin-bottom: 10px;
  }
.recipientListWrap{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
    font-size: 14px;
  }
  .emptyImportRule{
    font-size: 16px;
    font-weight: 600;
  }

  .configTable{
    color:#2B67FF;
    cursor: pointer;
  }

  :deep(.ant-form-item-label) {
    & > label {
      height: 22px;
      &::after {
        content: '';
      }
    }
  }
  :deep(.ant-form){
    & > .ant-form-item:first-child .ant-form-item-label {
      & > label {
        height: 32px; /* 设置第一个 ant-form-item 中的 label 高度为32px */
        &::after {
          content: '';
        }
      }
    }
  }
}
</style>