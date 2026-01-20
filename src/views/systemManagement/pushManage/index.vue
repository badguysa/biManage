<template>
    <!-- 推送管理 -->
    <div v-if="apiPageId === 'pushManagePage'" class="manageWrapper">
        <div class="topContainer">
            <p class="title">{{ t('pushManage.pushManage') }}</p>
            <myButton class="add-btn" @click="() => { showModal() }">
                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                {{ t('selfConfig.add') }}
            </myButton>
        </div>
        <div class="tableWrapper">
            <table class="tableContainer">
                <tr>
                    <td>{{ t('pushManage.collectionName') }}</td>
                    <td>{{ t('pushManage.pushPlatform') }}</td>
                    <td>{{ t('common.operation') }}</td>
                    <td>{{ t('excel.status') }}
                        <a-tooltip>
                            <template #title>
                                {{ t('pushManage.statusTips') }}
                            </template>
                            <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                        </a-tooltip>
                    </td>
                </tr>
                <template v-if="collectionList.length">
                    <tr v-for="item in collectionList" :key="item.id">
                        <td>
                            <div :title="item.name">{{ item.name }}</div>
                        </td>
                        <td>
                            <div :title="item.pushPlatform.description">{{ item.pushPlatform.description }}</div>
                        </td>
                        <td>
                            <div>
                                <span @click="viewTheme(item)">{{ t('pushManage.viewPushTheme') }}</span>
                                <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                            </div>
                        </td>
                        <td>
                            <div>
                                <a-switch 
                                    size="small"
                                    :disabled="accessConfig.pushMgrAuth && accessConfig.pushMgrAuth.use == 0"
                                    @click="changeStatus(item)" 
                                    :checkedValue="1"
                                    :unCheckedValue="0"
                                    v-model:checked="item.status" 
                                />
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
        <div class="noData" v-if="!collectionList.length">
            <img src="@/assets/images/img_null.png" alt="" />
            <p>{{ (accessConfig.pushMgrAuth && accessConfig.pushMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
        </div>
        <div class="page" v-if="collectionDataTotal > 12">
            <a-pagination 
                v-model:current="collectionPageNumber" 
                :total="collectionDataTotal"
                :pageSize="12"
                show-less-items 
                @change="pageChange"
            />
        </div>
        <pushConnectionModal :editData="state.editData" :operFlag="state.operFlag" v-if="pushConnectionModalVisible" />
        <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle" />
    </div>

    <!-- 推送主题 -->
    <pushTopicDetail v-if="apiPageId === 'pushTopicDetailPage'"/>

    <!-- 推送记录 -->
    <pushRecord v-if="apiPageId === 'pushRecordPage'"/>

    <template v-if="apiPageId === 'addPushThemePage'">
        <!-- 新增推送主题 -->
        <addTheme :operFlag="themeOperFlag" :editData="themeEditData" />
        <!-- api多表合并 -->
        <apiMergeModal v-if="apiMergeModalVisible" />
        <!-- api删除步骤 -->
        <delProgressModal v-if="apiDelProgressModalVisible" />
        <!-- 添加列 -->
        <addColumnModal v-if="apiAddColumnModalVisible" />
        <!-- 模板管理 -->
        <templateModal operFlag="add" v-if="templateModalVisible" />
        <!-- 切换时提示弹窗 -->
        <exitTipModal v-if="exitTipModalVisible" />
    </template>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { modalStore } from '@/Stores/modalStore';
import { deleteCollection, changeCollectionStatus } from '@/apis/push'
import { apiManageStore } from '@/Stores/apiManageStore'
import { mainStore } from '@/Stores/mainStore'
import myButton from '@/components/buttons/myButton.vue';
import pushConnectionModal from '../components/pushConnectionModal'
import deleteModal from '../components/deleteModal.vue';
import pushTopicDetail from '../pushTopicDetail'
import pushRecord from '../pushRecord'
import addTheme from '../pushTopicDetail/addTheme.vue';
import apiMergeModal from '../components/apiMergeModal'
import delProgressModal from '../components/apiDelProgressModal';
import addColumnModal from '../components/apiAddColumnModal'
import templateModal from '../components/templateModal'
import exitTipModal from '../components/exitTipModal'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const useMainStore = mainStore()
const useSystemManageStore = systemManageStore()
const {
    pushConnectionModalVisible,
    apiMergeModalVisible,
    apiDelProgressModalVisible,
    apiAddColumnModalVisible,
    templateModalVisible,
    exitTipModalVisible
} = storeToRefs(useModalStore)
const { activeMenuName, collectionList, collectionDataTotal, collectionPageNumber, apiPageId, themeEditData, themeOperFlag } = storeToRefs(useApiManageStore)
const { accessConfig } = storeToRefs(useMainStore)
const state = reactive({
    tableData: [],
    deleteData: {},
    editData: {},
    operFlag: 'add',
    authApiInfo: {}
})

let deleteModalRef = ref()

// 查看推送主题
const viewTheme = (record) => {
    useSystemManageStore.setPushCollectionInfo(record)
    useApiManageStore.setApiPageId('pushTopicDetailPage')
    useApiManageStore.resetPushTopicPageNumber()
    useApiManageStore.initPushTopicList({
        collectionId: record.id
    })

    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'pushTopicDetailPage')
}

const editHandle = (item) => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    state.editData = item
    state.operFlag = 'edit'
    useModalStore.changePushConnectionModalVisible()
}

const showModal = () => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    state.operFlag = 'add'
    useModalStore.changePushConnectionModalVisible()
}

const removeHandle = (item) => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    deleteModalRef.value.modalVisible = true
    state.deleteData = item
}
const pageChange = () => {
    useApiManageStore.initCollectionList()
}
const changeStatus = record => {
    changeCollectionStatus({
        id: record.id
    }).then(res => {
        if (res.code == 1) {
            message.success(res.message)
        } else {
            message.error(res.message)
        }
    })
}
// 确认删除回调
const confirmRemoveHandle = () => {
    deleteCollection({
        ids: state.deleteData.id
    }).then(res => {
        if (res.code == 1) {
            if (collectionList.value.length === 1) {
                useApiManageStore.setCollectionPageNumber(collectionPageNumber.value - 1 || 1)
            }
            useApiManageStore.initCollectionList('update')
            message.success(res.message)
        } else {
            message.error(res.message)
        }
        state.deleteData = {}
    })
}

</script>

<style lang="less" scoped>
.manageWrapper {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding: 20px;
    padding-bottom: 40px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .topContainer {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
        }
        .add-btn {
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2px;
            height: 32px;
        }
    }
    .tableWrapper {
        position: relative;
        overflow: scroll;
        .tableContainer {
            width: 100%;
            td {
                height: 40px;
                max-height: 56px;
                width: 25%;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                & > div {
                    max-width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    & > span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
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
            .apiUrl {
                color: #3d82f2;
                cursor: pointer;
            }
        }
    }

    .noData {
        text-align: center;
        top: 50%;
        left: 50%;
        position: absolute;
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
    .page {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>
