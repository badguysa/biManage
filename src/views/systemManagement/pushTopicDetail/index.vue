<template>
    <div class="themeContainer">
        <back @backFn="backFn"/>
        <div class="themeWrapper">
            <div class="topContainer">
                <p class="title">
                    {{ t('pushManage.pushTheme') }}
                    <a-tooltip v-if="pushCollectionInfo">
                        <template #title>
                            推送集合：{{ pushCollectionInfo.name }}
                        </template>
                        <img style="width: 16px; margin-top: -4px;" src="@/assets/icons/tips_gray.png" alt="">
                    </a-tooltip>
                </p>
                <div class="bottom-box">
                    <div class="search">
                        <input type="text" v-model.trim="pushTopicSearchValue" :placeholder="t('common.search')"
                            @input="refreshListDebounce">
                        <img class="sear" src="@/assets/icons/search.png" alt="">
                    </div>
                    <div class="right-box">
                        <!-- 公网环境 智慧大脑 支持导入模版 -->
                        <BiButton @click="importTemplate" v-if="collectionIsZHDN && !mirrorInfo.mirror">
                            <template #icon>
                                <img src="@/assets/icons/import_template.png" style="width: 16px;" alt="add" />
                            </template>
                            导入模版
                        </BiButton>
                        <BiButton @click="handleAdd">
                            <template #icon>
                                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                            </template>
                            添加
                        </BiButton>
                    </div>
                </div>
            </div>
            <div class="tableWrapper">
                <a-spin :spinning="pushListLoading">
                    <table class="tableContainer" v-if="pushTopicList.length">
                        <tr>
                            <td>{{ t('pushManage.themeName') }}</td>
                            <td>{{ t('pushManage.relatedTable') }}</td>
                            <td>{{ t('pushManage.pushPlatform') }}</td>
                            <td>{{ t('common.operation') }}</td>
                            <td>{{ t('excel.status') }}
                                <a-tooltip>
                                    <template #title>
                                        {{ t('pushManage.topicStatusTips') }}
                                    </template>
                                    <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                            </td>
                        </tr>
                        <tr v-for="item in pushTopicList" :key="item.id">
                            <td>
                                <div :class="{unBindTable: item.status === 2}" :title="item.name">{{ item.name }}</div>
                            </td>
                            <td>
                                <div :class="{unBindTable: item.status === 2}" v-if="item.tableNames" :title="item.tableName">{{ item.tableNames.join(',') }}</div>
                                <!-- <div v-else class="errorInfo">关联表已删除</div> -->
                            </td>
                            <td>
                                <div :class="{unBindTable: item.status === 2}" :title="item.pushPlatform.description">{{ item.pushPlatform.description }}</div>
                            </td>
                            <td>
                                <div>
                                    <span @click="pushHandle(item)">{{ item.runningInstanceId ? t('pushManage.pushCancel'): t('pushManage.pushImmediate') }}</span>
                                    <span @click="viewPushRecord(item)">{{ t('pushManage.viewPushRecord') }}</span>
                                    <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                    <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <a-switch size="small" :disabled="accessConfig.pushMgrAuth && accessConfig.pushMgrAuth.use == 0"
                                        @click="changeStatus(item)" :checkedValue="1" :unCheckedValue="0"
                                        v-model:checked="item.status" />
                                </div>
                            </td>
                        </tr>
                    </table>
                </a-spin>
            </div>
            <div class="noData" v-if="!pushTopicList.length">
                <img src="@/assets/images/img_null.png" alt="" />
                <p>{{ t('common.noData') }}</p>
            </div>
            <div class="page" v-if="pushTopicTotal > 12">
                <a-pagination v-model:current="pushTopicPageNumber" :total="pushTopicTotal" :pageSize="12" show-less-items
                    @change="pageChange" />
            </div>
        </div>
        <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle" />
    </div>
    <templateTipsModal
        v-if="showTemplageModal"
        :hasTheme="hasTheme"
        @hideModal="hideTemplateMoal"
    />
</template>

<script setup>
import { message } from 'ant-design-vue';
import * as _ from 'loadsh'
import { deletePushTopic, pushRightNow, changeTopicStatus, cancelPush, getPushTopic } from '@/apis/push'
import { storeToRefs } from 'pinia';
import { apiManageStore } from '@/Stores/apiManageStore'
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { mainStore } from '@/Stores/mainStore'
import deleteModal from '../components/deleteModal.vue';
import createDialog from '@/utils/dialog'
import back from '@/components/back'
import templateTipsModal from './importTemplateTips'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useApiConfigStore = apiConfigStore()
const useSystemManageStore = systemManageStore()
const useMainStore = mainStore()
const { accessConfig, mirrorInfo } = storeToRefs(useMainStore)


const { activeMenuName, pushTopicList, pushTopicPageNumber, pushTopicTotal, pushTopicSearchValue, pushListLoading } = storeToRefs(useApiManageStore)

const { pushCollectionInfo } = storeToRefs(useSystemManageStore)

const state = reactive({
    deleteData: {},
})

let deleteModalRef = ref()

const showTemplageModal = ref(false)

const backFn = () => {
    useApiManageStore.setApiPageId('pushManagePage')
    useApiManageStore.changeTabPageId('reset', activeMenuName.value)
    useApiManageStore.initCollectionList()
    useApiManageStore.resetPushTopicList()
}

const refreshListDebounce = _.debounce(() => {
    if(!pushCollectionInfo.value) return
    pushTopicPageNumber.value = 1
    useApiManageStore.initPushTopicList({
        collectionId: pushCollectionInfo.value.id,
        name: pushTopicSearchValue.value
    })
}, 200)

const handleAdd = () => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useApiManageStore.resetThemeEditData()
    useApiManageStore.setApiPageId('addPushThemePage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'addPushThemePage')
}

const importTemplate = () => {
    showTemplageModal.value = true
}

const hideTemplateMoal = () => {
    showTemplageModal.value = false
    useApiManageStore.initPushTopicList({
        collectionId: pushCollectionInfo.value.id
    })
}

// 是否含有主题
const hasTheme = computed(() => !!pushTopicList.value.length)

// 是否为智慧大脑
const collectionIsZHDN = computed(() => {
    return pushCollectionInfo.value?.pushPlatform?.value === 3
})

const refreshList = () =>{
    useApiManageStore.initPushTopicList({
        collectionId: pushCollectionInfo.value.id,
        name: pushTopicSearchValue.value
    })
} 

const pushNow = (record) => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    const hide = message.loading(t('pushManage.pushIng'), 0)
    pushRightNow({
        id: record.id
    }).then(res => {
        if (res.code == 1) {
            hide()
            refreshList()
            message.success(res.message)
        } else {
            hide()
            refreshList()
            message.error(res.message)
            if(res.extendData?.exception){
                console.log("推送报错", res.extendData.exception);
            }
        }
    })
}

// 立即推送
const pushHandle = (record) => {
    if(!record.runningInstanceId){
        createDialog({
            title: '提示',
            content: `确定推送主题 <span class="kw">${record.name}</span>？`,
            okText: '确定',
            cancelText: '取消'
        }).then(() => {
            pushNow(record)
        }).catch(() => {})
    } else{
        pushCancel(record)
    }
}

// 取消推送 start
const pushCancel  = (record) =>{
    createDialog({
        title: '提示',
        content: `确定取消推送主题 <span class="kw">${record.name}</span>？`,
        okText: '确定',
        cancelText: '取消'
    }).then(async () => {
        // 逻辑有优化空间
        const jsonData = {
            collectionId: pushCollectionInfo.value.id,
            name: record.name,
            pageNum: 1,
            pageSize: 12
        }
        // 解决数据不及时更新问题
        getPushTopic(jsonData).then(res => {
            if (res.code == 1) {
                pushTopicList.value = res.data.records
                const flag = res.data.records.find((item) => {
                    return item.id === record.id && item.runningInstanceId !== null
                })
                if(flag){
                    cancelNow(record)
                }else{
                    message.success(t('pushManage.pushTaskDone'))
                }
            }
        })
    }).catch(() => {})
}
// 取消推送 end

const cancelNow = (record) =>{
    cancelPush({
        pushTopicId: record.id
    }).then(res => {
        if (res) {
            useApiManageStore.initPushTopicList({
                collectionId: pushCollectionInfo.value.id,
                name: pushTopicSearchValue.value
            })
            message.success(t('common.operationSuccess'))
        }
    })
}

const changeStatus = record => {
    changeTopicStatus({
        id: record.id
    }).then(res => {
        if (res.code == 1) {
            message.success(res.message)
        } else {
            message.error(res.message)
        }
    })
}

// 查看推送记录
const viewPushRecord = (record) => {
    useSystemManageStore.setPushRecordId(record.id)
    useApiManageStore.setApiPageId('pushRecordPage')
    useApiManageStore.initPushRecordList({
        topicId: record.id
    })
    useApiManageStore.setPushRecordMethod(record.pushMethod)
    useApiManageStore.setPushDataMode(record.pushDataMode)
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'pushRecordPage')
}

const editHandle = (item) => {
    if (accessConfig.value.pushMgrAuth) {
        if (accessConfig.value.pushMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useApiConfigStore.setSelfFlag('edit')
    // 深拷贝 不改变源数据
    useApiConfigStore.setTableSource(item.queryConfig.concat(), 'equal')
    useApiConfigStore.setSelfEditData(item)
    useApiManageStore.setThemeEditData(item)
    useApiManageStore.setThemeOperFlag('edit')
    useApiManageStore.setApiPageId('addPushThemePage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'addPushThemePage')
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
    useApiManageStore.initPushTopicList({
        collectionId: pushCollectionInfo.value.id,
        name: pushTopicSearchValue.value
    })
}
// 确认删除回调
const confirmRemoveHandle = () => {
    deletePushTopic({
        ids: state.deleteData.id
    }).then(res => {
        if (res.code == 1) {
            if (pushTopicList.value.length === 1) {
                pushTopicPageNumber.value = pushTopicPageNumber.value - 1 || 1
            }
            useApiManageStore.initPushTopicList({
                collectionId: pushCollectionInfo.value.id
            }, 'update')
            message.success(res.message)
        } else {
            message.error(res.message)
        }
        state.deleteData = {}
    })
}

</script>

<style lang="less" scoped>
.themeContainer {
    width: 100%;
    height: calc(100% - 36px);
    background-color: #fff;
    padding-bottom: 40px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    .themeWrapper {
        padding: 20px 30px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .topContainer {
        margin-bottom: 16px;

        .title {
            font-weight: 600;
            font-size: 18px;
            line-height: 25px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 0;
        }

        .bottom-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;

            .right-box {
                height: 100%;
                display: flex;
                align-items: center;
                gap: 20px;
            }

            span {
                color: #2B67FF;
                font-size: 14px;
                line-height: 17px;
                margin-right: 24px;
                cursor: pointer;
            }

            .search {
                width: 210px;
                height: 46px;
                padding: 8px 12px;
                padding-left: 0;
                position: relative;

                input {
                    width: 176px;
                    height: 30px;
                    padding-right: 33px;
                }

                .sear {
                    width: 16px;
                    position: absolute;
                    top: 15.2px;
                    right: 40.6px;
                    cursor: pointer;
                }

                .clear {
                    position: absolute;
                    top: 15.5px;
                    right: 46.6px;
                    width: 16px;
                    cursor: pointer;
                }
            }
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
                width: 18%;
                
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                &:nth-of-type(4){
                    width: 28%;
                }

                &>div {
                    max-width: 100%;
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;

                    &>span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
                    &.errorInfo{
                        color: #F33131;
                    }
                    &.unBindTable{
                        opacity: .4;
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
        top: 25%;
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
</style>import { color } from 'html2canvas/dist/types/css/types/color';

