<template>
    <div className="edit-auth-modal">
        <div class="maskLayer"></div>
        <div class="popDiv wid480">
            <div class="popHead">
                <a class="popClose fr"
                    ><img style="width: 16px" src="@/assets/icons/close.png" @click="cancel"
                /></a>
                <p class="fl colorDeep">{{ props.operFlag === 'add' ? t('selfConfig.add') : t('common.edit') }}</p>
            </div>

            <div className="modalBody">
                <a-form ref="formRef" :model="formState" autocomplete="off" :label-col="labelCol">
                    <template v-for="(state, key) in formState">
                        <a-form-item
                            v-if="formStateShow[key]"
                            :name="key"
                            :rules="formRule(key)"
                        >
                            <template #label>
                                <span class="form-label">{{ t(FIELDENUM[key]) }}</span>
                                <tips v-if="key==='authIp'" tipsContent="可使用英文逗号作为分隔 填写多个IP"/>
                            </template>
                            <!-- 选择单位 -->
                            <selectUnitSource
                                v-if="key==='useUnit'"
                                style="width: 336px;"
                                v-model="formState.useUnit"
                                @select="selectFn"
                                @clearFn="clearHandle"
                            />
                            <!-- 授权IP -->
                            <a-textarea
                                v-else-if="key==='authIp'"
                                :value="state"
                                @change="changeHandle($event, 'authIp')"
                            />
                            <a-input
                                v-else
                                :value="state"
                                :placeholder="t('common.pleaseEnter') + t(FIELDENUM[key])"
                                @change="changeHandle($event, key)"
                            />
                        </a-form-item>
                    </template>
                    
                </a-form>
            </div>

            <div class="popBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="confirm">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { modalStore } from '@/Stores/modalStore'
import myButton from '@/components/buttons/myButton.vue'
import { useI18n } from 'vue-i18n'
import tips from '@/components/tips'
import selectUnitSource from '@/components/selectUnitSource'

const { t } = useI18n()
const useModalStore = modalStore()

const selectUnitInfo = ref(null)

let formRef = ref()

const props = defineProps({
    operFlag: {
        type: String,
        defalut: 'add'
    },
    editAuthData: {
        type: Object
    }
})
// 表单字段枚举
const FIELDENUM = {
    useUnit: 'apiManage.unitName',
    userFid: 'apiManage.unitId',
    user: 'apiManage.user',
    // phone: 'apiManage.phone',
    authIp: 'apiManage.authIp',
    key: 'apiManage.key',
}

// 表单数据
let formState = reactive({
    useUnit: '',
    userFid: '',
    user: '',
    // phone: '',
    authIp: '',
    key: '',
})

let formStateShow = reactive({
    useUnit: true,
    userFid: true,
    user: true,
    authIp: true,
    key: true
})

let createByMarket = ref(false)

// 固定label宽度
const labelCol = { style: { width: '90px' } }

const emit = defineEmits(['addAuthConfirmHandle', 'changeDelVisible'])

onMounted(() => {
    if (props.operFlag === 'edit') {
        formState.useUnit = props.editAuthData.fidName
        formState.user = props.editAuthData.userName
        // formState.phone = props.editAuthData.userPhone
        formState.authIp = props.editAuthData.userIp
        formState.key = props.editAuthData.appKey
        formState.userFid = props.editAuthData.userFid
        echoFormField()
    }
})

// 回显表单字段 需与添加时保持一致
const echoFormField = () => {
    console.log('edit authh', props.editAuthData)
    let authId = props.editAuthData?.apiAuthInfoId
    // 手动创建的授权
    if(!authId || authId === '0')  return


    // api授权创建
    if(props.editAuthData.appKey) {
        formStateShow.userFid = false
        formStateShow.user = false
    }
    // 数据集市授权创建
    else {
        formStateShow.userFid = false
        formStateShow.user = false
        formStateShow.authIp = false
        formStateShow.key = false
        createByMarket.value = true
    }
}

const confirm = async () => {
    // 集市创建不校验
    if(createByMarket.value) {
        emit('addAuthConfirmHandle', { ...props.editAuthData, ...formState}, selectUnitInfo.value)
        return
    }
    try{
        let validateRes = await formRef.value.validateFields()
        if (validateRes) {
            emit('addAuthConfirmHandle', { ...props.editAuthData, ...formState}, selectUnitInfo.value)
        }
    } catch(e) {
        console.log('validate failed', e)
    }
}

const cancel = () => {
    useModalStore.changeEditAuthManageModalVisible()
    emit('changeDelVisible')
}

// 监听input框值变化 手动实现数据双向绑定
const changeHandle = (e, key) => {
    let val = e.target.value
    formState[key] = val.trim()
}

const formRule = (key) => {
    if(key === 'userFid') {
        return [{ validator: fidValidator }]
    } else if(key === 'authIp') {
        return []
    }
    return [{ required: true, message: t('common.pleaseEnter') + t(FIELDENUM[key]) }]
}

// 单位fid 只允许输入数字 非必填
const fidValidator = (rule, val) => {
    // if(!val) {
    //     return Promise.reject(t('common.pleaseEnter') + t(FIELDENUM[rule.field]))
    // }
    if(val === '' || /^\d+$/.test(val)){
        return Promise.resolve()
    } else {
        return Promise.reject(t('common.pleaseEnterNumber'))
    }
}

const selectFn = (item) => {
    selectUnitInfo.value = item
    formStateShow.userFid = false
    formStateShow.user = false
    formState.authIp = item.accessIp
    if(createByMarket.value) {
        formStateShow.authIp = false
    }
}
const clearHandle = () => {
    for(let key in formStateShow) {
        formStateShow[key] = true
    }
}
</script>

<style lang="less" scoped>
.edit-auth-modal {
    .modalBody {
        padding: 24px 24px;
        padding-left: 30px;
        form{
            width: 100%;
            // height: 480px;
        }
        .form-label{
            &+div {
                margin-left: 2px;
            }
        }

        :deep(.ant-form-item-label) {
            text-align: left;
        }
        :deep(.ant-form-item) {
            margin-bottom: 16px;
        }

        /deep/.ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
        .ant-form-item-has-error
            :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper,
        .ant-form-item-has-error
            :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper,
        .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover,
        .ant-form-item-has-error
            :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:hover,
        .ant-form-item-has-error
            :not(.ant-input-number-affix-wrapper-disabled):not(.ant-input-number-affix-wrapper-borderless).ant-input-number-affix-wrapper:hover {
            border: 1px solid #ff4d4f !important;
        }
    }
}
</style>
