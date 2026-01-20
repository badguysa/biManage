<template>
    <div class="formWrap">
        <div class="formContainer">
            <a-form ref="formRef" :model="formState" v-bind="layout" :hideRequiredMark="true">
                <a-form-item name="sourceName" :label="t('dataSource.sourceName')" :rules="sourceNameRule()">
                    <a-input v-model:value="formState.sourceName" @input="handleInput('sourceName', $event)" :placeholder="t('dataSource.sourceNameTips')" />
                </a-form-item>
                <a-form-item name="dbType" :label="t('db.type')" :rules="[{ required: true, message: t('db.typeTip') }]">
                    <a-select @select="onSelect" :notFoundContent="t('common.noData')" v-model:value="formState.dbType">
                        <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item name="dbHost" :label="t('db.host')" :rules="[{ required: true, message: t('db.hostTip') }]">
                    <a-auto-complete v-model:value="formState.dbHost" @input="handleInput('dbHost', $event)" :options="ipOptions" :disabled="autoDisabled"
                        :placeholder="t('db.hostTip')" @search="onHostSearch" @select="onHostSelect" />
                    <img v-if="autoDisabled" @click="clearFormState" class="clear-img" src="@/assets/icons/clear.png" alt="">
                </a-form-item>
                <a-form-item name="port" :label="t('db.port')" :rules="[{ required: true, message: t('db.portTip') }]">
                    <a-input v-model:value="formState.port" @input="handleInput('port', $event)" :placeholder="t('db.portTip')" />
                </a-form-item>
                <a-form-item name="username" :label="t('common.username')"
                    :rules="[{ required: true, message: t('db.userTip') }]">
                    <a-input v-model:value="formState.username" @input="handleInput('username', $event)" :placeholder="t('db.userTip')" />
                </a-form-item>
                <a-form-item name="password" :label="t('common.password')"
                    :rules="[{ required: true, message: t('db.passwordTip') }]">
                    <a-input v-model:value="formState.password" type="password" @input="handleInput('password', $event)" :placeholder="t('db.passwordTip')" />
                </a-form-item>
                <a-form-item name="dbName" :label="dbLableInfo.label"
                    :rules="[{ required: true, message: dbLableInfo.placeholder }]">
                    <span class="dbConnInfo_text"><span class="btn" @click="conntectDbname"> 点击连接数据库</span> 以读取数据库名称列表</span>
                    <a-input v-if="!isShowdbNameSelect" v-model:value="formState.dbName" @input="handleInput('dbName', $event)"
                        :placeholder="dbLableInfo.placeholder" />
                    <a-select v-else  v-model:value="formState.dbName">
                        <a-select-option v-for="item in dbNameList" :key="item" :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item v-if="showConnInfo" name="dbConnInfo" :label="`${t('db.dbConnInfo')}(${t('db.mode')})`">
                    <span class="dbConnInfo_text"><span class="btn" @click="conntectDb"> 点击连接数据库</span> 以读取模式列表</span>
                    <a-input v-if="!isShowSchemaNameSelect" v-model:value="formState.dbConnInfo.schemaName"
                        :placeholder="t('db.dbConnInfoTip')" />
                    <a-select v-else v-model:value="formState.dbConnInfo.schemaName">
                        <a-select-option v-for="item in schemaNameList" :key="item" :value="item">
                            {{ item }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
    
            <!-- 高级设置 -->
            <dbAdvanceSetting ref="advanceSettingRef" :connInfo="formState.dbConnInfo"/>
        </div>
        
        <div class="btnWrap">
            <Button @click="$emit('cancel')">取消</Button>
            <Button @click="testConn">测试连接</Button>
            <Button type="primary" @click="onOK">确定</Button>
        </div>
    </div>
</template>

<script setup>
import * as _ from 'loadsh'
import { message } from 'ant-design-vue';
import Button from '@/components/buttons/myButton'
import { getDbInfo, getDbSchema, getDb } from '@/apis/db'
import { addDBSource, sourceNameIsDuplicate, testDBConn, editDBSource } from '@/apis/dataSourceManage'
import dbAdvanceSetting from '@/components/dbAdvanceSetting'

const { t } = useI18n()

const emits = defineEmits(['cancel'])

const sourceInfo = inject('dataSourceInfo')
const modalMode = inject('modalMode')

const nameRequired = ref(true)

const advanceSettingRef = ref(null)

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

onMounted(() => {
    echoSourceInfo()
    initDbInfo('MYSQL')
})

// 是否为编辑状态
const isEdit = computed(() => {
    return modalMode.value === 'editDB'
})

// 输入去除前后空格
const handleInput = (field, event) => {
  formState[field] = event.target.value.trim();
};

const echoSourceInfo = () => {
    // 编辑状态 回显数据
    if (!isEdit.value) return

    let editInfo = sourceInfo.value

    formState.sourceName = editInfo.sourceName || `${editInfo.dbAddr}:${editInfo.dbPort}`
    formState.dbType = databaseMap[editInfo.dbType.value]
    formState.dbName = editInfo.dbName
    formState.dbHost = editInfo.dbAddr
    formState.username = editInfo.dbUserName
    formState.password = editInfo.dbPassword
    formState.port = editInfo.dbPort
    // formState.dbConnInfo.schemaName = editInfo.dbConnInfo
    formState.dbConnInfo = (editInfo.dbConnInfo && JSON.parse(editInfo.dbConnInfo)) || {
        schemaName: ''
    }

    // 显示表空间模式
    if (showSchemaNameType.includes(formState.dbType)) {
        showConnInfo.value = true
    } else {
        showConnInfo.value = false
    }
    isShowSchemaNameSelect.value = false
    schemaNameList.value = []
}

const clearFormState = () => {
    autoDisabled.value = false
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
const conntectDb = () => {
    const hide = message.loading('正在测试连接，请稍候...', 0)
    getDbSchema({
        "dbAddr": formState.dbHost,
        "dbConnInfo": (formState.dbConnInfo && JSON.stringify(formState.dbConnInfo)) || '',
        "dbName": formState.dbName,
        "dbPassword": isEdit.value ? 'enc:' + formState.password : formState.password,
        "dbPort": formState.port,
        "dbType": formState.dbType,
        "dbUserName": formState.username,
    },
    (e) => {
        hide()
    }).then(res => {
        if (res.code == 1) {
            if (res.data?.length && res.data.includes(formState.dbConnInfo.schemaName)) {
                schemaNameList.value = res.data
            } else {
                schemaNameList.value = res.data || []
                if (formState.dbConnInfo.schemaName) {
                    schemaNameList.value.push(formState.dbConnInfo.schemaName)
                }
            }
            isShowSchemaNameSelect.value = true
            message.success('测试连接成功')
        } else {
            message.error('测试连接失败')
            if(res.extendData?.exception){
                console.log(res.extendData.exception);
            }
        }
    }).finally(() => {
        hide()
    })
}

// 展示服务名数据库类型
const isShowdbNameSelect = ref(false)
const dbNameList = ref([])

const conntectDbname = () => {
    const hide = message.loading('正在测试连接，请稍候...', 0)
    getDb({
        "dbAddr": formState.dbHost,
        "dbConnInfo": (formState.dbConnInfo && JSON.stringify(formState.dbConnInfo)) || '',
        "dbName": formState.dbName,
        "dbPassword": formState.password,
        "dbPort": formState.port,
        "dbType": formState.dbType,
        "dbUserName": formState.username,
    }, (e) => {
        hide()
    }).then(res => {
        if (res.code == 1) {
            if (res.data?.length && res.data.includes(formState.dbConnInfo.schemaName)) {
                dbNameList.value = res.data
            } else {
                dbNameList.value = res.data || []
                if (formState.dbConnInfo.schemaName) {
                    dbNameList.value.push(formState.dbConnInfo.schemaName)
                }
            }
            isShowdbNameSelect.value = true
            message.success('测试连接成功')
        } else {
            message.error('测试连接失败')
            if(res.extendData?.exception){
                console.log(res.extendData.exception);
            }
        }
    }).finally(() => {
            hide()
        })
}

const initDbInfo = (dbType) => {
    getDbInfo({
        dbType,
        userDBType: 2
    }).then(res => {
        if (res.code === 1) {
            let infoList = res.data.records?.map(it => {
                it.dbPassword = 'enc:' + it.dbPassword
                return it
            })
            originData.value = infoList || []
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
    const { dbAddr, dbName, dbUserName, dbPort, dbConnInfo, dbPassword } = selectItem.value
    autoDisabled.value = true
    formState.dbHost = dbAddr
    formState.dbName = dbName
    formState.username = dbUserName
    formState.password = dbPassword
    formState.port = dbPort
    formState.dbConnInfo = (dbConnInfo && JSON.parse(dbConnInfo)) || {
        schemaName: ''
    }
    formRef.value.clearValidate()
}

const onSelect = (val) => {
    initDbInfo(val)
    if (showSchemaNameType.includes(val)) {
        showConnInfo.value = true
    } else {
        showConnInfo.value = false
    }
    clearFormState()
}

const onOK = async () => {
    // 确定 sourceName必填
    nameRequired.value = true
    // await nextTick()
    formRef.value.validateFields().then(async (res) => {
        if (res) {
            const jsonData = {
                dbAddr: res.dbHost.trim(),
                dbName: res.dbName.trim(),
                // dbPassword: selectItem.value ? (res.password.trim() === '********' ? '********' : res.password.trim()) : res.password.trim(),
                dbPassword: res.password.trim(),
                dbPort: res.port.trim(),
                dbType: res.dbType,
                dbUserName: res.username.trim(),
                // dbConnInfo: (res.dbConnInfo && JSON.stringify(res.dbConnInfo)) || '',
                tableName: '',
                pageSize: 30,
                pageNum: 1,
                userDBType: 2,
                sourceName: formState.sourceName.trim()
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

            let requestRes = null

            if (isEdit.value) {  // 编辑数据源
                jsonData.id = sourceInfo.value.id
                jsonData.dbPassword = 'enc:' + jsonData.dbPassword
                requestRes = await editDBSource({
                    sourceName: formState.sourceName.trim(),
                    dataSource: jsonData,
                    id: sourceInfo.value.dbId
                })
            } else {    // 新增数据源
                requestRes = await addDBSource({
                    sourceName: formState.sourceName.trim(),
                    dataSource: jsonData
                })
            }

            if (requestRes.code === 1) {
                message.success(requestRes.message)
            } else {
                message.error(requestRes.message)
            }
            emits('cancel', true)
        }
    }).catch(err => {
        console.log(err)
    })
}

const testConn = async () => {
    // 测试连接 sourceName非必填
    nameRequired.value = false
    await nextTick()

    formRef.value.validateFields().then((res) => {
        if (res) {
            const jsonData = {
                dbAddr: res.dbHost.trim(),
                dbName: res.dbName.trim(),
                dbPort: res.port.trim(),
                dbType: res.dbType,
                dbUserName: res.username.trim(),
                dbConnInfo: (res.dbConnInfo && JSON.stringify(res.dbConnInfo)) || '',
                userDBType: 2
            }

            // jsonData.dbPassword = res.password.trim() === '********' ? selectItem.value.dbPassword : res.password.trim()
            jsonData.dbPassword = res.password.trim()

            const hide = message.loading('正在测试连接，请稍候...', 0)

            testDBConn(jsonData).then((res) => {
                if (res.code == 1) {
                    hide()
                    message.success('测试连接成功')
                } else {
                    hide()
                    message.error('测试连接失败')
                    if(res.extendData?.exception){
                        console.log( res.extendData.exception);
                    }
                }
            })
        }
    }).catch(err => {
        console.log(err)
    })
}

// 数据源名称校验规则
const sourceNameRule = () => {
    // 编辑状态只做必填校验
    if (isEdit.value) {
        return [{ required: true, message: t('dataSource.sourceNameTips') }]
    }
    return [{ validator: sourceNameValidator }]
}

const sourceNameValidator = async (rule, val) => {
    if (nameRequired.value && !val) {
        return Promise.reject(t('dataSource.sourceNameTips'))
    }

    // 校验数据源名称是否重复
    let res = await sourceNameIsDuplicate({
        sourceName: formState.sourceName,
        sourceTypeName: formState.dbType
    })

    if (res.code !== 1) {
        return Promise.reject('数据源名称重复')
    }

    return Promise.resolve()
}

// 数据库label名称
const dbLableInfo = computed(() => {
    if (formState.dbType === 'ORACLE') {
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
.formWrap {
    .formContainer{
        padding-right: 24px;
        max-height: 520px;
        overflow-y: auto;
    }
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
        border-radius: 4px;
    }

    :deep(.ant-form-horizontal .ant-form-item-control) {
        margin-left: 10px;
    }

    :deep(.ant-form-item-label) {
        text-align: left;
        flex-basis: 80px;
    }

    :deep(.ant-form-item-label > label) {
        white-space: pre-line;
        line-height: 1.1;

        &::after {
            display: none;
        }
    }

    /deep/.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper,
    .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper,
    .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:hover,
    .ant-form-item-has-error :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper:hover {
        border: 1px solid #ff4d4f !important;
    }

    .clear-img {
        position: absolute;
        width: 14px;
        top: 9px;
        right: 10px;
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

:deep(.advanceSetting>.settingBox>.settingItem){
    input[type="text"]{
        width: 132px;
    }
    .deleteBtn{
        right: -20px;
    }
}

.btnWrap {
    padding-right: 24px;
    text-align: right;

    button {
        margin-left: 24px;

        &:first-of-type {
            margin-left: 0;
        }
    }
}
</style>
