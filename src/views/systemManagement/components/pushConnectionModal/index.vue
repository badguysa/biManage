<template>
    <div class="pushConnectionModal" v-cloak>
        <div class="maskLayer"></div>
        <div class="popDiv wid640">
            <div class="popuHead">
                <span class="popClose fr">
                    <img style="width: 16px" src="@/assets/icons/close.png" @click="cancel"/>
                </span>
                <p class="fl colorDeep">{{ operFlag === 'add' ? t('selfConfig.add') : t('common.edit')}}</p>
            </div>
            <div class="modalBody">
                <div class="row">
                    <div class="col-left required">{{ t('pushManage.collectionName') }}</div>
                    <div class="col-right">
                        <input :class="{input: true, errorField: errorFileds.includes('name')}" type="text" @input="validateFn('name')" v-model.trim="state.name" :placeholder="t('common.pleaseEnter')">
                    </div>
                </div>
                <div class="row">
                    <div class="col-left required">{{ t('pushManage.pushPlatform') }}</div>
                    <div class="col-right">
                        <a-select :class="{input: true, errorField: errorFileds.includes('pushType')}" @change="validateFn('pushType')" @select="selectPushPlatform" v-model:value="state.pushType" :placeholder="t('common.pleaseSelect')">
                            <a-select-option v-for="item in pushPlatform" :key="item.value" :value="item.value">
                                {{ item.description }}
                            </a-select-option>
                        </a-select>
                    </div>
                </div>
                <a-divider></a-divider>
                <div class="main-title">{{ t('pushManage.globalParam') }}</div>
                <div class="row" v-for="item in state.globalParams" :key="item.uuid">
                    <div :class='{"col-left":true, "required": item.required }'>{{ t('api.paramsName') }}</div>
                    <div class="col-ipt">
                        <input v-model.trim="item.key" type="text" :placeholder="t('common.pleaseEnter')">
                    </div>
                    <div style="margin-left: 25px; width: 50px;" class="col-left">{{ t('api.paramsValue') }}</div>
                    <div class="col-ipt">
                        <input v-model.trim="item.value" type="text" :placeholder="t('common.pleaseEnter')">
                    </div>
                    <img v-if="state.globalParams.length > 1" @click="deleteParams(item)" class="delete-icon" src="@/assets/icons/delete.png" alt="delete" />
                </div>
                <myButton class="add-btn" @click="addParams">
                    <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                    {{ t('api.addParams') }}
                </myButton>
            </div>

            <div class="popuBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="onOk">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import myButton from '@/components/buttons/myButton.vue'
import { storeToRefs } from 'pinia';
import { apiManageStore } from '@/Stores/apiManageStore';
import { modalStore } from '@/Stores/modalStore';
import { message } from 'ant-design-vue';
import { setCollection, getCollectionById } from '@/apis/push';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid'
const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const { pushPlatform }  =storeToRefs(useApiManageStore)
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
    name: '',
    pushType: undefined,
    status: 1,
    globalParams: [{
        uuid: uuidv4(),
        key: '',
        value: ''
    }], // 全局参数数据
    editData: {}
})

const field_map = {
    name: '集合名称',
    pushType: '推送平台'
}


const errorFileds = ref([])

onMounted(() => {
    useApiManageStore.getPushPlatform()
    if (props.operFlag === 'edit') {
        getCollectionById({
            id: props.editData.id
        }).then(res => {
            if (res.code == 1) {
                let tempArray = []
                for (let key in res.data.globalParams) {
                    tempArray.push({
                        uuid: uuidv4(),
                        key,
                        value: res.data.globalParams[key]
                    })
                }
                state.editData = res.data
                state.globalParams = tempArray.length ? tempArray : state.globalParams
                state.name = res.data.name
                state.pushType = res.data.pushPlatform.value
            }
        })
    }
})
const addParams = () => {
    state.globalParams.push({
        uuid: uuidv4(),
        key: '',
        value: ''
    })
}
const deleteParams = (record) => {
    state.globalParams = state.globalParams.filter(i => i.uuid !== record.uuid)
}
const cancel = () => {
    useModalStore.changePushConnectionModalVisible()
}
const selectPushPlatform = (value)=>{
    if(value===3){
        state.globalParams = [
            {
                uuid: uuidv4(),
                key: 'login_url',
                value: '',
                required: true
            },
            {
                uuid: uuidv4(),
                key: 'password',
                value: '',
                required: true
            },
            {
                uuid: uuidv4(),
                key: 'app_key',
                value: '',
                required: true
            },
            {
                uuid: uuidv4(),
                key: 'push_url',
                value: '',
                required: true
            },
            {
                uuid: uuidv4(),
                key: 'username',
                value: '',
                required: true
            },
        ]
    } else {
        state.globalParams = [{
            uuid: uuidv4(),
            key: '',
            value: ''
        }]
    }
}

const onOk = () => {
    if(!validateFn(null, 'submit')) return

    // 添加必填判断
    const requiredList = state.globalParams.filter(item => item.required && !item.value)
    if(requiredList.length > 0){
        message.warning(t('otherConfig.blankTableTip'))
        return
    }

    let jsonData = {}
    let params = {}
    state.globalParams.forEach(item => { params = { ...params, [item.key]: item.value } })
    if (props.operFlag === 'add') {
        jsonData = {
            name: state.name,
            pushPlatform: state.pushType,
            globalParams: params,
            status: state.status
        }
    } else {
        jsonData = {
            name: state.name,
            pushPlatform: state.pushType,
            globalParams: params,
            status: state.editData.status,
            id: state.editData.id
        }
    }
    setCollection(jsonData).then(res => {
        if (res.code == 1) {
            useApiManageStore.initCollectionList('update')
            message.success(res.message)
            useModalStore.changePushConnectionModalVisible()
        } else {
            message.error(res.message)
        }
    })
}

/**
 * 校验必填字段是否有值
 * @param {*} field 校验字段
 * @param {*} validateType 校验类型
 */
const validateFn = (field, validateType) => {
    let validateFields = field ? [field] : ['name', 'pushType']
    errorFileds.value = []
    validateFields.forEach(key => {
        (!state[key] && state[key] !== 0) && errorFileds.value.push(key)
    })

    if(validateType === 'submit') {
        let key = errorFileds.value[0]
        key && message.error('请输入' + field_map[key])
    }

    return !errorFileds.value.length
}
</script>

<style lang="less" scoped>
[v-cloak] {
    display: none;
}
.pushConnectionModal {
    .modalBody {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 24px;
        width: 100%;
        height: 362px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        overflow-y: scroll;
        overflow-x: hidden;
        :deep(.ant-divider-horizontal) {
            margin: 4px 0;
        }
        .main-title {
            color: rgba(0, 0, 0, 0.8);
            font-weight: 600;
            font-size: 13px;
            line-height: 18px;
        }
        .row {
            display: flex;
            align-items: center;
            .col-left {
                margin-right: 4px;
                width: 68px;
                line-height: 18px;
                &.required {
                    position: relative;
                    &::before {
                        content: '*';
                        display: inline-block;
                        color: #ff4d4f;
                        position: absolute;
                        left: -8px;
                    }
                }
            }
            .col-ipt {
                input {
                    width: 210px;
                }
            }
            .delete-icon {
                width: 16px;
                cursor: pointer;
                margin-left: 8px;
            }
            .col-right {
                .input {
                    width: 520px;
                    &.errorField, &.errorField:focus{
                        border-radius: 4px;
                        border: 1px solid #ff4d4f;
                        box-shadow: none;
                        :deep(.ant-select-selector){
                            box-shadow: none;
                            border: none;
                        }
                    }
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
    }
}
</style>
