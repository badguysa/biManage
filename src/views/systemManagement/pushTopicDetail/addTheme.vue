<template>
    <div class="add-theme">
        <back @backFn="goBack"/>
        <div class="theme-header">
            <span class="theme-title">{{ props.operFlag === 'add' ? t('pushManage.addTheme') : t('pushManage.editTheme') }}</span>
            <div class="mainWrap">
                <div class="stepWrap">
                    <div class="progress-line">
                        <div v-for="(step, i) in stepInfo" :class="{'pro-box': true, active: activeKey === i}" @click="stepClick(i)">
                            <div :class="[activeKey !== i ? 'cricle gray-bgc' : 'cricle blue-bgc']">{{ i+1 }}</div>
                            <span :class="[activeKey !== i ? 'blue-text' : 'gray-text']">{{ step.label }}</span>
                        </div>
                    </div>
                    <div class="btn-group">
                        <myButton @click="handleTopEvent(1)" v-if="activeKey !== 0">{{ t('api.lastStep') }}</myButton>
                        <myButton @click="handleTopEvent(2)" v-if="activeKey !== 2" type="primary">{{ t('api.nextStep') }}</myButton>
                        <myButton @click="handleTopEvent(3)" v-if="activeKey === 2" type="primary">{{ t('common.confirm') }}</myButton>
                    </div>
                </div>
                <div class="operateWrap">
                    <!-- 基础配置 -->
                    <div v-if="activeKey === 0" class="first-step">
                        <!-- 主题名称 -->
                        <div class="row">
                            <div class="col-left">{{ t('pushManage.themeName') }}</div>
                            <div class="col-right">
                                <input v-model="state.themeName" class="wid412" type="text">
                            </div>
                        </div>
                        <!-- 推送平台类型 -->
                        <div class="row">
                            <div class="col-left">{{ t('pushManage.pushPlatform') }}</div>
                            <div class="col-right">
                                <a-select v-model:value="state.pushPlatformType" :notFoundContent="t('common.noData')"  class="wid412">
                                    <a-select-option v-for="item in pushPlatform" :key="item.value" :value="item.value">
                                        {{ item.description }}
                                    </a-select-option>
                                </a-select>
                            </div>
                        </div>
                        <!-- 分割线 -->
                        <a-divider style="min-width: 500px; width: 500px; margin: 5px 0;"></a-divider>
                        <!-- 局部参数标题 -->
                        <div class="row">
                            <div class="title">{{ t('pushManage.partialParam') }}</div>
                        </div>
                        <!-- 局部参数 -->
                        <div class="row" v-for="item in state.partialParam" :key="item.uuid">
                            <div class="sub-col-left">{{ t('pushManage.paramsKey') }}</div>
                            <input v-model.trim="item.key" style="width: 160px;" type="text">
                            <div class="sub-col-left" style="margin-left: 30px;">{{ t('api.paramsValue') }}</div>
                            <input v-model.trim="item.value" style="width: 160px;" type="text">
                            <img v-if="state.partialParam.length > 1" @click="deleteParams(item)" class="delete-icon" src="@/assets/icons/delete.png" alt="delete" />
                        </div>
                        <!-- 添加局部参数 -->
                        <div class="row">
                            <myButton class="add-btn" @click="addParams">
                                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                                {{ t('api.addParams') }}
                            </myButton>
                        </div>
                    </div>
                    <!-- 选择数据，为保留自助配置状态，使用vshow控制 -->
                    <div v-show="activeKey === 1" class="second-step">
                        <!-- 选择模板和模式 -->
                        <div class="data-mode">
                            <div class="row">
                                <div class="col-left">{{ t('pushManage.dataTemplate') }}</div>
                                <div class="col-right">
                                    <selectTemplate v-model:value="state.queryTemplateId" style="width: 336px"/>
                                    <myButton @click="addTemplate" class="add-btn">
                                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                                        {{ t('selfConfig.add') }}
                                    </myButton>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-left">{{ t('pushManage.pushMode') }}</div>
                                <div class="col-right">
                                    <a-radio-group v-model:value="state.dataMode">
                                        <a-radio v-for="item in modeOption" :value="item.value" :key="item.value" :disabled="item.value===2 && (!enableIncreasePush || operDisabled)">
                                            <template v-if="item.value === 2">
                                                <a-tooltip overlayClassName="pushModeToolTip">
                                                    <template #title>
                                                        <p>{{ incrPushTipInfo.title }}</p>
                                                        <div>{{ incrPushTipInfo.content }}</div>
                                                    </template>
                                                {{ t(item.label) }}
                                                </a-tooltip>
                                            </template>
                                            <template v-else>
                                                {{ t(item.label) }}
                                            </template>
                                        </a-radio>
                                        
                                    </a-radio-group>
                                </div>
                            </div>
                            <!-- 全量推送展示更新频率 -->
                            <regularUpdateInput ref="regularUpdateRef" style="gap: 34px;" :updatePolicy="pushModeValue" :setType="`push_theme_${operFlag}`"/>
                        </div>
                    </div>
                    <!-- 设置推送方式 -->
                    <div v-if="activeKey === 2" class="third-step">
                        <div class="row">
                            <div :class="{'col-left': true, 'mt': showExplainDoc}">
                                {{ t('pushManage.pushPlatform') }}
                            </div>
                            <div class="col-right">
                                <a-select style="width: 100%;" v-model:value="state.pushMethod" @change="changePushMethod">
                                    <a-select-option @click="selectPushMethod(item)" v-for="item in pushMehtodList" :key="item.value" :value="item.value">
                                        {{ item.description }}
                                    </a-select-option>
                                </a-select>
                                <!-- 数据库推送/表单推送 说明文档 -->
                                <div class="explainWrap" v-if="showExplainDoc" @click="viewExplainDoc">
                                    <img src="@/assets/icons/interface_info.png" alt="explainIcon" >
                                    <span v-if="state.pushMethod===5">{{ t('pushManage.formExplainDoc') }}</span>
                                    <span v-else-if="state.pushMethod===6">{{ t('pushManage.dbExplainDoc') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="row" v-if="state.showTemplate">
                            <div class="col-left">数据渲染模板</div>
                            <div class="col-right">
                                <selectTemplate v-model:value="state.configKeys.pushTemplateId" style="width:396px;"/>
                            </div>
                        </div>
                        <template v-for="item in state.pushConfig" >
                            <div v-if="showPushConfigItem(item)" class="row" :style="{ height: item.type === 'map' && 'auto', alignItems: item.type === 'map' && 'flex-start' }">
                                <div :class="{'col-left': true, 'col-map': item.type === 'map'}" :title="item.name">
                                    <!-- 不为空 或者 当位增量推送并且名称为主键 -->
                                    <span class="notnull"
                                        v-if="item.valid === 'notnull' || ((item.key==='idColumnAlias'||item.key==='pkName') &&state.dataMode === 2 )"
                                    >*</span>
                                    {{ item.name }}
                                    <a-tooltip
                                        v-if="item.key === 'syncDel'"
                                        overlayClassName="syncDelTooltip"
                                    >
                                        <template #title>
                                            <p>{{ tooltipInfo.title }}</p>
                                            <div>{{ tooltipInfo.content }}</div>
                                        </template>
                                        <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                    </a-tooltip>
                                    <a-tooltip v-else-if="item.tooltip">
                                        <template #title>
                                            {{ item.tooltip }}
                                        </template>
                                        <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                    </a-tooltip>
                                </div>
                                <div class="col-right">
                                    <template v-if="item.type === 'text'">
                                        <!-- 数据库信息自动填充 -->
                                        <div v-if="item.key === 'addr'" class="autoInputWrap">
                                            <a-auto-complete
                                                class="dbAutoInput"
                                                v-model:value="state.configKeys[item.key]"
                                                :options="ipOptions"
                                                :disabled="autoDisabled"
                                                :placeholder="t('db.hostTip')"
                                                @search="onHostSearch"
                                                @select="onHostSelect" 
                                            />
                                            <img v-if="autoDisabled" class="clear-img" @click="resetDbState" src="@/assets/icons/clear.png" alt="">
                                        </div>
                                        <input v-else-if="item.key === 'password'"  type="text" style="width: 100%;-webkit-text-security: disc;" v-model.trim="state.configKeys[item.key]">
                                        <input v-else style="width: 100%;"  type="text" v-model.trim="state.configKeys[item.key]">
                                    </template>
                                    <template v-else-if="item.type === 'radio'">
                                        <a-radio-group style="width: 100%;" v-model:value="state.configKeys[item.key]">
                                            <a-radio v-for="radioItem in item.radioOption" :key="radioItem.value" :value="radioItem.value">
                                                {{ radioItem.label }}
                                            </a-radio>
                                        </a-radio-group>
                                    </template>
                                    <!-- 数据库推送方式 推送字段 -->
                                    <template v-else-if="item.key === 'columnsTypeMapper'">
                                        <div 
                                            :class="{
                                                'map-box': true,  
                                                [item.key]: true, 
                                                'createTable': state.configKeys['createTable'] === '1'
                                            }" 
                                            v-for="(mapItem, index) in state.configKeys[item.key]" 
                                            :key="mapItem.uuid"
                                        >
                                            <div class="sub-col-left">{{  item.keyName || t('pushManage.paramsKey') }}</div>
                                            <input :class="{repeatKey: repeatIndex === index}" @input="validatePushField(false)" v-model.trim="mapItem.key" type="text">
                                            <div class="sub-col-left" style="margin-left: 20px;">{{ item.typeName }}</div>
                                            <!-- 推送字段类型下拉 -->
                                            <a-select 
                                                style="width: 90px;" 
                                                v-model:value="mapItem.value" 
                                                :getPopupContainer="(triggerNode) => triggerNode.parentNode" 
                                                show-search
                                                :filter-option="filterOption"
                                                @change="changeFieldType(mapItem)"
                                            >
                                                <a-select-option v-for="(item) in pushFieldTypeList" :value="item.value">
                                                    <span :title="item.value">{{ item.value }}</span>
                                                </a-select-option>
                                            </a-select>
                                            <!-- 开启自动建表显示长度 -->
                                            <template v-if="state.configKeys['createTable'] === '1'">
                                                <!-- 长度 -->
                                                <div class="sub-col-left" style="margin-left: 20px;">{{ item.length }}</div>
                                                <input type="text" v-model.trim="mapItem.fieldInfo">
                                            </template>
                                            <img v-if="state.configKeys[item.key].length > 1" @click="deleteConfigParams(item.key, mapItem)" class="delete-icon" src="@/assets/icons/delete.png" alt="delete" />
                                        </div>
                                        <div style="margin-top: 12px;">
                                            <myButton class="add-btn" @click="addConfigParams(item.key)">
                                                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                                                {{ t('api.addParams') }}
                                            </myButton>
                                        </div>
                                    </template>
                                    <template v-else-if="item.type === 'map'">
                                        <div :class="{'map-box': true,  [item.key]: true}" v-for="mapItem in state.configKeys[item.key]" :key="mapItem.uuid">
                                            <div class="sub-col-left">{{  item.keyName || t('pushManage.paramsKey') }}</div>
                                            <input v-model="mapItem.key" type="text">
                                            <div class="sub-col-left" style="margin-left: 20px;">{{ item.valueName || t('api.paramsValue') }}</div>
                                            <input v-model="mapItem.value" type="text">
                                            <img v-if="state.configKeys[item.key].length > 1" @click="deleteConfigParams(item.key, mapItem)" class="delete-icon" src="@/assets/icons/delete.png" alt="delete" />
                                        </div>
                                        <div style="margin-top: 12px;">
                                            <myButton class="add-btn" @click="addConfigParams(item.key)">
                                                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                                                {{ t('api.addParams') }}
                                            </myButton>
                                        </div>  
                                    </template>
                                    <template v-else-if="item.type === 'select'">
                                        <!-- 推送平台下拉 -->
                                        <a-select v-if="item.key==='platform'" style="width: 100%;" @change="platformChange" :value="state.configKeys['platform'].value">
                                            <a-select-option v-for="(val, key) in item.options" :key="key" :value="key">
                                                {{ val }}
                                            </a-select-option>
                                        </a-select>
                                        <!-- 普通下拉 -->
                                        <a-select v-else style="width: 100%;" :value="state.configKeys[item.key]" @change="changeFn($event, item)">
                                            <a-select-option v-for="(val, key) in item.options" :key="key" :value="key">
                                                {{ val }}
                                            </a-select-option>
                                        </a-select>
                                    </template>
                                </div>
                            </div>

                            <!-- 推送平台为数据源 显示选择API数据源 -->
                            <div class="row" v-if="item.key === 'platform' && showSelectDataSouce">
                                <div class="col-left">数据源名称</div>
                                <div class="col-right">
                                    <selectDataSource
                                        style="width: 396px;"
                                        v-model="apiSourceName"
                                        dataSourceType="API" 
                                        placeholder="请输入"
                                        @select="selectApiDataSource"
                                    />
                                </div>
                            </div>
                            
                            <!-- 推送平台嵌套结构 -->
                            <template v-if="item.key==='platform'">
                                <div 
                                    v-for="item in platfomParams" 
                                    class="row" 
                                    :key="item.key" 
                                    :style="{ 
                                        height: item.type === 'map' && 'auto', 
                                        alignItems: item.type === 'map' && 'flex-start' 
                                    }"
                                >
                                    <div class="col-left" :title="item.name">{{ item.name }}</div>
                                    <div class="col-right" :style="{ width: item.type === 'map' && 'calc(100% - 76px)' }">
                                        <template v-if="item.type === 'text'">
                                            <input v-if="item.key === 'password'" type="password" v-model="state.configKeys.platform.props[item.key]">
                                            <input v-else style="width: 100%;" type="text" v-model="state.configKeys.platform.props[item.key]">
                                        </template>
                                        <template v-else-if="item.type === 'radio'">
                                            <a-radio-group style="width: 100%;"  v-model:value="state.configKeys.platform.props[item.key]">
                                                <a-radio v-for="radioItem in item.radioOption" :key="radioItem.value" :value="radioItem.value">
                                                    {{ radioItem.label }}
                                                </a-radio>
                                            </a-radio-group>
                                        </template>
                                    </div>
                                </div>
                            </template>

                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- 自助配置 -->
        <div class="selfConfigWrap" v-show="activeKey === 1">
            <selfConfigView></selfConfigView>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watchEffect, computed, provide, watch } from 'vue';
import myButton from '@/components/buttons/myButton.vue';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import { storeToRefs } from 'pinia';
import { IsArray, IsObject } from '@/utils/utils';
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { apiManageStore } from '@/Stores/apiManageStore';
import { modalStore } from '@/Stores/modalStore';
import { setPushTopic, getTopicById } from '@/apis/push';
import { getDbInfo } from '@/apis/db'
import { getSourceInfo } from '@/apis/dataSourceManage'
import selfConfigView from '../components/selfconfig'
import selectTemplate from '@/views/systemManagement/components/selectTemplate'
import { message } from 'ant-design-vue';
import { getCollectionById } from '@/apis/push';
import { debounce, isEqual } from 'lodash'
import { getimgType } from '@/utils/utils'
import { isEmptyObject } from '@/utils/utils'
import { getPreviewData } from '@/apis/config'
import validatePhyCode from '@/hooks/pushManage/usePhyFieldValidate'
import back from '@/components/back'
import {
    platformMethodMap,
    dbConfigMap,
    dbTypeMap,
    MYSQL_FIELD_TYPE,
    ORACLE_FIELD_TYPE,
    SQLSERVER_FIELD_TYPE,
    modeOption,
    explainDocMap,
    tooltipInfo,
    incrPushTipInfo
} from '@/constants/pushManage'
import regularUpdateInput from '@/components/regularUpdateInput'
import selectDataSource from '@/views/dataCenter/centerLayout/components/selectDataSource'

const { t } = useI18n()
const useApiConfigStore = apiConfigStore()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useSystemManageStore = systemManageStore()
const { selfConfig } = storeToRefs(useApiConfigStore)
const { pushMehtodList, pushPlatform, activeMenuName } = storeToRefs(useApiManageStore)
const { pushCollectionInfo } = storeToRefs(useSystemManageStore)

const activeKey = ref(0)
const ipOptions = ref([])
const originData = ref([]) // 数据源
const autoDisabled = ref(false)
const enableIncreasePush = ref(false)   // 启用增量推送
const regularUpdateRef = ref(null)
const repeatIndex = ref(-1) // 推送重复字段索引
const stepInfo = [
    {label: t('pushManage.basicConfiguration')},
    {label: t('pushManage.selectData')},
    {label: t('pushManage.setPushMethod')},
]

const props = defineProps({
    operFlag: {
        type: String,
        default: 'add'
    },
    editData: {
        type: Object,
        default: {}
    }
})

const state = reactive({
    showTemplate: false, // 是否展示第三步的模板下拉
    themeName: '',
    pushPlatformType: '',
    partialParam: [{
        uuid: uuidv4(),
        key: '',
        value: ''
    }],
    queryTemplateId: '', // 第二步模板id
    dataMode: 0, // 推送模式
    pushMethod: '', // 推送方式
    pushConfig: [], // 推送方式的配置
    configKeys: {}, // 推送方式所有的key
    phyNameRepeatIndex: -1, // 物理字段名重复字段
})
const operDisabled = ref(false)

const apiSourceName = ref('')

provide('enableIncreasePushFn', (flag) => {
    enableIncreasePush.value = flag
    // 当不可为增量时，改变为全量
    if(!flag){
        state.dataMode = 0
    }
})

provide('themeState', state)

// 同步字段回调
provide('asyncPushFields', () => {
    echoPushFields()
    udateDbNameLabel()
    message.success('同步成功')
})

// 是否显示同步按钮
provide('showAsync', computed(() => {
    return state.pushMethod === 6
}))

const selectApiDataSource = (apiSourceId) => {
    // 新增数据源 sourceId存到pushConfig下 不使用props存
    state.configKeys.sourceId = apiSourceId
}

// 动态修改增量更新的禁用
useApiConfigStore.$onAction(
    ({name, store, args, after}) => {
        // 监听action触发
        if(name !== 'changeOperationList') return
        // action执行完后触发
        after(()=> {
            if(args[0].length > 0){
                operDisabled.value = args[0].some((item)=>{
                    if(item.action=== 'add' || item.action === 'join'){
                        return true
                    }
                })
            }
        })
    }
)

// 推送字段类型
const pushFieldTypeList = computed(() => {
    let dbType = state.configKeys['dbType']
    let list = []
    switch(dbType) {
        case '0':
            list = MYSQL_FIELD_TYPE
            break
        case '1':
            list = SQLSERVER_FIELD_TYPE
            break
        case '2':
            list = ORACLE_FIELD_TYPE
            break
        default:
            break
    }
    return list.map(it => ({value: it}))
})

// 是否选择过字段
const columnSelected = computed(() => 
    selfConfig.value.length && 
    selfConfig.value[selfConfig.value.length - 1].config[0].contents.columns.length
)

onMounted(async() => {
    useApiManageStore.getPushPlatform()
    await useApiManageStore.getPushMethods()
    handleEditStatus()
    handleAddStatus()
})

watchEffect(()=>{
    useApiConfigStore.setEditThemeStep(activeKey.value)
})

// 初始化db数据库信息
const initDbInfo = (dbType) => {
    getDbInfo({
        dbType,
        userDBType: 2
    }).then(res => {
        if (res.code === 1) {
            originData.value = res.data.records || []
        } else {
            originData.value = []
        }
        udateDbNameLabel()
    })
}

const resetDbState = () => {
    for(let key in dbConfigMap) {
        let configKey = dbConfigMap[key]
        state.configKeys[configKey] = ''
    }
    autoDisabled.value = false
    ipOptions.value = []
}

const onHostSearch = (val) => {
    const value = val.trim()
    if (value) {
        const tempData = originData.value.filter(i => i.dbAddr.indexOf(value) > -1)
        if (tempData.length) {
            ipOptions.value = tempData.map(item => ({
                label: `${item.dbAddr}:${item.dbPort}-${item.dbUserName}`,
                value: item.id
            }))
        } else {
            ipOptions.value = [] 
        }
    } else {
        ipOptions.value = []
    }
}

const onHostSelect = (val) => {
    let target = originData.value.find(item => item.id === val)
    if(!target) return

    for(let key in dbConfigMap) {
        let configKey = dbConfigMap[key]
        let value = target[key]
        if(key === 'dbPassword'){
            value = 'enc:' + value  
        }
        state.configKeys[configKey] = value
    }
    autoDisabled.value = true
}

// 处理编辑时的状态
const handleEditStatus = () => {
    if (props.operFlag === 'edit') {
        getTopicById({
            id: props.editData.id
        }).then(res => {
            if (res.code == 1) {
                let tempArray = []
                for (let key in res.data.localParams) {
                    tempArray.push({
                        uuid: uuidv4(),
                        key,
                        value: res.data.localParams[key]
                    })
                }
                state.partialParam = tempArray.length ? tempArray : state.partialParam
                state.themeName = res.data.name
                state.pushPlatformType = res.data.pushPlatform.value
                state.queryTemplateId = res.data.queryTemplateId
                state.dataMode = res.data.pushDataMode.value
                state.pushMethod = res.data.pushMethod.value
                state.configKeys = res.data.pushConfig

                for (let key in state.configKeys) {
                    if(key === 'dbType') {     // 数据库类型
                        initDbInfo(dbTypeMap[state.configKeys[key]] || 'ORACLE')
                    } else if(key === 'sourceId') { // 数据源ID
                        getApiSourceName(state.configKeys[key])
                    }

                    if (IsObject(state.configKeys[key]) && key !== 'platform') {
                        let params1 = []
                        for (let item in state.configKeys[key]) {
                            params1 = [...params1, { uuid: uuidv4(), key: item, value: state.configKeys[key][item] }]
                        }
                        state.configKeys[key] = params1
                    }
                }
                // 数据库推送 物理字段有序处理
                let columnsOrder = state.configKeys.columnsOrder
                if(state.pushPlatformType === 5 && columnsOrder) {
                    let tempArr = []
                    columnsOrder.forEach(column => {
                        let target = state.configKeys.columnsTypeMapper.find(it => it.key === column)
                        target && tempArr.push(target)
                    })
                    state.configKeys.columnsTypeMapper = tempArr
                }

                // 开启自动建表 解析推送字段
                if(state.configKeys.createTable === '1' && state.configKeys.columnsTypeMapper) {
                    state.configKeys.columnsTypeMapper.forEach(it => {
                        let matchRes = it.value.match(/\((.*?)\)/)
                        it.fieldInfo = matchRes ? matchRes[1] : ''
                        it.value = it.value.split('(')[0]
                    })
                }
                if (state.pushMethod || state.pushMethod === 0) {
                    selectPushMethod(pushMehtodList.value.find(i => i.value == state.pushMethod), 2)
                }
                autoDisabled.value = !!state.configKeys['addr']
            }
        })
    }
}

const handleAddStatus = () => {
    if(props.operFlag === 'edit') return

    // 新增推送主题 回显第一步第三步 推送平台
    getCollectionById({
        id: pushCollectionInfo.value.id
    }).then((res) => {
        if(res.code === 1) {
            state.pushPlatformType = res.data.pushPlatform.value
            if(state.pushPlatformType !== 0) {
                state.pushMethod = platformMethodMap[state.pushPlatformType]
                selectPushMethod(pushMehtodList.value.find(i => i.value == state.pushMethod))
                // 手动调用切换，使主机能够自动补全
                if(state.pushMethod === 6) {
                    changeFn( '2',{ key: 'dbType'})
                }
            }
        }
    })
}

const addTemplate = () => {
    useModalStore.changeTemplateModalVisible()
}
const addParams = () => {
    state.partialParam.push({
        uuid: uuidv4(),
        key: '',
        value: ''
    })
}
const addConfigParams = (key) => {
    state.configKeys[key].push({
        uuid: uuidv4(),
        key: '',
        value: '',
        // 手动添加标识 用于数据库推送字段回显判断
        manuaAddFlag: true 
    })
}
const deleteParams = record => {
    state.partialParam = state.partialParam.filter(i => i.uuid !== record.uuid)
}
const deleteConfigParams = (key, record) => {
    state.configKeys[key] = state.configKeys[key].filter(item => item.uuid !== record.uuid)
    if(key === 'columnsTypeMapper') {
        repeatIndex.value = -1
    }
}

const selectPushMethod = (record, type = 0) => {
    state.pushConfig = record.config ? JSON.parse(record.config) : []
    
    const types = state.pushConfig.map(i => i.type)
    if (types.includes("templateSelect")) {
        state.showTemplate = true
        if (type !== 2) {
            state.configKeys.pushTemplateId = ''
        }
    } else {
        state.showTemplate = false
    }
    state.pushConfig = state.pushConfig.filter(i => i.type !== "templateSelect")
    if (type === 2) {
        state.pushConfig.forEach(item => {
            if (item.type === 'radio') {
                let arr = []
                for(let Key in item.options) {
                    arr = [...arr, { label: item.options[Key], value: Key }] 
                }
                item.radioOption = arr
            } else if(item.key === 'platform' && !state.configKeys['platform']) {
                // 兼容旧数据 无platform 手动添加
                state.configKeys['platform'] = {
                    value: '',
                    props: {}
                }
            } 
        })
        return
    }
    state.configKeys = {}
    state.pushConfig.forEach(item => {
        if (item.type === 'map') {
            state.configKeys[item.key] = [{
                uuid: uuidv4(),
                key: '',
                value: ''
            }]
        } else if (item.type === 'radio') {
            let arr = []
            for(let Key in item.options) {
                arr = [...arr, { label: item.options[Key], value: Key }] 
            }
            item.radioOption = arr
            state.configKeys[item.key] = item.default || ''

            // 推送方式:超星表单系统
            if(item.key === 'autoSendData') {   // 是否触发数据推送默认:否
                state.configKeys[item.key] = '0'
            } else if(item.key === 'autoFilterErrorFields') {  // 是否过滤错误字段默认:是
                state.configKeys[item.key] = 'true'
            } else if(item.key === 'createTable') {  // 数据库推送自动建表
                state.configKeys[item.key] = '0'
            } else if(item.key === 'consistentFormPush') {  // 是否强一致
                state.configKeys[item.key] = '0'
            }
            if(item.key === 'dbType') {     // 数据库类型
                initDbInfo(dbTypeMap[item.default] || 'ORACLE')
            }
        } else if(item.key === 'platform') {
            // 推送平台
            state.configKeys['platform'] = {
                value: '',
                props: {}
            }
        } else if(item.key === 'fid') { // 自动填充fid
            state.configKeys[item.key] = localStorage.getItem('dfid')
        } else {
            state.configKeys[item.key] = item.default || ''
        }
    })
    autoDisabled.value = false
}

const goBack = () => {
    // 返回到推送详情页
    useApiManageStore.setApiPageId('pushTopicDetailPage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'pushTopicDetailPage')
    useApiConfigStore.setPhyCodeFlag('normal')
    useApiConfigStore.goBack()
}
/**
 * 1:上一步 2: 下一步 3: 确定
 * @param {number} type 
 */
const handleTopEvent = debounce((type) => {
    // if(validatePhyCode()) return

    if (type === 1) {
        activeKey.value--
    } else if (type === 2) {
        if (activeKey.value === 1) {    
            // 再次校验 避免出现物理字段名重复值
            if(validatePhyName()){
                if(validatePhyCode()) return
            }
            if (!columnSelected.value) {
                return message.warn(t('selfConfig.selectConfig'))
            }
        }
        activeKey.value++
    } else if (type === 3) {
        let params = {}
        state.partialParam.forEach(item => { params = { ...params, [item.key]: item.value } })
        let jsonData = {}, columnsOrder = []
        let columnsType = state.configKeys?.columnsTypeMapper

        if(state.pushPlatformType === 5 && columnsType) {
            columnsOrder = columnsType.map(it => it.key)
        }

        let configKeys = Object.assign({}, state.configKeys)

        // 推送字段处理
        if(configKeys['columnsTypeMapper']){
            validatePushField(true)
            if(repeatIndex.value > -1) return

            // 开启自动建表判断字段长度是否为空
            if(state.configKeys.createTable === '1' && 
                configKeys['columnsTypeMapper'].some(it => !it.fieldInfo)) {
                return message.error('推送字段长度不能为空')
            }

            configKeys['columnsTypeMapper'].forEach((it, index, _arr) => {
                // 过滤空字段
                if(!it.key || !it.value) {
                    _arr.splice(index, 1)
                }
                if(state.configKeys.createTable === '1') {
                    it.value = `${it.value}(${it.fieldInfo})`
                }
            })
        }

        for (let key in configKeys) {
            if (IsArray(configKeys[key])) {
                let params1 = {}
                configKeys[key].forEach(item => {
                    params1 = { ...params1, [item.key]: item.value }
                })
                configKeys[key] = params1
            }
        }
        // 新增columnsOrder 存储物理字段顺序
        if(columnsOrder.length) {
            configKeys.columnsOrder = columnsOrder
        }
        let uuid = regularUpdateRef.value.uuid
        let regularUpdateInfo = useMainStore.getRegularUpdateInfo(uuid)
        const publicData = {
            collectionId: pushCollectionInfo.value.id,
            name: state.themeName,
            pushDataMode: state.dataMode,
            pushMethod: state.pushMethod,
            pushPlatform: state.pushPlatformType,
            queryTemplateId: state.queryTemplateId,
            cronExpression: regularUpdateInfo.cronStr,
            localParams: params,
            pushConfig: configKeys
        }
        if (props.operFlag === 'add') {
            jsonData = {
                ...publicData,
                queryConfig: selfConfig.value[selfConfig.value.length - 1].config,
                status: 1
            }
        } else {
            jsonData = {
                ...publicData,
                id: props.editData.id,
                queryConfig: selfConfig.value[selfConfig.value?.length - 1]?.config,
                // 更改绑定状态
                status: props.editData.status === 2 ? 1 : props.editData.status
            }
        }
        setPushTopic(jsonData).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                useApiManageStore.setApiPageId('pushTopicDetailPage')
                useApiManageStore.initPushTopicList({
                    collectionId: pushCollectionInfo.value.id
                }, 'update')
                useApiConfigStore.goBack()
            } else {
                message.error(res.message)
            }
        })
    }
}, 300, {
    leading: true,
    trailing: false
})

// 点击下一步时再次判断物理字段名
const validatePhyName = ()=>{
    const settingItems =  selfConfig.value[selfConfig.value.length - 1].config.filter((item)=> item.action==='setting')
    if (settingItems.length === 0) {
        return false;
    }
  // 返回最后一个 'setting' 对象
  const lastSetting = settingItems[settingItems.length - 1];
  let allItems 
  if(lastSetting.excludeContents && lastSetting.excludeContents.length){
    allItems = lastSetting.contents.concat(lastSetting.excludeContents)
  } else {
    allItems = lastSetting.contents
  }
  if(allItems.length){
    let keyArr = []
    // 校验是否重复
    allItems.forEach((it, index) => {
        if(keyArr.includes(it['newColumnName'])) {
            state.phyNameRepeatIndex = index
            return
        } else {
            keyArr.push(it['newColumnName'])
        }
    })
    if(state.phyNameRepeatIndex > -1){
        useApiConfigStore.setPhyCodeFlag('repeat')
        return true
    }
  }
  return false
}

const stepClick = (i) => {
    if(validatePhyCode()) return 
    if (i === 2 && !columnSelected.value)  
        return message.warn(t('selfConfig.selectConfig'))

    activeKey.value = i
}

// 下拉列表更改
const changeFn = (val, item) => {
    state.configKeys[item.key] = val

    // 切换数据库类型
    if(item.key === 'dbType') {
        initDbInfo(dbTypeMap[val]|| 'ORACLE')
        resetDbState()
        setColumnsType()
    }
}

// 设置推送字段类型
const setColumnsType = () => {
    let dbType = dbTypeMap[state.configKeys.dbType]
    state.configKeys.columnsTypeMapper.forEach(it => {
        if(dbType === 'MYSQL') {
            it.value = 'varchar'
        }else if(dbType === 'SQLSERVER') {
            it.value = 'varchar'
        } else if(dbType === 'ORACLE') {
            it.value = 'varchar2'
        }
    })
}

// 更新数据库名称 label
const udateDbNameLabel = () => {
    // ORACLE类型数据库展示服务名
    let dbNameItem = state.pushConfig.find(it => it.key === 'dbName')
    let dbType = dbTypeMap[state.configKeys.dbType] || 'ORACLE'
    if(dbNameItem) {
        dbNameItem.name = dbType === 'ORACLE' ? '服务名' : '数据库名称'
    }
}

// 推送平台赋值
const platformChange = (val) => {
    state.configKeys['platform'] = {
        value: val,
        props: {}
    }

    let platFormConfig = state.pushConfig.find(it => it.key === 'platform')

    if(!platFormConfig) return

    let params = platFormConfig.props[val]?.params

    if(!params) return

    params?.forEach(it => {
        state.configKeys['platform'].props[it.key] = ''
    })
}

// 推送平台 嵌套结构
const platfomParams = computed(() => {
    if(!state.configKeys['platform']) return []

    let val = state.configKeys['platform'].value
    let platFormConfig = state.pushConfig.find(it => it.key === 'platform')

    if(!platFormConfig || !platFormConfig.props[val]) return []
   
    return platFormConfig.props[val].params
})

// 更改第三步推送平台 同步更改第一步推送平台
const changePushMethod = async () => {
    for(let key in platformMethodMap) {
        if(platformMethodMap[key] === state.pushMethod) {
            state.pushPlatformType = parseInt(key)
            break
        }
    }
    await nextTick()
    // 切换为数据库推送方式 回显推送字段
    if(state.pushMethod === 6) {
        echoPushFields()
        // 手动调用切换，使主机能够自动补全
        changeFn( '2',{ key: 'dbType'})
    }
}

const viewExplainDoc = () => {
    let docUrl = explainDocMap[state.pushMethod]
    docUrl && window.open(docUrl)
}

// 数据库推送平台 回显推送字段
const echoPushFields = async () => {
    let lastConfig = selfConfig.value[selfConfig.value.length - 1]?.config
    if(state.pushPlatformType !== 5 || !lastConfig) return
    // 过滤空条件
    lastConfig = lastConfig.filter(it => !it.default)
    let res = await getPreviewData(lastConfig)
    let tableColumns = {}

    if(res.code === 1) {
        tableColumns = res.data.targetTableColumns
    } else {
        return message.error(res.message)
    }
    let dbType = state.configKeys['dbType']
    if(state.configKeys?.columnsTypeMapper) {
        let tempArr = []
        for(let key in tableColumns) {
            let value = tableColumns[key]
            let fieldType = getimgType(value.columnType), fieldInfo = value.columnLength

            switch(fieldType){
                case 'textImg':
                    fieldType = 'varchar';
                    fieldInfo = '255';
                    break;
                case 'numImg':
                    fieldType = dbType === '2' ? 'number': 'bigint'
                    fieldInfo = '255'
                    break;
                case 'timeImg':
                    fieldType = 'date';
                    fieldInfo = '255'
                    break;
                default:
                    fieldType = 'varchar';
                    fieldInfo = '255';
                    break;
            }
            tempArr.push({
                uuid: uuidv4(),
                key: key,
                column: key,
                value: fieldType,
                fieldInfo: fieldInfo
            })
        }
        // 过滤手动添加字段
        state.configKeys.columnsTypeMapper = state.configKeys.columnsTypeMapper.filter(it => it.manuaAddFlag)
        // 自动回显字段拼接
        state.configKeys.columnsTypeMapper = tempArr.concat(state.configKeys.columnsTypeMapper)
    }
}

// 是否展示说明文档
const showExplainDoc = computed(() => {
    return [5, 6].includes(state.pushMethod)
})

// 切换到第三步 获取自助配置字段
const stopWatch = watch(activeKey, async (val) => {
    if(val !== 2) return
    echoPushFields()
    udateDbNameLabel()
    // 只监听首次
    stopWatch()
})

const filterOption = (input, option) => {
    return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 校验推送字段是否重复
const validatePushField = (showMessage = false) => {
    repeatIndex.value = -1
    let keyArr = [], configKeys = state.configKeys
    // 校验是否重复
    configKeys['columnsTypeMapper'].forEach((it, index) => {
        if(keyArr.includes(it.key)) {
            repeatIndex.value = index
            return
        } else {
            keyArr.push(it.key)
        }
    })

    if(repeatIndex.value > -1) {
        let key = configKeys['columnsTypeMapper'][repeatIndex.value].key
        showMessage && message.error(`推送字段${key}重复`)
    }
}

const changeFieldType = (mapItem) => {
    mapItem.fieldInfo = ''
}

// http推送平台 数据源推送不显示其他表单项
const showPushConfigItem = (item) => {
    return (
        state.pushMethod !== 0 || 
        item.key === 'platform' || 
        !showSelectDataSouce.value
    )
}

// 根据Api数据源id 回显数据源名称
const getApiSourceName = (id) => {
    getSourceInfo({ id }).then(async(res) => {
        if (res.code === 1) {
            apiSourceName.value = res.data?.sourceName
        } else {
            message.error(res.message)
        }
    })
}

// 推送模式
const pushModeValue = computed(() => {
    return state.dataMode === 0 ? 'FULL_PUSH' : 'INCR_PUSH'
})

// 推送平台为数据源
const showSelectDataSouce = computed(() => {
    return state.configKeys['platform']?.value === '2'
})

</script>

<style scoped lang="less">
.add-theme {
    height: calc(100% - 36px);
    background-color: #fff;
    display: flex;
    flex-direction: column;

    .delete-icon {
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin-left: 8px;
    }

    .theme-header {
        max-height: calc(100% - 36px);
        display: flex;
        .theme-title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            padding: 12px 10px;
        }
        .stepWrap{
            display: flex;
            align-items: center;
            padding: 12px 0;
        }
        .operateWrap{
            padding: 16px 0;
            overflow: hidden;
        }
        .progress-line {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            .pro-box {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 170px;
                height: 36px;
                margin-left: -15px;
                background-size: contain;
                background-repeat: no-repeat;
                cursor: pointer;
                &:first-of-type{
                    margin-left: 0;
                    background-image: url(@/assets/images/first_step_gray.png); 
                    &.active{
                        background-image: url(@/assets/images/first_step_blue.png);
                    }
                }
                &:nth-of-type(2){
                    background-image: url(@/assets/images/center-step-gray.png); 
                    &.active{
                        background-image: url(@/assets/images/center-step-blue.png);
                    }
                }
                &:last-of-type{
                    background-image: url(@/assets/images/second_step_gray.png); 
                    &.active{
                        background-image: url(@/assets/images/second_step_blue.png);
                    }
                }
            }
            .blue-text {
                font-size: 14px;
                color: #8A8B99;
            }

            .gray-text {
                color: #1E6FFA;
                font-size: 14px;
            }

            .blue-bgc {
                background: rgba(30, 111, 250, 0.7)
            }

            .gray-bgc {
                background: #ACB4BF;
            }

            .cricle {
                border-radius: 18px;
                width: 16px;
                height: 16px;
                line-height: 16px;
                color: #fff;
                font-weight: 600;
                font-size: 12px;
                margin-right: 8px;
                text-align: center;
            }
        }
        .btn-group {
            width: 170px;
            display: flex;
            height: 32px;
            align-items: center;
            gap: 20px;
            margin-left: 40px;
        }
    }
    .mainWrap{
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }

    .selfConfigWrap {
        background-color: #f2f4fa;
        padding-top: 10px;
        flex-grow: 1;
        overflow: hidden;
    }

    .first-step {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: scroll;
        .row {
            width: 500px;
            display: flex;
            align-items: center;
            height: 33px;
            .col-left {
                width: 60px;
                margin-right: 30px;
            }
            .col-right {
                .wid412 {
                    width: 412px;
                }
                .col3 {
                    height: 60px;
                    display: flex;
                    align-items: center;
                }
            }
            .sub-col-left {
                width: 70px;
            }
            .title {
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
                font-size: 13px;
                line-height: 18px;
            }
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
    }

    .second-step {
        height: 100%;
        .data-mode {
            .row {
                height: 32px;
                display: flex;
                align-items: center;
                margin-top: 6px;
                .col-left {
                    display: flex;
                    align-items: center;
                    width: 80px;
                    margin-right: 10px;
                    .tip-img {
                        width: 14px;
                        height: 14px;
                        margin-left: 5px;
                    }
                }
                .col-right {
                    width: 500px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            }
        }
    }

    .third-step {
        height: 100%;
        overflow-y: scroll;
        .row {
            width: 500px;
            height: 32px;
            display: flex;
            align-items: center;
            margin-top: 16px;
            .col-left {
                width: 92px;
                font-size: 13px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                margin-right: 12px;
                position: relative;
                padding-left: 8px;
                &.col-map{
                    margin-top: 5px;
                    flex-shrink: 0;
                }
                .notnull{
                    color: #F53F3F;
                    font-size: 14px;
                    font-weight: 400;
                    position: absolute;
                    left: 0;
                }
            }
            .col-right {
                flex-grow: 1;
                .autoInputWrap {
                    position: relative;
                    .dbAutoInput {
                        width: 100%;
                    }
                    .clear-img {
                        position: absolute;
                        width: 14px;
                        top: 9px;
                        right: 12px;
                        cursor: pointer;
                    }
                }
                input[type="password"] {
                    width: 100%;
                    padding-left: 12px;
                    padding-right: 12px;
                    font-size: 14px;
                    border: none;
                    background: #F3F3F3;
                    height: 32px;
                    color: rgba(0, 0, 0, 0.8);
                    border-radius: 4px;
                    &:focus{
                        background: #F3F3F3;
                        box-shadow: inset 0px 0px 0px 2px #3D82F2;
                        outline: none; 
                    }
                }
            }
            .sub-col-left {
                font-size: 13px;
                margin-right: 6px;
                &+input{
                    width: 137px;
                    // flex: 1;
                }
            }

            .map-box {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                white-space: nowrap;
                &.columnsTypeMapper>input{
                    &:first-of-type,
                    &:last-of-type{
                        width: 234px;
                    }
                }
                &.createTable>input{
                    &:first-of-type{
                        width: 114px;
                    }
                    &:last-of-type{
                        width: 60px;
                    }
                }
                &.header>input{
                    width: 162px;
                }
                &.extend>input{
                    width: 137px;
                }
                .repeatKey{
                    border: 1px solid #ff4d4f!important;
                    box-shadow: none;
                    background-color: #fff;
                }
            }

            // 解决kafka类型推送平台 默认出现滚动条问题
            &:last-of-type{
                margin-bottom: 2px;
            }

            &:first-of-type{
                margin-top: 0;
                height: auto;
                .col-left.mt{
                    margin-top: -26px;
                }
            }
        }
        .explainWrap{
            color: #2B67FF;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            margin-top: 4px;
            gap: 2px;
            cursor: pointer;
            img{
                width: 14px;
                height: 14px;
            }
        }
    }
}
</style>