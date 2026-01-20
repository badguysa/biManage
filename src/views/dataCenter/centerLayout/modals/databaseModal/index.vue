<template>
    <div className='dbModal' v-if="DBModalVisible" v-show="showModal">
        <div class="maskLayer"></div>
        <div class="popDiv wid480">
            <div class="popHead">
                <span class="popClose fr" @click="cancel"><img class="img1" :src="closeImg" /></span>
                <p class="fl colorDeep">{{ t('common.dbLibrary') }}</p>
            </div>

            <div className='modalBody'>
                <a-form ref="formRef" :model="formState" v-bind="layout" :hideRequiredMark="true">
                    <a-form-item name="sourceName" :label="t('dataSource.sourceName')"
                        :rules="[{ required: true, message: t('common.pleaseEnter') }]">
                        <selectDataSource ref="dataSourceRef" style="width: 300px;" v-model="formState.sourceName"
                            dataSourceType="DB" placeholder="请输入数据源名称" @select="selectFn" />
                    </a-form-item>

                    <a-form-item name="dbType" :label="t('db.type')"
                        :rules="[{ required: true, message: t('db.typeTip') }]">
                        <a-select @select="onSelect" :notFoundContent="t('common.noData')" style="width: 300px"
                            v-model:value="formState.dbType">
                            <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
                                {{ item.label }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="dbHost" :label="t('db.host')" :rules="[{ required: true, message: t('db.hostTip') }]">
                        <a-input style="width: 300px" v-model:value="formState.dbHost" @input="handleInput('dbHost', $event)" :placeholder="t('db.hostTip')" />
                    </a-form-item>
                    <a-form-item name="port" :label="t('db.port')" :rules="[{ required: true, message: t('db.portTip') }]">
                        <a-input style="width: 300px" v-model:value="formState.port" @input="handleInput('port', $event)" :placeholder="t('db.portTip')" />
                    </a-form-item>
                    <a-form-item name="username" :label="t('common.username')"
                        :rules="[{ required: true, message: t('db.userTip') }]">
                        <a-input style="width: 300px" v-model:value="formState.username" @input="handleInput('username', $event)" :placeholder="t('db.userTip')" />
                    </a-form-item>
                    <a-form-item name="password" :label="t('common.password')"
                        :rules="[{ required: true, message: t('db.passwordTip') }]">
                        <a-input style="width: 300px; -webkit-text-security: disc; " v-model:value="formState.password"  @input="handleInput('password', $event)"
                            :placeholder="t('db.passwordTip')" />
                    </a-form-item>
                    <a-form-item name="dbName" :label="dbLableInfo.label"
                        :rules="[{ required: true, message: dbLableInfo.placeholder }]">
                        <span class="dbConnInfo_text"><span class="btn" @click="conntectDbname"> 点击连接数据库</span> 以读取数据库名称列表</span>
                        <a-input v-if="!isShowdbNameSelect" style="width: 300px" v-model:value="formState.dbName" @input="handleInput('dbName', $event)" :placeholder="dbLableInfo.placeholder" />
                        <a-select v-else style="width: 300px" v-model:value="formState.dbName">
                            <a-select-option v-for="item in dbNameList" :key="item" :value="item">
                                {{ item }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item v-if="showConnInfo" name="dbConnInfo" :label="`${t('db.dbConnInfo')}(${t('db.mode')})`">
                        <span class="dbConnInfo_text"><span class="btn" @click="conntectDb"> 点击连接数据库</span> 以读取模式列表</span>
                        <a-input v-if="!isShowSchemaNameSelect" style="width: 300px" v-model:value.trim="formState.dbConnInfo.schemaName"
                            :placeholder="t('db.dbConnInfoTip')" />
                        <a-select v-else style="width: 300px" v-model:value="formState.dbConnInfo.schemaName">
                            <a-select-option v-for="item in schemaNameList" :key="item" :value="item">
                                {{ item }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-form>

                <!-- 高级设置 -->
                <dbAdvanceSetting ref="advanceSettingRef" :connInfo="formState.dbConnInfo"/>
            </div>

            <div class="popBottom shadowBox">
                <myButton class="fr mr25" @click="onOK" type="primary">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
import { getSourceInfo, checkDBSource } from '@/apis/dataSourceManage'
import { getDbList, getDbInfo, getDbSchema ,getDb} from '@/apis/db'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import selectDataSource from '@/views/dataCenter/centerLayout/components/selectDataSource'
import {sourceNameIsDuplicate} from '@/apis/dataSourceManage'
import dbAdvanceSetting from '@/components/dbAdvanceSetting'

const { t } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { DBModalVisible } = storeToRefs(useModalStore)
const typeOptions = [{
    value: 'POSTGRESQL',
    label: 'PostgreSQL'
}, {
    value: 'MYSQL',
    label: 'MySQL'
}, {
    value: 'STARROCKS',
    label: 'StarRocks'
}, {
    value: 'SQLSERVER',
    label: 'SQL Server'
}, {
    value: 'ORACLE',
    label: 'Oracle'
}]
const layout = {
    labelCol: { span: 6 },
}
const formRef = ref()
const showConnInfo = ref(false)
const ipOptions = ref([])
const originData = ref([]) // 数据源
const selectItem = ref() // 被选中的数据源
const autoDisabled = ref(false)

const dataSourceRef = ref(null)

const advanceSettingRef = ref(null)
// 数据源状态：1已禁用，0正常
const sourceStatus = ref(1)
const formState = reactive({
    sourceName: '',
    dbType: 'MYSQL',
    dbName: '',
    dbHost: '',
    username: '',
    password: '',
    port: '',
    codeType: '',
    dbConnInfo: {
        schemaName: ''
    }
})
// 是否自动回显数据源信息
let isEcho = ref(false)

// 是否为新建数据源
let isNew = ref(false)

// 选择的数据源id
let selectSourceId = ref('')
// 数据源信息
let defaultInfoStr = ''

const databaseMap = {
    0: 'MYSQL',
    1: 'SQLSERVER',
    2: 'ORACLE',
    3: 'POSTGRESQL',
    4: 'STARROCKS'
}

// 展示表空间模式数据库类型
const showSchemaNameType = ['ORACLE', 'POSTGRESQL', 'SQLSERVER']
const isShowSchemaNameSelect = ref(false)

const schemaNameList = ref([])
const showModal = ref(true)
const conntectDb = () => {
    const hide = message.loading('正在测试连接，请稍候...', 0)
    getDbSchema({
        "dbAddr": formState.dbHost,
        "dbConnInfo": (formState.dbConnInfo && JSON.stringify(formState.dbConnInfo)) || '',
        "dbName":  formState.dbName,
        "dbPassword":  formState.password,
        "dbPort": formState.port,
        "dbType":  formState.dbType,
        "dbUserName": formState.username,
    }).then(res => {
        if (res.code == 1) {
            if(res.data?.length && res.data.includes(formState.dbConnInfo.schemaName)){
                schemaNameList.value = res.data
            }else{
                schemaNameList.value = res.data || []
                if(formState.dbConnInfo.schemaName){
                    schemaNameList.value.push(formState.dbConnInfo.schemaName)
                }
            }
            isShowSchemaNameSelect.value = true
           
            message.success('测试连接成功')
        }else {
            message.error('测试连接失败')
            if(res.extendData?.exception){
                console.log(res.extendData.exception);
            }
        }
    }, (e) => {
        hide()
    }).finally(()=>{
        hide()
    })
    
}

// 展示服务名数据库类型
const isShowdbNameSelect = ref(false)
const dbNameList = ref([])

// 输入去除前后空格
const handleInput = (field, event) => {
  formState[field] = event.target.value.trim();
};

const conntectDbname = () => {
    const hide = message.loading('正在测试连接，请稍候...', 0)
    getDb({
        "dbAddr": formState.dbHost,
        "dbConnInfo": (formState.dbConnInfo && JSON.stringify(formState.dbConnInfo)) || '',
        "dbName":  formState.dbName,
        "dbPassword":  formState.password,
        "dbPort": formState.port,
        "dbType":  formState.dbType,
        "dbUserName": formState.username,
    }).then(res => {
        if (res.code == 1) {
            if(res.data?.length && res.data.includes(formState.dbConnInfo.schemaName)){
                dbNameList.value = res.data
            }else{
                dbNameList.value = res.data || []
                if(formState.dbConnInfo.schemaName){
                    dbNameList.value.push(formState.dbConnInfo.schemaName)
                }
            }
            isShowdbNameSelect.value = true
            message.success('测试连接成功')
        }else {
            message.error('测试连接失败')
            if(res.extendData?.exception){
                console.log(res.extendData.exception);
            }
        }
    }, (e) => {
        hide()
    })
    .finally(()=>{
        hide()
    })
}
// 选择数据源
const selectFn = (id) => {
    isEcho.value = true
    getSourceInfo({ id }).then((res) => {
        if (res.code === 1) {
            echoSourceInfo(res.data)
        } else {
            message.error(res.message)
        }
    })
}

const echoSourceInfo = (editInfo) => {
    sourceStatus.value = editInfo.sourceStatus
    selectSourceId.value = editInfo.id
    // formState.sourceName = editInfo.sourceName 
    formState.dbType = databaseMap[editInfo.dbType.value]
    formState.dbName = editInfo.dbName
    formState.dbHost = editInfo.dbAddr
    formState.username = editInfo.dbUserName
    formState.password = 'enc:' + editInfo.dbPassword
    formState.port = editInfo.dbPort
    // formState.dbConnInfo.schemaName = editInfo.dbConnInfo
    formState.dbConnInfo = (editInfo.dbConnInfo && JSON.parse(editInfo.dbConnInfo)) || {
        schemaName: ''
    }

    // defaultInfoStr = getFormInfoStr()

    // 显示表空间 和 服务名 模式
    if (showSchemaNameType.includes(formState.dbType)) {
        showConnInfo.value = true
    } else {
        showConnInfo.value = false
    }
    isShowSchemaNameSelect.value = false
    isShowdbNameSelect.value = false

    schemaNameList.value = []
}

// 序列化api数据源信息
const getFormInfoStr = () => {
    return JSON.stringify(formState)
}

// 判断数据源信息是否被修改
const formInfoUpdated = () => {
    if (!isEcho.value) return false
    let newInfoStr = getFormInfoStr()
    return newInfoStr !== defaultInfoStr
}

onMounted(() => {
    // initDbInfo('MYSQL')
})
const clearFormState = () => {
    autoDisabled.value = false
    // formState.sourceName = ''
    formState.dbHost = ''
    formState.dbName = ''
    formState.username = ''
    formState.password = ''
    formState.port = ''
    formState.dbConnInfo = {
        schemaName: ''
    }
    ipOptions.value = []
    selectItem.value = ''
}
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
    })
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
    selectItem.value = originData.value.find(item => item.id === val)
    const { dbAddr, dbName, dbUserName, dbPort, dbConnInfo } = selectItem.value
    autoDisabled.value = true
    formState.dbHost = dbAddr
    formState.dbName = dbName
    formState.username = dbUserName
    formState.password = '********'
    formState.port = dbPort
    formState.dbConnInfo = (dbConnInfo && JSON.parse(dbConnInfo)) || {
        schemaName: ''
    }
    formRef.value.clearValidate()
}
const onSelect = (val) => {
    // initDbInfo(val)
    if (showSchemaNameType.includes(val)) {
        showConnInfo.value = true
    } else {
        showConnInfo.value = false
    }
    clearFormState()
}
const cancel = () => {
    useModalStore.changeDBModalVisible()
}
const onOK = () => {
    formRef.value.validateFields().then((res) => {
        if (res) {
            const jsonData = {
                dbAddr: res.dbHost.trim(),
                dbName: res.dbName.trim(),
                dbPassword: selectItem.value ? (res.password.trim() === '********' ? '********' : res.password.trim()) : res.password.trim(),
                dbPort: res.port.trim(),
                dbType: res.dbType,
                dbUserName: res.username.trim(),
                // dbConnInfo: (res.dbConnInfo && JSON.stringify(res.dbConnInfo)) || '',
                tableName: '',
                pageSize: 30,
                pageNum: 1,
                id: selectItem.value?.id ? selectItem.value?.id : selectSourceId.value,
                userDBType: 2,
                sourceName: res.sourceName.trim(),
            }

            // 高级设置参数放在dbConnInfo中
            let paramList =  advanceSettingRef.value.getParamList()

            let connInfo = {}

            paramList.forEach(it => {
                if(it.key && it.value) {
                    connInfo[it.key] = it.value
                }
            })

            let schemaName = res.dbConnInfo?.schemaName
            if(schemaName) {
                connInfo.schemaName = schemaName
            }

            jsonData.dbConnInfo = JSON.stringify(connInfo)

            submitValidate().then(() => {
                showDBList(jsonData)
            }).catch(msg => {
                message.error(msg)
            })
        }
    })
}

// 校验数据源名称与配置信息是否重复
const submitValidate = async () => {
    // 校验数据源名称是否重复
    let validateNameRes = await sourceNameIsDuplicate({
        sourceName: formState.sourceName,
        sourceTypeName: formState.dbType
    })

    let dbType = 0

    for(let key in databaseMap) {
        if(databaseMap[key] === formState.dbType) {
            dbType = parseInt(key)
            break
        }
    }

    // 校验是否含有 相同的 主机|端口|用户名|数据库名称 数据源
    let validateConfigRes =  await checkDBSource({
        dataSource: {
            dbType: dbType,
            dbAddr: formState.dbHost,
            dbPort: formState.port,
            dbUserName: formState.username,
            dbName: formState.dbName,
        }
    })

    // 数据源名称相同 配置信息不同
    if(validateNameRes.code !== 1 && validateConfigRes.code === 1) {
        return Promise.reject('数据源名称重复')
    } 

    // 数据源名称不同 配置信息相同
    if(validateNameRes.code === 1 && validateConfigRes.code !== 1) {
        return Promise.reject(validateConfigRes.message)
    }

    return Promise.resolve('validatePass')
} 

const showDBList = (jsonData) => {
    if (isNew.value) {
        jsonData.id = undefined
    }
    jsonData.isUpdateDatasource = 0
    jsonData.sourceStatus = sourceStatus.value
    isNew.value = false
    const hide = message.loading(t('db.dbConnecting'), 0)
    getDbList(jsonData).then(res => {
        if (res.code == 1) {
            useMainStore.setPageId('pageDB')
            useMainStore.setDbTableList(res.data.data)
            if (DBModalVisible.value) {
                useModalStore.changeDBModalVisible()
            }
            jsonData.isOpenLog = res.data.isOpenLog
            jsonData.id = jsonData.id || res.data?.dbId
            useMainStore.setDbFormData(jsonData)
            useMainStore.setDbTableCount(res.data.count)
            hide()
        } else {
            hide()
            message.error(res.message)
        }
    }).catch(e=> {
        hide()
    })
}

// 校验db数据源是否重复件
const validateFn = () => {
    // 校验字段是否都有值
    if(['dbHost', 'port', 'username', 'dbName']
        .some( key => formState[key] === '')
    ) return

    let dbType = 0

    for(let key in databaseMap) {
        if(databaseMap[key] === formState.dbType) {
            dbType = parseInt(key)
            break
        }
    }

    checkDBSource({
        dataSource: {
            dbType: dbType,
            dbAddr: formState.dbHost,
            dbPort: formState.port,
            dbUserName: formState.username,
            dbName: formState.dbName,
        }
    }).then((res) => {
        if(res.code === 0) {
            message.error(res.message)
        }
    })
}

// 数据库label名称
const dbLableInfo = computed(() => {
    if(formState.dbType === 'ORACLE') {
        return {
            label: t('db.serverName'),
            placeholder: t('db.serverNameTip')
        }
    } else {
        return {
            label: t('db.dbName'),
            placeholder: t('db.dbNameTip')
        }
    }
})

</script>

<style lang="less" scoped>
.dbModal {
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
        border-radius: 4px;
    }

    :deep(.ant-form-horizontal .ant-form-item-control) {
        margin-left: 10px;
    }

    :deep(.ant-form-item-label) {
        text-align: left;
    }

    :deep(.ant-form-item-label > label) {
        white-space: pre-line;
        line-height: 1.1;
    }

    /deep/.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper,
    .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper,
    .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:hover,
    .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper:hover {
        border: 1px solid #ff4d4f !important;
    }

    .img1 {
        width: 16px;
    }

    .modalBody {
        max-height: 500px;
        padding: 24px;
        overflow-y: auto;

        .clear-img {
            position: absolute;
            width: 14px;
            top: 9px;
            right: 25px;
            cursor: pointer;
        }

        .dbConnInfo_text {
            color: rgba(0, 0, 0, 0.60);
            font-size: 12px;
            font-weight: 400;

            .btn {
                color: #2B67FF;
                cursor: pointer;
            }
        }
    }
}
</style>
