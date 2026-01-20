<template>
<div className='apiWrap'>
    <div class="formWrap">
        <!-- 建立API连接 -->
        <div class="basic-connect" v-if="activeKey === 0">
            <a-form ref="formRef" :model="formState" :hideRequiredMark="true">
                <a-form-item 
                    name="apiSourceName" 
                    :class="{'width110' : locale === 'lo', 'width95' : locale === 'zh-CN'}" 
                    :label="t('dataSource.sourceName')" 
                    :rules="sourceNameRule()"
                >
                    <a-input :placeholder="t('common.pleaseEnter')" type="text" v-model:value="formState.apiSourceName"/>
                </a-form-item>
                <a-form-item 
                    name="apiAddress" 
                    :class="{'width110' : locale === 'lo', 'width95' : locale === 'zh-CN'}" 
                    :label="t('api.apiAddress')" 
                    :rules="[{ required: true, message: t('common.pleaseEnter') }]"
                >
                    <input style="width: 100%;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.apiAddress">
                </a-form-item>
                <a-form-item 
                    :class="{'width110' : locale === 'lo', 'width95' : locale === 'zh-CN'}" 
                    name="apiType" 
                    :label="t('api.type')"
                >
                    <a-radio-group v-model:value="formState.apiType">
                        <a-radio value="get">GET</a-radio>
                        <a-radio value="post">POST</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
            <p class="p-text">{{ t('api.paramsSet') }}</p>
            <!-- <div class="basic-tabs" @click="basicTabsChange">
                {{ basciParamList.length > 0 ? `(${basciParamList.length})` : '' }}
                <div :class="[tabActiveKey === 0 ? 'tab-is-active' : '']" id="tab-a">基础参数</div>
                {{ headParamList.length > 0 ? `(${headParamList.length})` : '' }}
                <div :class="[tabActiveKey === 1 ? 'tab-is-active' : '']" id="tab-b">头信息参数</div>
                <div :class="[tabActiveKey === 2 ? 'tab-is-active' : '']" id="tab-c">分页参数</div>
                <div :class="[tabActiveKey === 3 ? 'tab-is-active' : '']" id="tab-d">查询语句</div>
            </div> -->
            <div class="basic-tabs-pane">
                <!-- 基础参数 -->
                <!-- <template v-if="tabActiveKey === 0"> -->
                    <p class="sub-p-text">{{ t('api.basicParams') }}</p>
                    <table class="basic-table">
                        <tr>
                            <td>{{ t('api.paramsName') }}</td>
                            <td>{{ t('api.paramsValue') }}</td>
                            <td>{{ t('common.operation') }}</td>
                        </tr>
                        <tr v-for="item in showBasciParamList" :key="item.uuid">
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.name }}
                                    </template>
                                    <div>
                                        {{ item.name }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.value }}
                                    </template>
                                    <div>
                                        {{ item.value }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <span @click="changeParams('basicParamEdit', item)">{{ t('common.edit') }}</span>
                                <span @click="handleDel('basicParamDel', item)">{{ t('common.delete') }}</span>
                            </td>
                        </tr>
                    </table>
                    <myButton class="add-btn" @click="changeParams('basicParamAdd')">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{ t('api.addParams') }}
                    </myButton>
                <!-- </template> -->
                <!-- 头信息参数 -->
                <!-- <template v-if="tabActiveKey === 1"> -->
                    <p class="sub-p-text">{{ t('api.headParams') }}</p>
                    <table class="basic-table">
                        <tr>
                            <td style="width: 50px;">
                                <img @click="selectAll(1)" class="check-img" v-if="selectedNum === 0" src="@/assets/icons/not_select.png" alt="">
                                <img @click="selectAll(2)" class="check-img" v-else-if="selectedNum === headParamList.length" src="@/assets/icons/is_select.png" alt="">
                                <img @click="selectAll(3)" class="check-img" v-else src="@/assets/icons/doing_select.png" alt="">
                            </td>
                            <td>{{ t('api.paramsName') }}</td>
                            <td>{{ t('api.paramsValue') }}</td>
                            <td>{{ t('common.operation') }}</td>
                        </tr>
                        <tr v-for="item in showHeadParamList" :key="item.uuid">
                            <td style="width: 50px;">
                                <img class="check-img" @click="item.isSelect = !item.isSelect" v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                <img class="check-img" @click="item.isSelect = !item.isSelect" v-else src="@/assets/icons/not_select.png" alt="">
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.name }}
                                    </template>
                                    <div>
                                        {{ item.name }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.value }}
                                    </template>
                                    <div>
                                        {{ item.value }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <span @click="changeParams('headParamEdit', item)">{{ t('common.edit') }}</span>
                                <span @click="handleDel('headParamDel', item)">{{ t('common.delete') }}</span>
                            </td>
                        </tr>
                    </table>
                    <myButton class="add-btn" @click="changeParams('headParamAdd')">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />{{ t('api.addParams') }}
                    </myButton>
                <!-- </template> -->
                <!-- body参数 -->
                <template v-if="formState.apiType == 'post'">
                    <p class="sub-p-text">{{ t('api.bodyParams') }}</p>
                    <table class="basic-table">
                        <tr>
                            <td>{{ t('api.paramsName') }}</td>
                            <td>{{ t('api.paramsValue') }}</td>
                            <td>{{ t('api.paramType') }}</td>
                            <td>{{ t('common.operation') }}</td>
                        </tr>
                        <tr v-for="item in showBodyParamList" :key="item.uuid">
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.name }}
                                    </template>
                                    <div style="width: 95px;">
                                        {{ item.name }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-tooltip>
                                    <template #title>
                                        {{ item.value }}
                                    </template>
                                    <div>
                                        {{ item.value }}
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                <a-select v-model:value="item.dataType">
                                    <a-select-option v-for="item in codeTypeOption" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </a-select-option>
                                </a-select>
                            </td>
                            <td>
                                <span @click="changeParams('bodyParamEdit', item)">{{ t('common.edit') }}</span>
                                <span @click="handleDel('bodyParamDel', item)">{{ t('common.delete') }}</span>
                            </td>
                        </tr>
                    </table>
                    <myButton class="add-btn" @click="changeParams('bodyParamAdd')">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{ t('api.addParams') }}
                    </myButton>
                </template>
                <!-- 分页参数 -->
                <!-- <template v-if="tabActiveKey === 2"> -->
                    <p class="sub-p-text">{{ t('api.pageParams') }}</p>
                    <a-form ref="pageFormRef" :model="pageFormState">
                        <a-form-item name="pageType"  :wrapperCol="{ offset: 3 }" :label="t('api.pageType')" >
                            <a-radio-group v-model:value="pageFormState.pageType" :disabled="fieldIsEnc || secondFieldEnc">
                                <a-radio :value="0">{{ t('api.normalPage') }}</a-radio>
                                <a-radio :value="1">{{ t('api.offsetPage') }}</a-radio>
                                <a-radio :value="2">{{ t('api.loopPage') }}</a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <template v-if="pageFormState.pageType === 0">
                            <a-form-item 
                                name="pageNumberName" 
                                :label="t('api.pageName')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.pageNumberName"
                                    :disabled="fieldIsEnc"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="pageNumberBegin" 
                                :label="t('api.pageNum')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.pageNumberBegin"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="pageSizeName" 
                                :label="t('api.pageSizeName')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    :disabled="secondFieldEnc"
                                    v-model.trim="pageFormState.pageSizeName"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="pageSize" 
                                :label="t('api.pageSize')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.pageSize"
                                >
                            </a-form-item>
                        </template>
                        <template v-if="pageFormState.pageType === 1">
                            <a-form-item 
                                name="fieldName" 
                                :label="t('api.fieldName')" 
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')"
                                    type="text" 
                                    v-model.trim="pageFormState.fieldName"
                                    :disabled="fieldIsEnc"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="paramName" 
                                :label="t('api.paramName')" 
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                                :rules="[{ required: isRequire1, message: t('common.pleaseEnter') }]"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')"
                                    type="text" 
                                    v-model.trim="pageFormState.paramName"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="lastValue" 
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                            >
                                <template #label>
                                    <a-tooltip>
                                        <template #title>{{ t('api.lastTip') }}</template>
                                        {{ t('api.lastValue') }}<img style="width: 12px; margin-left: 4px;" src="@/assets/icons/tips-small-icon.png" />
                                    </a-tooltip>
                                </template>
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.lastValue"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="secondFieldName" 
                                :label="t('api.secondFieldName')" 
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.secondFieldName"
                                    :disabled="secondFieldEnc"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="secondParamName" 
                                :label="t('api.secondOffsetParams')" 
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                                :rules="[{ required: isRequire2, message: t('common.pleaseEnter') }]"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.secondParamName"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="lastAuxValue"
                                :class="{'lo-form-items' : locale === 'lo', 'zh-form-items' : locale === 'zh-CN'}"
                            >
                                <template #label>
                                    <a-tooltip>
                                        <template #title>{{ t('api.lastTip') }}</template>
                                        {{ t('api.secondLastValue') }}<img style="width: 12px; margin-left: 4px;" src="@/assets/icons/tips-small-icon.png" />
                                    </a-tooltip>
                                </template>
                                <input 
                                    :placeholder="t('common.pleaseEnter')" 
                                    type="text" 
                                    v-model.trim="pageFormState.lastAuxValue"
                                >
                            </a-form-item>
                        </template>
                        <template v-if="pageFormState.pageType === 2">
                            <a-form-item 
                                :label="t('api.loopFieldName')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN','loopFieldName_wrap': true}"
                            >
                            <div class="loopFieldName">
                                <a-form-item  name="leftName">
                                    <input 
                                    :placeholder="t('common.pleaseEnter')"
                                    type="text" 
                                    style="width: 130px;"
                                    v-model.trim="pageFormState.leftName"
                                > 
                                </a-form-item>
                                <div class="driver"></div>
                                <a-form-item name="rightName">
                                    <input 
                                        :placeholder="t('common.pleaseEnter')"
                                        type="text" 
                                        style="width: 130px;"
                                        v-model.trim="pageFormState.rightName"
                                    >
                                </a-form-item>
                            </div>
                            </a-form-item>
                            <a-form-item 
                                name="dataFmtType" 
                                :label="t('api.dataFmtType')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            > 
                            <div @mousedown.stop="openSelect" @click.stop="" id="my_custom_selcet" style="position: relative;">
                                <a-select v-model:value="pageFormState.dataFmtType" :placeholder="t('common.pleaseSelect')" :open="selectOpen" @select="handleSelect" :getPopupContainer="triggerNode => triggerNode.parentNode" :options="dataFmtTypeOption" style="width: 100%;">
                                    <template #dropdownRender="{ menuNode: menu }">
                                    <VNodes :vnodes="menu" />
                                    <div
                                        class="my_select_overlap"
                                        style="padding: 4px 8px; cursor: pointer"
                                        @mousedown="e => e.preventDefault()"
                                    >
                                    <input 
                                            :placeholder="t('api.custom')"
                                            type="text" 
                                            v-model.trim="pageFormState.dataFmtCustom"
                                            style="width:100%"
                                            @click="e=>e.target.focus()"
                                        />
                                    </div>
                                    </template>
                                </a-select>
                            </div>
                            </a-form-item>
                            <a-form-item 
                                name="beginValue" 
                                :label="t('api.loopBeginValue')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')"
                                    type="text" 
                                    v-model.trim="pageFormState.beginValue"
                                >
                            </a-form-item>
                            <a-form-item 
                                name="endValue" 
                                :label="t('api.loopEndValue')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                                <input 
                                    :placeholder="t('common.pleaseEnter')"
                                    type="text" 
                                    v-model.trim="pageFormState.endValue"
                                >
                            </a-form-item>
                            <a-form-item
                                name="stepSize" 
                                :label="t('api.loopStepSize')" 
                                :class="{'width172' : locale === 'lo', 'width130' : locale === 'zh-CN'}"
                            >
                            <a-input-number v-model:value="pageFormState.stepSize" :min="1" :max="999" style="width: 80px" />
                            <a-form-item-rest>
                                <a-select v-model:value="pageFormState.stepUnit" style="width: 100px; margin-left: 12px">
                                    <a-select-option v-for="item in loopPageTimeOption" :key="item.value" :value="item.value">
                                        {{ t(item.label) }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item-rest>
                            </a-form-item>
                        </template>
                        <!-- <myButton @click="pagePreivew">分页预览</myButton> -->
                    </a-form>
                <!-- </template> -->
                <!-- 查询语句 -->
                <template v-if="tabActiveKey === 3">
                    <div class="sub-text">仅支持json语句格式查询</div>
                    <div class="textarea-style" id="codeEditBox"></div>
                </template>
            </div>
        </div>
        <!-- 解析请求结果 -->
        <template v-if="activeKey === 1">
            <parseResult :tableName="formState.connName" />
        </template>
    </div>
    <div class="btnWrap">
        <Button @click="$emit('cancel')">取消</Button> 
        <!-- <Button>测试连接</Button> -->
        <Button v-if="activeKey !== 0" type="primary" @click="preStep">上一步</Button>
        <Button v-if="activeKey === 0" type="primary" @click="nextStep">下一步</Button>
        <Button v-if="activeKey === 1" type="primary" @click="submitFn">确定</Button>
    </div>
</div>
</template>
<script setup>
import { reactive, ref, computed, onUnmounted, nextTick, onMounted, watch, inject } from 'vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import parseResult from './secondStep.vue'
import { storeToRefs } from 'pinia'
import { apiConnectTest } from '@/apis/apiImport';
import { parseData, isJSON } from '@/utils/apiParse'
import myButton from '../../../../../components/buttons/myButton'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
import { cloneDeep, debounce } from 'lodash'
import Button from '@/components/buttons/myButton'
import { addAPISource, sourceNameIsDuplicate, editAPISource } from '@/apis/dataSourceManage'
import { useEchoApiParams } from '@/hooks/dataSource/useEchoApiParams'

const { t, locale } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()

const emits = defineEmits(['cancel', 'toggleShowModal'])

const { apiParamsModalVisible, apiParamsDelModalVisible, apiDescModalVisible } = storeToRefs(useModalStore)

const { basciParamList, bodyParamList, headParamList, settingKeys, activeTabKey,  fieldIsEnc, secondFieldEnc, checkedKeys, isCrossLevel, multiDataList } = storeToRefs(useMainStore)

const sourceInfo = inject('dataSourceInfo')
const modalMode = inject('modalMode')


const VNodes = (_, { attrs }) => {
return attrs.vnodes;
};
const _dataFmtTypeOption = [{
  value: 'yyyyMMdd',
  label: 'yyyyMMdd'
},{
  value: 'yyyy-MM-dd',
  label: 'yyyy-MM-dd'
},{
  value: 'TS10',
  label: t('common.timeStamp10')
},{
  value: 'TS13',
  label: t('common.timeStamp13')
}]

const dataFmtTypeOption = ref(cloneDeep(_dataFmtTypeOption))
const loopPageTimeOption = [{
  value: 'year',
  label: 'common.year'
},{
  value: 'month',
  label: 'common.month'
},{
  value: 'day',
  label: 'common.day'
}, {
  value: 'hour',
  label: 'common.hour'
},{
  value: 'minute',
  label: 'common.minute'
}]

const codeTypeOption = [
  { label: 'String', value: 'String' },
  { label: 'Integer', value: 'Integer' },
  { label: 'Long', value: 'Long' },
  { label: 'Double', value: 'Double' },
  { label: 'Boolean', value: 'Boolean' },
  { label: 'Object', value: 'Object' },
  { label: 'Array', value: 'Array' },
]
const formRef = ref()
const pageFormRef = ref()

const canPass = ref(false) // 测试连接通过,可以进行下一步

const state = reactive({
  paramsData: {},
  queryBody: ''
})
const formState = reactive({
  apiSourceName: '',
  connName: '',
  apiAddress: '',
  apiType: 'get'
})
const pageFormState = reactive({
  pageType: 0,
  
  pageNumberName: '',
  pageNumberBegin: '',
  pageSizeName: '',
  pageSize: '',

  fieldName: '',
  paramName: '',
  lastValue: '',
  secondFieldName: '',
  secondParamName: '',
  lastAuxValue: '',

  leftName: "",
  rightName: "",
  dataFmtType: undefined,
  beginValue: "",
  endValue: "",
  stepSize: "",
  stepUnit: "day",
  dataFmtCustom: ""
})

const isRequire1 = computed(() => {
  if (pageFormState.fieldName) return true
  return false
})

const isRequire2 = computed(() => {
  if (pageFormState.secondFieldName) return true
  return false
})

const selectedNum = computed(() => {
  return headParamList.value.filter(i => i.isSelect).length
})

const activeKey = ref(0)
const tabActiveKey = ref(0)

let clickHandle = null
const openSelect = (e)=>{
  e.preventDefault()
  //默认为true
  isCustom.value = true
  // 自定义
  if(tempDataFmtCustom.value){
      // pageFormState.dataFmtType = ''
      pageFormState.dataFmtCustom = tempDataFmtCustom.value
      dataFmtTypeOption.value = cloneDeep(_dataFmtTypeOption)
  }
  selectOpen.value = true
}
const selectOpen = ref(false)
const tempDataFmtCustom = ref('') // 临时保存的自定义值
const isCustom = ref(true)
const handleSelect=(value)=> {
  pageFormState.dataFmtCustom = ''
  tempDataFmtCustom.value = ''
  isCustom.value = false
  if (value) {
      selectOpen.value = false
  }
}

// 是否为编辑状态
const isEdit = computed(() => {
    return modalMode.value === 'editAPI'
})

// 编辑状态 回显数据
const echoSourceInfo = () => {
    if(!isEdit.value) return
    useEchoApiParams(formState, sourceInfo.value, pageFormState)
}

onMounted(()=>{
    echoSourceInfo()

  clickHandle = (e) => {
      if (e.target && 'className' in e.target && selectOpen.value) {
          const className = e.target.className;
          if (className.indexOf('my_select_overlap') === -1) {
              selectOpen.value = false
              let timeID=setTimeout(()=>{
                  if(isCustom.value){
                      // 已有的已存在
                      if(_dataFmtTypeOption.some(i=>i.value === pageFormState.dataFmtCustom)){
                          pageFormState.dataFmtType = pageFormState.dataFmtCustom
                          pageFormState.dataFmtCustom = ''
                          tempDataFmtCustom.value = ''
                          isCustom.value = false
                      }else{
                          if(pageFormState.dataFmtCustom){
                              dataFmtTypeOption.value.push({value:pageFormState.dataFmtCustom,label:pageFormState.dataFmtCustom})
                              pageFormState.dataFmtType = pageFormState.dataFmtCustom
                              tempDataFmtCustom.value = pageFormState.dataFmtCustom
                          }
                          pageFormState.dataFmtCustom = ''
                      }
                  }
                  clearTimeout(timeID)
              },50)

          }
      } else {
          selectOpen.value = false
      }
  }
  document.body.addEventListener('click', clickHandle)
})

// 清空重置
onUnmounted(() => {
  useMainStore.setParamSettingType('')
  useMainStore.setBasciParamList([], 'clear')
  useMainStore.setBodyParamList([], 'clear')
  useMainStore.setHeadParamList([], 'clear')
  useMainStore.changeSettingKeys([], 'clear')
  useMainStore.setRequestData([])
  useMainStore.setParentKeys('')
  useMainStore.setApiPreviewColumns([])
  useMainStore.setApiPreviewData([])
  useMainStore.setApiTableDataList([])
  fieldIsEnc.value = false
  secondFieldEnc.value = false
  checkedKeys.value = []
  isCrossLevel.value = false
  if (clickHandle) {
      document.body.removeEventListener('click', clickHandle)
      clickHandle = null
  }
})

const changeParams = (type, data = {}) => {
  useMainStore.setParamSettingType(type)
  useMainStore.setDeleteData(data)
  let arr = []
  if (pageFormState.pageType === 0) {
      if (pageFormState.pageNumberName && pageFormState.pageNumberBegin) {
          arr.push({
              uuid: '123', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.pageNumberName,
              value: pageFormState.pageNumberBegin
          })
      }
      if (pageFormState.pageSizeName && pageFormState.pageSize) {
          arr.push({
              uuid: '456', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.pageSizeName,
              value: pageFormState.pageSize
          })
      }
  } else if(pageFormState.pageType === 1) {
      if (pageFormState.fieldName && pageFormState.paramName) {
          arr.push({
              uuid: '123', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.fieldName,
              value: pageFormState.paramName
          })
      }
      if (pageFormState.secondFieldName && pageFormState.secondParamName) {
          arr.push({
              uuid: '456', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.secondFieldName,
              value: pageFormState.secondParamName
          })
      }
  }else if(pageFormState.pageType === 2){
      if (pageFormState.leftName && pageFormState.beginValue) {
          arr.push({
              uuid: '123', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.leftName,
              value: pageFormState.beginValue
          })
      }
      if (pageFormState.rightName && pageFormState.endValue) {
          arr.push({
              uuid: '456', // 给固定后面需判断
              from: 'pageSetting',
              name: pageFormState.rightName,
              value: pageFormState.endValue
          })
      }
  }
  useMainStore.setPageFieldList(arr)
  useModalStore.changeApiParamsModalVisible()
}

const handleDel = (type, data) => {
  if (data.isEnc) return message.warn(t('api.apiDeleteTip'))
  useMainStore.setParamSettingType(type)
  useMainStore.setDeleteData(data)
  useModalStore.changeApiParamsDelModalVisible()
}

const selectAll = (type) => {
  if (type === 1) {
      headParamList.value.forEach(item => item.isSelect = true)
  } else {
      headParamList.value.forEach(item => item.isSelect = false)
  }
}

// 上一步
const preStep = () => {
  if (activeKey.value !== 0) {
      activeKey.value--
  }
  nextTick(() => {
      if (activeKey.value === 0) {
          checkedKeys.value = []
          isCrossLevel.value = false
          useMainStore.setApiTableDataList([])
      }
  })
}

// 下一步
const nextStep = () => {
    testLink()
}

// 测试连接
const testLink = () => {
  const { connName, apiAddress, apiType } = formState
  const { pageType, pageNumberName, pageNumberBegin, pageSizeName, pageSize, fieldName, paramName, lastValue, secondFieldName, secondParamName, lastAuxValue, leftName,rightName,dataFmtType,beginValue,endValue,stepSize,stepUnit,dataFmtCustom } = pageFormState
  let normalParams = {}
  let offsetParams = {}
  let foreachParams = {}
  let _pageSetting = {}
  if (pageFormState.pageType === 0) {
      normalParams = {
          "pageNumberName": pageNumberName, //"页码字段名",
          "pageNumberBegin": pageNumberBegin, //"页码起始值",
          "pageSizeName": pageSizeName, //"页大小字段名",
          "pageSize": pageSize, //"页大小值"
      }
      offsetParams = {
          "fieldName": '', //"偏移字段名",
          "paramName": '', //"偏移参数名"
          "lastValue": '', //"偏移字段值",
          "secondFieldName": '', //"第二偏移字段名",
          "secondParamName": '',//"第二偏移参数名"
          "lastAuxValue": '', //"第二偏移字段值"
      }
      foreachParams = {
          "leftName": "",
          "rightName": "",
          "dataFmtType": undefined,
          "beginValue": "",
          "endValue": "",
          "stepSize": "",
          "stepUnit": "day",
          "dataFmtCustom": ""
      }
      _pageSetting = {
          "type": pageType,
          "normalParams": normalParams
      }
      tempDataFmtCustom.value = ''
  } else if(pageFormState.pageType === 1) {
      normalParams = {
          "pageNumberName": '', //"页码字段名",
          "pageNumberBegin": '', //"页码起始值",
          "pageSizeName": '', //"页大小字段名",
          "pageSize": '', //"页大小值"
      }
      offsetParams = {
          "fieldName": fieldName, //"偏移字段名",
          "lastValue": lastValue, //"偏移字段值",
          "paramName": paramName,
          "secondFieldName": secondFieldName, //"第二偏移字段名",
          "secondParamName": secondParamName,
          "lastAuxValue": lastAuxValue, //"第二偏移字段值"
      }
      foreachParams = {
          "leftName": "",
          "rightName": "",
          "dataFmtType": undefined,
          "beginValue": "",
          "endValue": "",
          "stepSize": "",
          "stepUnit": "day",
          "dataFmtCustom": ""
      }
      _pageSetting = {
          "type": pageType,
          "offsetParams": offsetParams
      }
      tempDataFmtCustom.value = ''
  }else{
      normalParams = {
          "pageNumberName": '', //"页码字段名",
          "pageNumberBegin": '', //"页码起始值",
          "pageSizeName": '', //"页大小字段名",
          "pageSize": '', //"页大小值"
      }
      offsetParams = {
          "fieldName": '', //"偏移字段名",
          "paramName": '', //"偏移参数名"
          "lastValue": '', //"偏移字段值",
          "secondFieldName": '', //"第二偏移字段名",
          "secondParamName": '',//"第二偏移参数名"
          "lastAuxValue": '', //"第二偏移字段值"
      }
      foreachParams = {
          "leftName": leftName,
          "rightName": rightName,
          "dataFmtType":  tempDataFmtCustom.value ? 'custom' : dataFmtType || '',
          "beginValue": beginValue,
          "endValue": endValue,
          "stepSize": stepSize ?? '',
          "stepUnit": stepUnit,
          "dataFmtCustom": tempDataFmtCustom.value || ''
      }
      _pageSetting = {
          "type": pageType,
          "foreachParams": foreachParams
      }
  }
  if (state.queryBody && !isJSON(state.queryBody)) {
  }

  const jsonData = {
    //   "groupId": activeTabKey.value,
      "name": connName,
      "url": apiAddress,
      "method": apiType,
      "params": {
          "normal": basciParamList.value,
          "body": formState.apiType === 'post' ? bodyParamList.value: [],
          "header": headParamList.value.filter(i => i.isSelect),
          "pageSetting": _pageSetting,
          "queryBody": state.queryBody ? JSON.parse(state.queryBody) : ""
      }
  }
  state.paramsData = jsonData
  formRef.value.validateFields().then(res => {
      if (res) {
          apiConnectTest(jsonData).then(res => {
              if (res.code == 1) {
                  const resData = JSON.parse(res.message)
                  canPass.value = true
                  useMainStore.setRequestData(parseData(resData))
                  useMainStore.setParentKeys('')
                  useMainStore.changeSettingKeys([], 'clear')
                  useMainStore.setApiPreviewColumns([])
                  useMainStore.setApiPreviewData([])
                  message.success(t('api.apiConnectTip'))
                  activeKey.value = 1
              } else {
                  canPass.value = false
                  message.error(res.message)
              }
          })
      }
  }).catch(err => {
        console.log(err)
    })
}

// 确定
const submitFn = () => {
    // ['apiName', 'method', 'name', 'params', 'url' ]

    if(!settingKeys.value.length) {
        return message.warn(t('otherConfig.selectCode'))
    }

    const jsonData = {
        apiName: formState.apiSourceName,
        // "groupId": activeTabKey.value,
        ...state.paramsData,
        // multiDataList: multiDataList.value
    }
    if (pageFormState.pageType == 1) {
        const { fieldName, secondFieldName } = state.paramsData.params.pageSetting.offsetParams
        if (fieldName || secondFieldName) {
            const arr1 = [fieldName, secondFieldName]
            let fieldNum = fieldName && secondFieldName ? 2 : 1
            let flag = false // 偏移字段是否被勾选
            let flag1 = false // 偏移字段是否被设置为关联字段
            let fieldNameFlag = false
            let fieldNameFlag1 = false
            let secondFieldNameFlag = false
            let secondFieldNameFlag1 = false
            if (fieldNum === 1) {
                if (multiDataList.value.length > 1) {
                    settingKeys.value.forEach(i => {
                        if (arr1.includes(i.title)) {
                            flag = true
                        }
                        if (arr1.includes(i.title) && i.isRelation) {
                            flag1 = true
                        }
                    })
                } else {
                    settingKeys.value.forEach(i => {
                        if (arr1.includes(i.title)) {
                            flag = true
                        }
                    })
                }
                if (!flag) return message.warn(t('api.selectOffestField'))
                if (multiDataList.value.length > 1) {
                    if (!flag1) return message.warn(t('api.offestFieldBeRelation'))
                }
            }
            if (fieldNum === 2) {
                if (multiDataList.value.length > 1) {
                    settingKeys.value.forEach(i => {
                        if (arr1[0] === i.title) {
                            fieldNameFlag = true
                        }
                        if (arr1[0] === i.title && i.isRelation) {
                            fieldNameFlag1 = true
                        }
                        if (arr1[1] === i.title) {
                            secondFieldNameFlag = true
                        } 
                        if (arr1[1] === i.title && i.isRelation) {
                            secondFieldNameFlag1 = true
                        }
                    })
                } else {
                    settingKeys.value.forEach(i => {
                        if (arr1[0] === i.title) {
                            fieldNameFlag = true
                        }
                        if (arr1[1] === i.title) {
                            secondFieldNameFlag = true
                        } 
                    })
                }
                if (!(fieldNameFlag && secondFieldNameFlag)) return message.warn(t('api.selectOffestField'))
                if (multiDataList.value.length > 1) { 
                    if (!(fieldNameFlag1 && secondFieldNameFlag1)) return message.warn(t('api.offestFieldBeRelation'))
                }
            }
            // 多层级 偏移字段 被必须设置成关联字段 且被关联
            if (multiDataList.value.length > 1) {
                let isRelationed = false
                const binds = multiDataList.value.map(i => i.bind)
                if (binds.length) {
                    let fields = []
                    binds.forEach(item => {
                        if (item && item.fields) {
                            fields = [...fields, ...item.fields]
                        }
                    })
                    const originNames = fields.map(i => i.originalName)
                    originNames.forEach(item => {
                        if (arr1.includes(item)) {
                            isRelationed = true
                        }
                    })
                }
                if (!isRelationed) {
                    return message.warn(t('api.relationFieldTip'))
                }
            }
        }
    }

    let handle = isEdit.value ?  editAPISource : addAPISource

    if(isEdit.value) {
        jsonData.sourceId = sourceInfo.value.id
    }

    handle(jsonData).then((res) => {
        if(res.code === 1) {
            message.success(res.message)
        } else {
            message.error(res.message)
        }
        emits('cancel', true)
    })
}

// 不携带的动态参数 隐藏展示
const showBasciParamList = computed(() => {
  return basciParamList.value.filter(it => 
      it.type !== 'dynamic' ||
      (it.type === 'dynamic' && it.dynamicValue.carry)
  )
})
const showHeadParamList = computed(() => {
  return headParamList.value.filter(it => 
      it.type !== 'dynamic' ||
      (it.type === 'dynamic' && it.dynamicValue.carry)
  )
})
const showBodyParamList = computed(() => {
  return bodyParamList.value.filter(it => 
      it.type !== 'dynamic' ||
      (it.type === 'dynamic' && it.dynamicValue.carry)
  )
})


// 数据源名称校验规则
const sourceNameRule = () => {
    // 编辑状态只做必填校验
    if(isEdit.value) {
        return [{required: true, message: t('common.pleaseEnter')}]
    }

    return [{validator: sourceNameValidator}]
}

const sourceNameValidator = async (rule, val) => {
    if(!val) {
        return Promise.reject(t('common.pleaseEnter'))
    }

    // 校验数据源名称是否重复
    let res = await sourceNameIsDuplicate({
        sourceName: formState.apiSourceName,
        sourceTypeName: 'API'
    })

    if(res.code !== 1) {
        return Promise.reject('数据源名称重复')
    }

    return Promise.resolve()
}


// 展示子弹窗时 隐藏父级弹窗
watch(
    [apiParamsModalVisible, apiParamsDelModalVisible, apiDescModalVisible],
    (nv) => {
        if(nv.some(it => it)) {
            emits('toggleShowModal', false)
        } else {
            emits('toggleShowModal', true)
        }
    }
)

</script>

<style lang="less" scoped>
  .driver{
      width: 16px;
      height: 1px;
      background: rgba(0, 0, 0, 0.40);
      margin: 16px 7px 0;
  }
  .loopFieldName_wrap{
      margin-bottom: 0;
  }
  .loopFieldName {
      display:flex;
  }

  .apiWrap {
    height: 550px;
    .formWrap{
        height: calc(100% - 50px);
        overflow-y: auto;
        padding-right: 24px;
        &::-webkit-scrollbar-thumb{
            background-color: transparent;
        }
        .ml46 {
          input {
              width: 330px;
              margin-left: 46px;
          }

          :deep(.ant-form-item-explain-error) {
              margin-left: 46px;
          }
      }
      .ml31 {
          input {
              width: 330px;
              margin-left: 31px;
          }

          :deep(.ant-form-item-explain-error) {
              margin-left: 31px;
          }
      }
      .width172 {
          :deep(.ant-form-item-label) {
              text-align: left;
              width: 172px;
          }
          input {
              width: 330px;
          }
      }
      .width130 {
          :deep(.ant-form-item-label) {
              text-align: left;
              width: 130px;
          }
          input {
              width: 100%;
          }
      }
      .width110 {
          :deep(.ant-form-item-label) {
              text-align: left;
              width: 110px;
          }
      }
      .width95 {
          :deep(.ant-form-item-label) {
              text-align: left;
              width: 76px;
              margin-right: 12px;
              label::after{
                display: none;
              }
          }
      }

      .lo-form-items {
          :deep(.ant-form-item-label) {
              label {
                  text-align: left;
                  width: 245px;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
          }
          input {
              width: 245px;
          }
      }

      .zh-form-items {
          :deep(.ant-form-item-label) {
              label {
                  text-align: left;
                  width: 155px;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
          }

          input {
              width: 100%;
          }
      }

      .basic-connect {
          .p-text {
              margin-top: 10px;
              font-weight: 600;
              font-size: 15px;
              color: rgba(0, 0, 0, 0.8);
          }
          .sub-p-text {
              margin-top: 10px;
              font-weight: 500;
              font-size: 14px;
              color: rgba(0, 0, 0, 0.8); 
          }
          .basic-tabs {
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              padding: 3px;
              width: 500px;
              height: 36px;
              background: #F3F3F3;
              border-radius: 8px;
              & > div {
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                  padding: 0px 16px;
                  isolation: isolate;
                  width: 123.5px;
                  height: 30px;
                  border-radius: 6px;
                  flex: none;
                  order: 1;
                  flex-grow: 1;
                  cursor: pointer;
                  color: rgba(0, 0, 0, 0.4);
              }
              .tab-is-active {
                  background: #FFFFFF;
                  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
                  border-radius: 6px;
                  color: rgba(0, 0, 0, 0.8);
                  font-weight: 600;
              }
          }
          .basic-tabs-pane {
              margin-top: 19px;
              .basic-table {
                width: 100%;
                table-layout: fixed;
                  th,
                  td {
                      border: 1px solid #e0ebff;
                      padding: 10px;
                  }
                  th {
                      color: rgba(0, 0, 0, 0.6);
                      font-size: 14px;
                      text-align: left;
                  }
                  td {
                      height: 40px;
                      max-height: 56px;
                      color: rgba(0, 0, 0, 0.8);
                      font-size: 13px;
                      & > span {
                          color: #3d82f2;
                          cursor: pointer;
                          margin-right: 16px;
                      }
                      & > div {
                          word-break: break-all;
                          width: 100%;
                          max-height: 56px;
                          display: -webkit-box;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                          overflow: hidden;
                      }
                  }
                  tr {
                      &:nth-of-type(odd) {
                          background-color: #f7faff;
                      }
                      &:first-of-type {
                          background-color: #ecf3ff;
                      }
                  }

                  .check-img {
                      width: 16px;
                      height: 16px;
                      margin-right: 6px;
                      cursor: pointer;
                  }
              }

              .add-btn {
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                  gap: 2px;
                  height: 28px;
                  margin-top: 16px;
                  margin-bottom: 15px;
              }

              .textarea-style {
                  width: 490px;
                  height: 250px;
                  overflow: scroll;
                  overflow-y: hidden;
                  :deep(.scrollbar) {
                      display: none !important;
                  }
                  :deep(.margin) {
                      display: none !important;
                  }
                  :deep(.monaco-scrollable-element) {
                      margin-left: -45px;
                      width: 462px;
                  }
              }

              .sub-text {
                  font-weight: 400;
                  font-size: 12px;
                  color: rgba(0, 0, 0, 0.4);
                  margin-left: 10px;
                  text-align: right;
                  margin-bottom: 8px;
              }

          }
      }

      .info-text {
          color: #2B67FF;
          cursor: pointer;
      }

      .row {
          display: grid;
          grid-template-columns: 100px auto;
          height: 32px;
          align-items: center;
          // margin-bottom: 15px;

          .col1::after {
              content: ':';
              position: relative;
              top: -0.5px;
              margin: 0 8px 0 2px;
          }
          .col1::before { 
              display: inline-block;
              margin-right: 4px;
              color: #ff4d4f;
              font-size: 14px;
              font-family: SimSun, sans-serif;
              line-height: 1;
              content: '*';
          }

          .col2 {
              height: 32px;
              display: flex;
              align-items: center;
              flex-wrap: wrap;

              .ml8mr20 {
                  margin-left: 8px;
                  margin-right: 20px;
              }

              .wid276 {
                  width: 276px;
              }

              .col3 {
                  height: 60px;
                  display: flex;
                  align-items: center;
              }
          }
      }
    }

      .btnWrap {
        padding-top: 17px;
        padding-right: 24px;
        text-align: right;
        button {
            margin-left: 24px;
            &:first-of-type {
            margin-left: 0;
            }
        }
    }
  }

  .ant-form-item{
    margin-bottom: 16px;
  }
  /deep/.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
  .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper,
  .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper,
  .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover,
  .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:hover,
  .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper:hover {
      border: 1px solid #ff4d4f !important;
  }

</style>