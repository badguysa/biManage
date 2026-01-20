<template>
    <div className="delModal" :style="{ opacity: delVisible ? '0': '1' }">
        <div class="maskLayer"></div>
        <div class="popDiv wid840">
            <div class="popHead">
                <a class="popClose fr"
                    ><img style="width: 16px" src="@/assets/icons/close.png" @click="cancel"
                /></a>
                <p class="fl colorDeep">{{ t('apiManage.authManager') }}</p>
            </div>

            <div className="modalBody">
                <div class="bodyTop">
                    <div class="add" @click="addHandle">
                        <img src="@/assets/icons/plus.png" alt="add" />
                        <span>{{ t('selfConfig.add') }}</span>
                    </div>
                </div>
                <div class="tableWrapper">
                        <table class="tableContainer" v-if="authManageList.length">
                            <tr>
                                <td style="width: 143px">{{ t('apiManage.unitName') }}</td>
                                <td style="width: 100px">{{ t('apiManage.user') }}</td>
                                <!-- <td style="width: 113px">{{ t('apiManage.phone') }}</td> -->
                                <td style="width: 113px"><div class="auth-ip">{{ t('apiManage.authIp') }}</div></td>
                                <td style="width: 163px">appId</td>
                                <td style="width: 123px">appKey</td>
                                <td style="width: 123px">{{ t('apiManage.interfaceSwitch') }}</td>
                                <td style="width: 130px">{{ t('common.operation') }}</td>
                            </tr>
                            <tr v-for="item in authManageList" :key="item.id">
                                <td style="width: 143px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.fidName || '-' }}
                                        </template>
                                        <div>{{ item.fidName || '-' }}</div>
                                    </a-tooltip>
                                </td>
                                <td style="width: 100px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.userName || '-' }}
                                        </template>
                                        <div>{{ item.userName || '-' }}</div>
                                    </a-tooltip>
                                </td>
                                <!-- <td style="width: 113px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.userPhone || '-' }}
                                        </template>
                                        <div>{{ item.userPhone || '-' }}</div>
                                    </a-tooltip>
                                </td> -->
                                <td style="width: 113px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.userIp || '-' }}
                                        </template>
                                        <div class="auth-ip">{{ item.userIp || '-' }}</div>
                                    </a-tooltip>
                                </td>
                                <td style="width: 163px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.appId || '-' }}
                                        </template>
                                        <div @dblclick="copyValue(item.appId)">{{ item.appId || '-' }}</div>
                                    </a-tooltip>
                                </td>
                                <td style="width: 123px">
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.appKey || '-' }}
                                        </template>
                                        <div>{{ item.appKey || '-' }}</div>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <a-switch 
                                        size="small"
                                        @click="changeStatus(item)" 
                                        :checkedValue="1"
                                        :unCheckedValue="0"
                                        v-model:checked="item.enable"
                                    />
                                </td>
                                <td style="width: 130px; padding: 8px;">
                                    <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                    <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                </td>
                            </tr>
                        </table>
                    <div class="noData" v-if="!authManageList.length">
                        <img src="@/assets/images/img_null.png" alt="" />
                        <p>{{ t('common.noData') }}</p>
                    </div>
                </div>
            </div>

            <div class="popBottom shadowBox">
                <myButton class="fr mr25" type="primary" @click="confirm">{{ t('common.confirm') }}</myButton>
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>

    <!-- 授权管理编辑弹窗 -->
    <editAuthManageModal 
        v-if="editAuthManageModalVisible" 
        :operFlag="operFlag"
        :editAuthData="state.editAuthData"
        @addAuthConfirmHandle="addAuthConfirmHandle" 
        @changeDelVisible="changeDelVisible"
    />
    <!-- 删除弹窗 -->
    <deleteModal flag="authInter" ref="deleteModalRef" @changeDelVisible="changeDelVisible" @confirmRemoveHandle="confirmRemoveHandle" />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import myButton from '@/components/buttons/myButton.vue'
import { modalStore } from '@/Stores/modalStore'
import { apiManageStore } from '@/Stores/apiManageStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import { createAuthUser, editAuthUser, authManyUser, deleteAuthUser } from '@/apis/apiManage'
import editAuthManageModal from '../components/editAuthManageModal.vue'
import deleteModal from '../components/deleteModal.vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { changeApiAuth } from '@/apis/apiManage'

const { t } = useI18n()
const useModalStore = modalStore()
const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const  { editAuthManageModalVisible } = storeToRefs(useModalStore)
const { authManageList } = storeToRefs(useApiManageStore)
const { accessConfig } = storeToRefs(useMainStore)
const props = defineProps({
    authApiInfo: {
        type: Object
    }
})
let loading = ref(false)

let operFlag = ref('add')

let deleteModalRef = ref()

const delVisible = ref(false)

let state = reactive({
    editAuthData: {},
    deleteData: {}
})

const emit = defineEmits(['confirmAuthHandle'])

onMounted(() => {
    useApiManageStore.initAuthList(props.authApiInfo.id)
})

const confirm = () => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    emit('confirmAuthHandle')
    useModalStore.changeAuthManageModalVisible()
    // modalVisible.value = false
}

const copyValue = (value) => {
    const input = document.createElement("input")
    input.setAttribute("value", value)     
    document.body.appendChild(input)
    input.select()      
    document.execCommand("copy")       
    document.body.removeChild(input)
    message.success(t('otherConfig.copySuccess'))
}

const addHandle = () => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    operFlag.value = 'add'
    useModalStore.changeEditAuthManageModalVisible()
    delVisible.value = true
}

const editHandle = (item) => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useModalStore.changeEditAuthManageModalVisible()
    delVisible.value = true
    operFlag.value = 'edit'
    state.editAuthData = item
}

const removeHandle = (item) => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    deleteModalRef.value.modalVisible = true
    delVisible.value = true
    state.deleteData = item
}

const changeDelVisible = () => {
    delVisible.value = false
}

const cancel = () => {
    useModalStore.changeAuthManageModalVisible()
}

// 确认删除回调
const confirmRemoveHandle = () => {
    deleteAuthUser([state.deleteData.id]).then(res => {
        if (res.code == 1) {
            message.success(res.message)
            useApiManageStore.initAuthList(props.authApiInfo.id)
        } else {
            message.error(res.message)
        }
        delVisible.value = false
    })
}

// 添加授权管理弹窗 确定回调
const addAuthConfirmHandle = (addData, selectUnitInfo) => {
    if (operFlag.value === 'add') {
        const data = {
            appKey: addData.key,
            fidName: addData.useUnit,
            userIp: addData.authIp,
            userName: addData.user,
            // userPhone: addData.phone,
            userFid: addData.userFid
        }
        createAuthUser(data).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                authManyUser({
                    apiAuthInfoId: selectUnitInfo ? selectUnitInfo.id : undefined,
                    apiId: props.authApiInfo.id,
                    apiUserId: [res.data.id]
                }).then(res1 => {
                    if (res1.code == 1) {
                        useApiManageStore.initAuthList(props.authApiInfo.id)
                        useModalStore.changeEditAuthManageModalVisible()
                        delVisible.value = false 
                    } else {
                        message.error(res1.message)
                    }
                })
            } else {
                message.error(res.message)
            }
        })
    } else if (operFlag.value === 'edit') {
        const data = {
            appId: addData.appId,
            id: addData.id,
            appKey: addData.key,
            fidName: addData.useUnit,
            userIp: addData.authIp,
            userName: addData.user,
            // userPhone: addData.phone,
            userFid: addData.userFid
        }
        editAuthUser(data).then(res => {
            if (res.code == 1) {
                message.success(res.message)
                useApiManageStore.initAuthList(props.authApiInfo.id)
                useModalStore.changeEditAuthManageModalVisible()
                delVisible.value = false
            } else {
                message.error(res.message)
            }
        })
    }
}
const changeStatus = item => {
    changeApiAuth({id: item.id, enable: item.enable}).then((res) => {
        if(res.code === 1) {
            message.success(res.message)
        } else {
            message.error(res.message)
        }
    })
}
</script>

<style lang="less" scoped>
.delModal {
    .modalBody {
        display: flex;
        flex-direction: column;
        padding: 24px 24px;
        padding-left: 30px;
        gap: 16px;
        width: 100%;
        height: 480px;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: justify;
        color: rgba(0, 0, 0, 0.8);
        .bodyTop {
            display: flex;
            .add {
                border: 1px solid #3d82f2;
                border-radius: 4px;
                cursor: pointer;
                padding: 6px 17px;
                display: flex;
                align-items: center;
                img {
                    width: 20px;
                    height: 20px;
                    margin-right: 2px;
                }
                span {
                    font-size: 14px;
                    line-height: 20px;
                    color: #3d82f2;
                }
            }
        }
        .tableWrapper {
            height: 386px;
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            position: relative;
            .tableContainer {
                width: 792px;
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
                        &.auth-ip{
                            word-break: break-all;
                        }
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
            }

            .noData {
                text-align: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                img {
                    width: 180px;
                    height: 130px;
                }
                p {
                    font-weight: 400;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.4);
                }
            }
        }
    }
    
}
:deep(.ant-form-item-label > label){
    padding-left: 8px;
}
:deep(.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before){
    position: absolute;
    left: 0;
}
</style>
