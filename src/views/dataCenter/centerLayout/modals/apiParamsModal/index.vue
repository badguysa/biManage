<template>
    <div className='apiImportModal'>
        <div class="maskLayer"></div>
        <div class="popDiv wid500">
            <div class="popuHead">
                <span class="popClose fr" @click="cancel"><img class="img1" :src="closeImg" /></span>
                <p class="fl colorDeep" v-if="isEdit">{{ t('api.editParams') }}</p>
                <p class="fl colorDeep" v-else>{{ t('api.addParams') }}</p>
            </div>
            <div className='modalBody'>
                <a-form ref="formRef" :model="formState" v-bind="layout">
                    <a-form-item name="name" :label="t('api.paramsName')">
                        <input style="width: 344px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.name">
                    </a-form-item>
                    <a-form-item name="method" :label="t('api.getParams')">
                        <a-radio-group v-model:value="paramsMethods" @change="changeState">
                            <template v-for="item in paramsMethodsOption" :key="item.value">
                                <a-tooltip v-if="item.value=='otherTable'&&isOtherTableDisable">
                                    <template #title>请勿重复添加</template>
                                    <a-radio :value="item.value" disabled>
                                        {{ t(item.label) }}
                                    </a-radio>
                                </a-tooltip>
                                <a-radio v-else :value="item.value" :disabled="item.value=='otherTable'&&isOtherTableDisable">
                                    {{ t(item.label) }}
                                </a-radio>
                            </template>                            
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item name="value" :label="t('api.paramsValue')">
                        <div class="code-div" style="position: reactive;">
                            <!-- 自定义参数 -->
                            <textarea v-if="paramsMethods === 'custom'" disabled :title="customReviewContent" class="text-area" :value="customReviewContent"></textarea>
                            <input v-else-if="!paramValue" :disabled="showInfo" style="width: 344px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.value">
                            <input v-else-if="paramValue" :disabled="showInfo" style="width: 344px;" :placeholder="t('common.pleaseEnter')" type="text" :value="paramValue">
  
                        </div>
                    </a-form-item>
                    <template v-if="paramsMethods === 'realTime'">
                        <a-divider></a-divider>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label">{{ t('api.apiAddress') }} &nbsp;:</span><input style="width: 344px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.realTimeValue.url" />
                            </div>
                        </div>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label">{{ t('api.authType') }}&nbsp;:</span>
                                <a-select 
                                    v-model:value="formState.realTimeValue.authenticationVo.type" 
                                    style="width: 344px;" 
                                    @select="selectAuth"
                                    :getPopupContainer="triggerNode => triggerNode.parentNode"
                                >
                                    <a-select-option value="no auth">No Auth</a-select-option>
                                    <a-select-option value="basic auth">Basic Auth</a-select-option>
                                </a-select>
                            </div>
                        </div>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label">{{ t('api.type') }}&nbsp;:</span>
                                <a-radio-group v-model:value="formState.realTimeValue.method">
                                    <a-radio value="get" style="margin-bottom:0;">GET</a-radio>
                                    <a-radio value="post" style="margin-bottom:0;">POST</a-radio>
                                </a-radio-group>
                            </div>
                        </div>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label">{{ t('api.requestFreq') }} &nbsp;:</span>
                                <a-select 
                                    v-model:value="formState.realTimeValue.setExpire" 
                                    style="width: 150px; margin-right:10px"
                                    @select="selectRequestFreq"
                                >
                                    <a-select-option :value="0">每次</a-select-option>
                                    <a-select-option :value="1">自定义频率</a-select-option>
                                </a-select>
                                <input 
                                    v-if="formState.realTimeValue.setExpire"
                                    style="width: 100px;padding-right: 24px;"
                                    type="number" 
                                    v-model="formState.realTimeValue.expire"
                                    :max="86400"
                                    :min="10"
                                    @change="validateExpire"
                                />
                                <span class="unit" v-if="formState.realTimeValue.setExpire">秒</span>
                            </div>
                        </div>
                        <template v-if="formState.realTimeValue.authenticationVo.type === 'basic auth'">
                            <div class="params-row">
                                <div class="params-col">
                                    <span class="label">{{ t('common.username') }} &nbsp;:</span>
                                    <input 
                                        v-model="formState.realTimeValue.authenticationVo.authentication.username" 
                                        style="width: 344px;" 
                                        :placeholder="t('common.pleaseEnter')" 
                                        type="text" 
                                    />
                                </div>
                            </div>
                            <div class="params-row">
                                <div class="params-col">
                                    <span class="label">{{ t('common.password') }} &nbsp;:</span>
                                    <input 
                                        v-model="formState.realTimeValue.authenticationVo.authentication.password" 
                                        style="width: 344px;" 
                                        :placeholder="t('common.pleaseEnter')" 
                                        type="text" 
                                    />
                                </div>
                            </div>
                        </template>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label fw-600">{{ t('api.basicParams') }}</span>
                            </div>
                        </div>
                        <template v-for="item in formState.realTimeValue.params" :key="item.uuid">
                            <div class="params-row">
                                <div class="params-col">
                                    <span class="label"> {{ t('api.paramsName') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.name" />
                                </div>
                                <div class="params-col" style="margin-left: 15px;">
                                    <span class="label" style="width: 70px;">{{ t('api.paramsValue') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.value" />
                                    <img 
                                        class="del"
                                        src="@/assets/icons/delete.png" alt="delete"
                                        v-if="formState.realTimeValue.params.length > 1"
                                        @click="removeItem(item,0)"
                                    />
                                </div>
                            </div>
                        </template>
                        <myButton class="add-btn" style="margin-left:0" @click="() => { addParams(0) }">
                            <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />{{ t('api.addParams') }}
                        </myButton>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label fw-600">{{ t('api.header') }}</span>
                            </div>
                        </div>
                        <template v-for="item in formState.realTimeValue.headers" :key="item.uuid">
                            <div class="params-row">
                                <div class="params-col">
                                    <span class="label"> {{ t('api.paramsName') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.name" />
                                </div>
                                <div class="params-col" style="margin-left: 15px;">
                                    <span class="label" style="width: 70px;">{{ t('api.paramsValue') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.value" />
                                    <img 
                                        class="del"
                                        src="@/assets/icons/delete.png" alt="delete"
                                        v-if="formState.realTimeValue.headers.length > 1"
                                        @click="removeItem(item,1)"
                                    />
                                </div>
                            </div>
                        </template>
                        <myButton class="add-btn" style="margin-left:0" @click="() => { addParams(1) }">
                            <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />{{ t('api.addParams') }}
                        </myButton>
                        <div class="params-row">
                            <div class="params-col">
                                <span class="label fw-600">{{ t('api.bodyParams') }}</span>
                            </div>
                        </div>
                        <template v-for="item in formState.realTimeValue.bodyParams" :key="item.uuid">
                            <div class="params-row">
                                <div class="params-col">
                                    <span class="label"> {{ t('api.paramsName') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.name" />
                                </div>
                                <div class="params-col" style="margin-left: 15px;">
                                    <span class="label" style="width: 70px;">{{ t('api.paramsValue') }} &nbsp;:</span><input style="width: 100px;" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="item.value" />
                                    <img 
                                        class="del"
                                        src="@/assets/icons/delete.png" alt="delete"
                                        v-if="formState.realTimeValue.bodyParams.length > 1"
                                        @click="removeItem(item,2)"
                                    />
                                </div>
                            </div>
                        </template>
                        <myButton class="add-btn" style="margin-left:0" @click="() => { addParams(2) }">
                            <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />{{ t('api.addParams') }}
                        </myButton>
                        <a-divider></a-divider>
                        <myButton class="add-btn" style="margin-left:0" @click="previewData">
                            {{ t('api.previewAndSelectValue') }}
                        </myButton>
                        <div class="pr-grid-box" style="margin-top: 8px;">
                            <div style="overflow-x: scroll; overflow-y: hidden">
                                <Menu flag="first" :propsData="paramsRequestData" />
                            </div>
                            <div>
                                <Menu flag="third" :propsData="paramsRequestData" />
                            </div>
                        </div>
                    </template>
                    <template v-if="paramsMethods === 'encryption'">
                        <a-divider></a-divider>
                        <a-form-item name="method" :label="t('api.encType')">
                            <a-radio-group v-model:value="formState.encryptionValue.method" @change="changeEncState">
                                <a-radio v-for="item in encMethodsOption" :key="item.value" :value="item.value">
                                    {{ t(item.label) }}
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item v-if="codeList.length" name="select" :label="t('api.selectParams')">
                            <div class="code-list">
                                <div class="code-item" v-for="item in codeList" :key="item.uuid" @click="selectCode(item)">
                                    <img v-if="item.apiSelect" style="width: 16px;" src="@/assets/icons/is_select.png" alt="">
                                    <img v-else style="width: 16px;" src="@/assets/icons/not_select.png" alt="">
                                    <div class="code-text">{{ item.name }}={{ item.value }}</div>
                                </div>
                            </div>
                        </a-form-item>
                        <a-form-item v-if="formState.encryptionValue.method === 'des'" name="key" :label="t('api.encKey')">
                            <input type="text" v-model="formState.encryptionValue.key" :placeholder="t('api.eightEncKey')">
                        </a-form-item>
                        <a-form-item  v-if="formState.encryptionValue.method === 'md5'" name="bytes" :label="t('api.place')">
                            <a-radio-group v-model:value="formState.encryptionValue.bytes">
                                <a-radio v-for="item in md5Option" :key="item.value" :value="item.value">
                                    {{ t(item.label) }}
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item :label="t('api.encContent')">
                            <Codemirror 
                                fromFlag="apiParams" 
                                @getEditorParams="getEditorParams"
                                @getEditorText="getEditorText"
                                ref="editorRef" 
                                :placeholder="editorPlaceholder" 
                            />
                            <myButton style="margin-left: 0;" class="add-btn" @click="encrypt">{{ t('api.executeEnc') }}</myButton>
                            <textarea :title="formState.value" :placeholder="t('api.encResult')" disabled class="text-area" :value="formState.value"></textarea>
                        </a-form-item>
                    </template>
                    <template v-if="paramsMethods === 'dynamic'">
                        <a-divider></a-divider> 
                        <a-form-item name="code" :label="t('api.dynamicParams')">
                            <a-radio-group v-model:value="formState.dynamicValue.code">
                                <a-radio :style="radioStyle" v-for="item in dynamicRules" :key="item.value" :value="item.value">
                                    <template v-if="item.value">
                                        {{ t(item.label) }}
                                    </template>
                                    <template v-else>
                                        <input type="text" @focus="formState.dynamicValue.code = 0" :placeholder="t(item.label)" v-model="formState.dynamicValue.fmt">
                                    </template>
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item name="carry" :label="t('api.setParamsFunc')">
                            <a-radio-group v-model:value="formState.dynamicValue.carry">
                                <a-radio :style="radioStyle" v-for="item in setParamsOptions" :key="item.value" :value="item.value">
                                    {{ t(item.label) }}
                                </a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item :label="t('api.previewContent')">
                            <myButton style="margin-left: 0; margin-top: 0;" class="add-btn" @click="dynamicEncrypt">{{ t('sql.preview') }}</myButton>
                            <textarea :title="formState.value" :placeholder="t('api.encResult')" disabled class="text-area" :value="formState.value"></textarea>
                        </a-form-item>
                    </template>
                    <template v-if="paramsMethods === 'custom'">
                        <a-divider></a-divider> 
                        <a-form-item :label="t('apiManage.selectTemplate')">
                            <selectTemplate :value="formState.customValue.tmplId" @update:value="selectTempFn" style="width: 348px; min-width: unset;"/>
                        </a-form-item>
                        <a-form-item :label="t('api.paramsContent')">
                            <textarea class="text-area" v-model="formState.customValue.tmplContent"/>
                        </a-form-item>
                        <a-form-item :label="t('api.previewContent')">
                            <myButton style="margin-left: 0; margin-top: 0;" class="add-btn" @click="customPreview">{{
                                t('sql.preview') }}</myButton>
                            <textarea :title="customReviewContent" disabled class="text-area"
                                :value="customReviewContent"></textarea>
                        </a-form-item>
                    </template>
                    <template v-if="paramsMethods === 'otherTable'">
                        <a-divider></a-divider>
                        <a-form-item>
                            <template #label>
                                <span>{{ t('apiManage.selectDependencyTable') }}
                                <a-tooltip overlayClassName="syncDelTooltip">
                                    <template #title>
                                    <p>选择中台内的数据表，用于通过表内字段，来逐个查询本接口内的信息</p>
                                    </template>
                                    <img style="width: 12px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                                </span>
                            </template>
                            <selectTableTree :selectedKeys="[formState.otherTable.tableId]" @select="selectFn" />
                        </a-form-item>
                        <a-form-item>
                            <template #label>
                                <span>{{ t('apiManage.selectCode') }}
                                <a-tooltip overlayClassName="syncDelTooltip">
                                    <template #title>
                                    <p>用于逐个查询取值的字段</p>
                                    </template>
                                    <img style="width: 12px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                                </span>
                            </template>
                            <a-select v-model:value="formState.otherTable.columnId" style="width: 344px;"
                                @select="selectOtherTableCode"
                                :getPopupContainer="triggerNode => triggerNode.parentNode">
                                <a-select-option v-for="item in otherTableCodeOptions" :value="item.id">
                                    <img class="icon" :src="getIconSrc(item)" alt="code" />
                                    {{ item.columnAlias?item.columnAlias:item.columnName }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
                </a-form>
            </div>
  
            <div class="popuBottom shadowBox">
                <myButton class="fr mr25" @click="onOK" type="primary" :disabled="isDisabled">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { modalStore } from '@/Stores/modalStore';
  import { mainStore } from '@/Stores/mainStore';
  import { storeToRefs } from 'pinia'
  import { apiConnectTest, getEncryptStr, getDynamicStr, getCustomParamPreviewRes } from '@/apis/apiImport';
  import { parseParamsData } from '@/utils/apiParse'
  import closeImg from '@/assets/icons/close.png'
  import myButton from '../../../../../components/buttons/myButton'
  import Menu from './menu.vue'
  import { message } from 'ant-design-vue';
  import Codemirror from '@/components/codeEditor/index.vue'
  import selectTemplate from '@/views/systemManagement/components/selectTemplate'
  import selectTableTree from '../../components/selectTableTree'
  import { getIndexPreviewColumns } from '@/apis/group'
  import { getIconSrc, getimgType } from '@/utils/utils'
  import {
    getIndexPreviewData
} from '@/apis/group'
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n()
  const useModalStore = modalStore()
  const useMainStore = mainStore()
  const { 
    paramSettingType, 
    deleteData, 
    paramsRequestData, 
    paramValue, paramApiKey, 
    basciParamList,
    bodyParamList,
    headParamList, 
    pageFieldList,
    fieldIsEnc,
    secondFieldEnc
  } = storeToRefs(useMainStore)
  const layout = {
    labelCol: { span: 5.5,style: { width: '95px' } },
  }
  const radioStyle = reactive({
        display: 'flex',
        height: '30px',
        lineHeight: '30px',
  });
  const editorRef = ref()
  const paramsMethods = ref('fixed')
  const editorPlaceholder = ref(t('common.pleaseEnter'))
  const encString = ref('')
  const encMethodsOption = [{
    label: 'api.desEnc',
    value: 'des'
  }, {
    label: 'api.md5Enc',
    value: 'md5'
  }]
  const paramsMethodsOption = [{
    label: 'api.fixValue',
    value: 'fixed'
  }, {
    label: 'api.realTimeGet',
    value: 'realTime'
  }, {
    label: 'api.encGet',
    value: 'encryption'
  }, {
    label: 'api.dynamicParams',
    value: 'dynamic'
  }, {
    label: 'api.customParams',
    value: 'custom'
  }, {
    label: 'api.otherTable',
    value: 'otherTable'
  }]
  const md5Option = [{
    label: 'api.place32big',
    value: 1
  }, {
    label: 'api.place32small',
    value: 2
  }, {
    label: 'api.place16big',
    value: 3
  }, {
    label: 'api.place16small',
    value: 4
  },]
  const dynamicRules = [{
    label: "api.dynamicOpt1",
    value: 1
  },{
    label: "api.dynamicOpt2",
    value: 2
  },{
    label: "api.dynamicOpt3",
    value: 3
  },{
    label: "api.dynamicOpt6",
    value: 4
  },{
    label: "api.dynamicOpt7",
    value: 5
  }, {
    label: "api.custom",
    value: 0
  }]
  const setParamsOptions = [{
    label: "api.dynamicOpt4",
    value: true
  },{
    label: "api.dynamicOpt5",
    value: false
  }]
  const showInfo = ref(false)
  const formRef = ref()
  const formState = reactive({
    name: '',
    value: '',
    realTimeValue: {
        url: '',
        method: 'get',
        path: '',
        expire: '', // 频率过期时间
        setExpire: 0, // 是否设置频率
        authenticationVo: {
            type: 'no auth',
            authentication: {
                username: '',
                password: ''
            }
        },
        params: [{
            uuid: uuidv4(),
            name: '',
            value: ''
        }],
        headers: [{
            uuid: uuidv4(),
            name: '',
            from:'header',
            dataType: 'String',
            value: ''
        }],
        bodyParams: [{
            uuid: uuidv4(),
            name: '',
            value: ''
        }],
    },
    encryptionValue: {
        method: 'des', // "加密方式：des、md5"
        key: '', // "密钥"
        bytes: 1, // "位数：32位大1，32位小2，16位大3，16位小4"
        oldStr: '', // "含占位符的待加密串，占位符为{}"
        values: [
            {
                paramType: '', //  "参数类型：normal、header、body、pageSetting"
                paramName: '' // "参数名"
            }
        ]
    },
    dynamicValue: {
        code: 1,
        carry: true,
        fmt: ''
    },
    customValue: {
        tmplId: '',
        tmplContent: ''
    },
    otherTable: {
        tableId: '',
        columnId: ''
    }
  })
  
  const otherTableCodeOptions = ref([])

  const codeList = ref([])
  
  const isDisabled = computed(() => {
    if (showInfo.value) {
        if (paramsMethods.value === 'realTime') {
            if (paramValue.value) return false
        } else {
            if (formState.value) return false
        }
        return true
    }
    return false
  })

  const customReviewContent = computed(() => {
    let reviewContent = ''
    try{
        reviewContent = formState.value ? JSON.stringify(JSON.parse(formState.value), null, 4) : ''
    } catch(e) {
        console.log('e', e)
    } finally {
        return reviewContent
    }
  })
  
  const isEdit = computed(() => {
    return paramSettingType.value.toLowerCase().indexOf('edit') > -1
  })

  const isOtherTableDisable = computed(() => {    
    let paramsList = [...basciParamList.value, ...headParamList.value, ...bodyParamList.value]
    let currentParamsList = []
    if(isEdit.value){
        currentParamsList = [deleteData.value]
    }else{
        if(paramSettingType.value  == 'basicParamAdd'){
            currentParamsList = basciParamList.value
        }else if(paramSettingType.value  == 'headParamAdd'){
            currentParamsList = headParamList.value
        }else if(paramSettingType.value  == 'bodyParamAdd'){
            currentParamsList = bodyParamList.value
        }
    }
    let otherTableList = paramsList.filter(i => i.type === "otherTable")
    let curOtherTableList = currentParamsList.filter(i => i.type === "otherTable")    
    // 且只有一个其他表参数，不可编辑，otherTable的类型在其他参数中设置有一个，就不能再添加了
    if(otherTableList.length == 1){
        // 如果是编辑状态，且是本条
        if(curOtherTableList.length <= 1){
            // 编辑状态，如果全部参数有一条otherTable，并且是本条，可以编辑
            if(isEdit.value){
                return false
            }else{
                // 添加状态，如果全部参数有一条otherTable，并且是本类型，不可以编辑
                return true
            }
        }else{
            // 如果全部参数有一条otherTable，且当前的length大于1，不可以编辑
            return true
        }
    }else if(otherTableList.length == 0){
        // 如果全部参数没有otherTable，可以编辑
        return false
    }else{
        // 如果全部参数有大于一条的otherTable，不可以编辑
        return true
    }
  })
  
  onMounted(() => {
    codeList.value = [...basciParamList.value, ...headParamList.value, ...bodyParamList.value, ...pageFieldList.value]
    codeList.value.length && codeList.value.forEach(i => i.apiSelect = false)
    paramsMethods.value = deleteData.value.type || 'fixed'
    if (paramSettingType.value.toLowerCase().indexOf('edit') > -1) {
        formState.name = deleteData.value.name
        if (deleteData.value.type === 'realTime') { // 如果为实时获取的参数
            showInfo.value = true
            formState.realTimeValue = deleteData.value.realTimeValue
            if(deleteData.value.realTimeValue.expire){
                formState.realTimeValue.setExpire = 1
            }else{
                formState.realTimeValue.setExpire = 0
            }
            useMainStore.setParamValue(deleteData.value.value)
            useMainStore.setParamApiKey(deleteData.value.realTimeValue.path)
        } else if (deleteData.value.type === "encryption") { // 加密
            showInfo.value = true
            formState.encryptionValue = deleteData.value.encryptionValue
            formState.value = deleteData.value.value
            editorPlaceholder.value = deleteData.value.placeholder
        } else if (deleteData.value.type === "dynamic") {
            showInfo.value = true
            formState.dynamicValue = deleteData.value.dynamicValue
            formState.value = deleteData.value.value
        } else if (deleteData.value.type === "custom") {
            showInfo.value = true
            formState.customValue = deleteData.value.customValue
            formState.value = deleteData.value.value
        } else if (deleteData.value.type === "otherTable") {
            showInfo.value = true
            formState.otherTable = deleteData.value.otherTableValue
            formState.value = deleteData.value.value
        } else { // 普通
            formState.value = deleteData.value.value
        }
        if (codeList.value.length) { // 编辑时过滤掉自身，自身不能作为自身的加密参数
            codeList.value = codeList.value.filter(i => i.uuid !== deleteData.value.uuid)
        }
    }
  })
  
  onUnmounted(() => {
    useMainStore.setDeleteData({})
    useMainStore.setParamsRequestData([])
    useMainStore.setParamValue('')
    useMainStore.setParamApiKey('')
  })
  
  const selectAuth = (v) => {
    if (v === 'no auth') {
        formState.realTimeValue.authenticationVo.authentication.password = ''
        formState.realTimeValue.authenticationVo.authentication.username = ''
    }
  }
  
  const selectRequestFreq = (val)=>{
    if(val === 0){
        formState.realTimeValue.expire = ''
    }
  }
  const selectCode = record => {
    // if (record.apiSelect) return
    record.apiSelect = !record.apiSelect
    if (record.apiSelect) {
        record.isEnc = true
        if (record.uuid === '123') { // 第一偏移值
            fieldIsEnc.value = true
        } else if (record.uuid === '456') { // 第二偏移值
            secondFieldEnc.value = true
        }
        editorRef.value.updateEditorText('apifield', record)
    } else {
        const tempList = codeList.value.filter(i => i.uuid !== deleteData.value?.uuid)
        let uuids = []
        tempList.forEach(i => {
            if (i.type === "encryption" && i.encryptionValue.values.length) {
                i.encryptionValue.values.forEach(c => {
                    uuids.push(c.uuid)
                })
            }
        })
        if (record.uuid === '123' && !uuids.includes(record.uuid)) { // 第一偏移值
            fieldIsEnc.value = false
        } else if (record.uuid === '456' && !uuids.includes(record.uuid)) { // 第二偏移值
            secondFieldEnc.value = false
        }
        record.isEnc = false
        editorRef.value.removeEditorNode(record.uuid)
    }
  }
  
  const getEditorParams = value => {
    if (value.length) {
        const uids = value.map(i => i.uuid)
        codeList.value.forEach(i => {
            if (!uids.includes(i.uuid)) {
                i.apiSelect = false
            }
        })
    } else {
        codeList.value.forEach(i => {
            i.apiSelect = false
        })
    }
  }
  const getEditorText = (value) => {
    encString.value = value
  }
  
  // 加密参数
  const encrypt = () => {
    if (!editorRef.value.code) return message.warn(t('api.enterEncKey'))
    if (formState.encryptionValue.method === 'des' && formState.encryptionValue.key.length !== 8) return message.warn(t('api.encLengthTip'))
    let originalStrText = '', oldStrText = ''
    let encValues = []
    encString.value.forEach(i => {
        if (i.nodeName === '#text') {
            originalStrText += i.nodeValue
            oldStrText += i.nodeValue
        } else if (i.nodeName === 'SPAN') {
            if (i.textContent) {
                const apiuid = i.children[0].getAttribute('apiuid')
                codeList.value.forEach(codeItem => {
                    if (codeItem.uuid === apiuid) {
                        encValues.push(codeItem)
                    }
                })
                originalStrText += i.textContent
                oldStrText += '{}'
            }
        }
    })
    const { method, bytes, key } = formState.encryptionValue
    const jsonData = {
        method,
        bytes,
        key,
        originalStr: originalStrText,
    }
    getEncryptStr(jsonData).then(res => {
        if (res.code == 1) {
            formState.value = res.message
        } else {
            message.warn(res.message)
        }
    })
    formState.encryptionValue.oldStr = oldStrText
    formState.encryptionValue.values = encValues.map(i => ({
        paramType: i.from,
        paramName: i.name,
        uuid: i.uuid
    }))
  }

    // 动态加密   
  const dynamicEncrypt = () => {
    getDynamicStr({
        code: formState.dynamicValue.code,
        fmt: formState.dynamicValue.fmt
    }).then(res => {
        if (res.code === 1) {
            formState.value = res.message
        } else {
            message.error(res.message)
        }
    })
  }

  // 自定义参数预览
  const customPreview = () => {
    getCustomParamPreviewRes({
        // tmplId: formState.customValue.tmplId,
        tmplContent: formState.customValue.tmplContent.trim()
    }).then((res) => {
        if(res.code === 1) {
            formState.value = res.data
        } else {
            message.error(res.message)
        }
    })
  }
  
  // 切换获取参数方式
  const changeState = (e) => {
    const key = e.target.value
    if (key !== 'fixed') {
        showInfo.value = true
        formState.value = ''
        if (key === 'realTime') {
            formState.realTimeValue = {
                url: '',
                method: 'get',
                path: '',
                expire: '', // 频率过期时间
                setExpire: 0, // 是否设置频率
                authenticationVo: {
                    type: 'no auth',
                    authentication: {
                        username: '',
                        password: ''
                    }
                },
                params: [{
                    uuid: uuidv4(),
                    name: '',
                    value: ''
                }],
                headers: [{
                    uuid: uuidv4(),
                    name: '',
                    from:'header',
                    dataType: 'String',
                    value: ''
                }],
                bodyParams: [{
                    uuid: uuidv4(),
                    name: '',
                    value: ''
                }],
            }
        } else if (key === 'encryption') {
            formState.encryptionValue = {
                method: 'des', // "加密方式：des、md5"
                key: '', // "密钥"
                bytes: 1, // "位数：32位大1，32位小2，16位大3，16位小4"
                oldStr: '', // "含占位符的待加密串，占位符为{}"
                values: [
                    {
                        paramType: '', //  "参数类型：normal、header、body、pageSetting"
                        paramName: '' // "参数名"
                    }
                ]
            }
        } else if (key === 'dynamic') {
            formState.dynamicValue = {
                code: 1,
                carry: true,
                fmt: ''
            }
        } else if (key === 'custom') {
            formState.customValue = {
                tmplId: '',
                tmplContent: ''
            }
        }
    } else {
        formState.value = ''
        showInfo.value = false
    }
  }
  
  // 切换加密方式
  const changeEncState = (e) => {
  
  }
  
  // 添加参数
  // type 0:基础参数 1：body参数
  const addParams = (type) => {
    if(type===0){
        formState.realTimeValue.params.push({
            uuid: uuidv4(),
            name: '',
            value: ''
        })
    }else if(type===1){
        formState.realTimeValue.headers.push({
            uuid: uuidv4(),
            name: '',
            from:'header',
            dataType: 'String',
            value: ''
        })
    }else{
        formState.realTimeValue.bodyParams.push({
            uuid: uuidv4(),
            name: '',
            value: ''
        })
    }
  }
  
  // 预览数据
  const previewData = () => {
    // let showBody = false
    // // 只有满足请求头参数&&实施参数&&POST请求  此时弹窗中的接口传递的属性应加上body
    // if((paramSettingType.value.indexOf('headParam') > -1) && paramsMethods.value === 'realTime' &&  formState.realTimeValue.method === 'post'){
    //     showBody = true
    // }
    const jsonData = {
        url: formState.realTimeValue.url,
        method: formState.realTimeValue.method,
        params: {
            authenticationVo: formState.realTimeValue.authenticationVo,
            normal: formState.realTimeValue.params,
            body: formState.realTimeValue.bodyParams,
            header: formState.realTimeValue.headers
        }
    }
    apiConnectTest(jsonData).then(res => {
        if (res.code == 1) {
            const resData = JSON.parse(res.message)
            useMainStore.setParamsRequestData(parseParamsData(resData))
        } else {
            message.error(res.message)
        }
    })
  }
  
  // 移除参数象
  const removeItem = (record,type) => {
    if(type ===0){
        formState.realTimeValue.params = formState.realTimeValue.params.filter(item => item.uuid !== record.uuid)
    }else if(type ===1){
        formState.realTimeValue.headers = formState.realTimeValue.headers.filter(item => item.uuid !== record.uuid)
    }else{
        formState.realTimeValue.bodyParams = formState.realTimeValue.bodyParams.filter(item => item.uuid !== record.uuid)
    }
  }
  
  const cancel = () => {
    useModalStore.changeApiParamsModalVisible()
  }
  
  const getPath = key => {
    const arr = key.split('##').splice(1, key.split('##').length)
    let str = ''
    for (let i = 0; i < arr.length; i++) {
        str += arr[i] + '.'
    }
    str = str.substring(0, str.length - 1)
    return '$.' + str
  }

  const selectTempFn = (id, content) => {
    formState.customValue.tmplId = id
    formState.customValue.tmplContent = content
    // 删除模板 重置参数值
    if(!id) {
        formState.value = ''
    }
  }
  
  const validateExpire = (event)=>{
    const value = event.target.value;
    if (value < 60) {
        formState.realTimeValue.expire = 60;
    }else if(value > 86400){
        formState.realTimeValue.expire = 86400;
    }
  }

  // 选择参考模板回调
const selectFn = async (node) => {
    const params = {
        tableId: node.id
    }
    let res = await getIndexPreviewColumns(params)

    if(res.code !== 1) message.error(res.message)
    formState.otherTable.tableId = node.id
    otherTableCodeOptions.value = res.data.map(item => {
        return {
            imgType: getimgType(item.columnType),
            ...item
        }
    })
}

const selectOtherTableCode =async ()=>{
    let params = {
        tableId: formState.otherTable.tableId,
        pageNum: 1,
        pageSize: 100,
        displaySize: 100
    }
    let res = await getIndexPreviewData(params)
    if(res.code !== 1) message.error(res.message)
    let target = otherTableCodeOptions.value.find(item => item.id === formState.otherTable.columnId)
    let targetColumnName = target.columnName
    if(res.data&&res.data.records&&res.data.records.length){
        formState.value = res.data.records[0][targetColumnName]
    }
}

  const onOK = () => {
    formRef.value.validateFields().then((res) => {
        if (res) {
            if (!formState.name) return message.warn(t('api.enterParamName'))
            const basicData = {
                name: res.name,
                value: res.value,
                placeholder: editorRef.value?.code
            }
            if (paramsMethods.value === 'realTime') {
                basicData.value = paramValue.value
            } else if (paramsMethods.value === 'encryption' || paramsMethods.value === 'dynamic') {
                basicData.value = formState.value
            }
            formState.realTimeValue.path = paramApiKey.value ? (paramApiKey.value.indexOf('#') > -1 ? getPath(paramApiKey.value) : paramApiKey.value) : ''
            if (paramSettingType.value === 'basicParamAdd') { // 普通参数新增
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'realTime',
                        from: 'normal',
                        isSelect: true,
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'encryption',
                        from: 'normal',
                        isSelect: true,
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'dynamic',
                        from: 'normal',
                        isSelect: true,
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'custom',
                        isSelect: true,
                        from: 'normal',
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'otherTable',
                        isSelect: true,
                        from: 'normal',
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: uuidv4(),
                    type: 'fixed',
                    isSelect: true,
                    from: 'normal',
                    dataType: 'String',
                    ...basicData
                }
                useMainStore.setBasciParamList(list, 'add')
            } 
            else if (paramSettingType.value === 'basicParamEdit') { // 普通参数编辑
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'realTime',
                        from: 'normal',
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'encryption',
                        from: 'normal',
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'dynamic',
                        from: 'normal',
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'custom',
                        from: 'normal',
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'otherTable',
                        from: 'normal',
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: deleteData.value.uuid,
                    type: 'fixed',
                    from: 'normal',
                    dataType: deleteData.value.dataType,
                    ...basicData
                }
                useMainStore.setBasciParamList(list, 'edit')
            }
            if (paramSettingType.value === 'bodyParamAdd') { // body参数新增
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'realTime',
                        from: 'body',
                        isSelect: true,
                        dataType: 'String',
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'encryption',
                        isSelect: true,
                        from: 'body',
                        dataType: 'String',
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'dynamic',
                        from: 'body',
                        dataType: 'String',
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'custom',
                        isSelect: true,
                        from: 'body',
                        dataType: 'String',
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: uuidv4(),
                        type: 'otherTable',
                        isSelect: true,
                        from: 'body',
                        dataType: 'String',
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: uuidv4(),
                    type: 'fixed',
                    from: 'body',
                    isSelect: true,
                    dataType: 'String',
                    ...basicData
                }
                useMainStore.setBodyParamList(list, 'add')
            } 
            else if (paramSettingType.value === 'bodyParamEdit') { // body参数编辑
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'realTime',
                        from: 'body',
                        dataType: deleteData.value.dataType,
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'encryption',
                        from: 'body',
                        dataType: deleteData.value.dataType,
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'dynamic',
                        from: 'body',
                        dataType: deleteData.value.dataType,
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'custom',
                        from: 'body',
                        dataType: deleteData.value.dataType,
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        type: 'otherTable',
                        from: 'body',
                        dataType: deleteData.value.dataType,
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: deleteData.value.uuid,
                    type: 'fixed',
                    from: 'body',
                    dataType: deleteData.value.dataType,
                    ...basicData
                }
                useMainStore.setBodyParamList(list, 'edit')
            }
            else if (paramSettingType.value === 'headParamAdd') { // 头参数新增
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'realTime',
                        from: 'header',
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'encryption',
                        from: 'header',
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'dynamic',
                        from: 'header',
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'custom',
                        from: 'header',
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: uuidv4(),
                        isSelect: true,
                        type: 'otherTable',
                        from: 'header',
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: uuidv4(),
                    isSelect: true,
                    type: 'fixed',
                    from: 'header',
                    dataType: 'String',
                    ...basicData
                }
                useMainStore.setHeadParamList(list, 'add')
            }
            else if (paramSettingType.value === 'headParamEdit') { // 头参数编辑
                let paramsObj = {}
                if (paramsMethods.value === 'realTime') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        isSelect: deleteData.value.isSelect,
                        type: 'realTime',
                        from: 'header',
                        realTimeValue: formState.realTimeValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'encryption') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        isSelect: deleteData.value.isSelect,
                        type: 'encryption',
                        from: 'header',
                        encryptionValue: formState.encryptionValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'dynamic') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        isSelect: deleteData.value.isSelect,
                        type: 'dynamic',
                        from: 'header',
                        dynamicValue: formState.dynamicValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'custom') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        isSelect: deleteData.value.isSelect,
                        type: 'custom',
                        from: 'header',
                        customValue: formState.customValue,
                        ...basicData
                    }
                } else if (paramsMethods.value === 'otherTable') {
                    paramsObj = {
                        uuid: deleteData.value.uuid,
                        isSelect: deleteData.value.isSelect,
                        type: 'otherTable',
                        from: 'header',
                        otherTableValue: formState.otherTable,
                        ...basicData
                    }
                }
                const list = showInfo.value ? paramsObj : {
                    uuid: deleteData.value.uuid,
                    isSelect: deleteData.value.isSelect, 
                    type: 'fixed',
                    from: 'header',
                    dataType: deleteData.value.dataType,
                    ...basicData
                }
                useMainStore.setHeadParamList(list, 'edit')
            }
            useModalStore.changeApiParamsModalVisible()
        }
    })
  }
  </script>
  
  <style lang="less" scoped>
  .apiImportModal {
  
    .img1 {
        width: 16px;
    }
  
    .modalBody {
        padding: 24px;
        padding-right: 10px;
        max-height: 70vh;
        width: 500px;
        overflow-y: scroll;
        overflow-x: hidden;
        :deep(.ant-form-item){
            margin-bottom: 16px;
            &:last-child{
                margin-bottom: 24px;
            }
        }
        :deep(.ant-form-item-label) {
            width: 90px;
            text-align: left;
            label {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                white-space: normal;
                height: auto;
                margin-top: 5px;
            }
        }
        :deep(.ant-col-5) {
            flex: 0 0 16.5%;
        }
        :deep(.ant-form label) {
            font-size: 13px !important;
            margin-bottom: 12px;
            &:last-child{
                margin-bottom: 0;
            }
        }
        :deep(.selectInput){
            width: 348px;
        }
        .code-div {
            position: relative;
            .inner-text {
                position: absolute;
                right: 5px;
                top: 2px;
                z-index: 5;
                width: 58px;
                height: 28px;
                background: #F3F3F3;
                line-height: 29px;
                color: #2B67FF;
                cursor: pointer;
                font-size: 13px;
            }
        }
        .code-list {
            display: flex;
            flex-wrap: wrap;
            .code-item {
                height: 36px;
                display: flex;
                margin-right: 12px;
                align-items: center;
                width: 45%;
                margin-bottom: 8px;
                img {
                    width: 16px;
                    cursor: pointer;
                    margin-right: 8px;
                }
                .code-text {
                    width: 87%;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
        }
        .text-area {
            width: 348px;
            height: 120px;
            padding: 6px 12px;
            border: none;
            background: #F3F3F3;
            border-radius: 0px; // border-radius会造成textarea的模糊效果
        }
        .params-row {
            display: flex;
            .params-col {
                margin-top: 16px;
                position: relative;
                .unit{
                    position: absolute;
                    right: 5px;
                    top: 5px;
                    color: #A09E9E;
                }
                input {
                    // margin-left: 8px;
                }
                .label {
                    display: inline-block;
                    width: 90px;
                }
                .fw-600{
                    font-weight: 600;
                }
            }
            .del {
                width: 16px;
                margin-left: 10px;
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
            margin-left: 20px;
        }
  
        .pr-grid-box {
            display: grid;
            grid-template-columns: 192px 200px auto;
            margin-top: 16px;
            .grid-th {
                font-weight: 600;
                font-size: 13px;
                color: rgba(0, 0, 0, 0.6);
            }
        }
    }
  }
    .icon {
        width: 16px;
        height: 16px;
    }
  </style>