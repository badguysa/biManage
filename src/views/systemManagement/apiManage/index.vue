<template>
    <template v-if="apiPageId === 'apiManagePage'">
        <div class="manageWrapper">
            <div class="topContainer">
                <p class="title">{{ t('apiManage.apiManage') }}</p>
                <div class="bottom-box">
                    <div class="search">
                            <input type="text" v-model.trim="apiSearchValue" :placeholder="t('common.search')">
                            <img class="sear" src="@/assets/icons/search.png" alt="">
                        </div>
                    <div class="right-box">
                        <span @click="groupManageFn">
                            <img :src="blood_analyze" style="width: 14px;" />
                            {{ t('apiManage.groupManage') }}
                        </span>
                        <span @click="showApiHistory">
                            <img :src="updateRecord" style="width: 14px;" />
                            {{ t('apiManage.historyRecord') }}
                        </span>
                        <myButton class="add-btn" @click="() => { addApiRecord() }">
                        <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                        {{ t('selfConfig.add') }}
                    </myButton>
                    </div>
                </div>
            </div>
            <div class="tableWrapper">
                <a-spin :spinning="loading">
                    <table class="tableContainer">
                        <tr>
                            <td>{{ t('apiManage.apiName') }}</td>
                            <td>{{ t('apiManage.apiDesc') }}</td>
                            <!-- <td>{{ t('apiManage.mapperTable') }}</td> -->
                            <td>
                                <headDropDown
                                    :needCheckAll="true"
                                    :checkList="groupList"
                                    @updateCheck="updateCheckFn"
                                    :title="t('apiManage.group')"
                                />
                            </td>
                            <td>{{ t('apiManage.foundTime') }}</td>
                            <td>{{ t('apiManage.apiAddress') }}</td>
                            <td>{{ t('common.operation') }}</td>
                            <td>
                                {{ t('apiManage.apiStatus') }}
                                <a-tooltip>
                                    <template #title>
                                        {{ t('apiManage.checkApiTip') }}
                                    </template>
                                    <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                            </td>
                            <td>
                                {{ t('apiManage.interfaceSwitch') }}
                                <a-tooltip>
                                    <template #title>
                                        {{ t('apiManage.interfaceSwitchTip') }}
                                    </template>
                                    <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                            </td>
                        </tr>
                        <template v-if="indexTableData.length">
                            <tr v-for="item in indexTableData" :key="item.id">
                                <td>
                                    <div @click="showMarketApiDetail(item)" :class="{dataMarketApi: item.dmResourceId}" :title="item.apiName">{{ item.apiName }}</div>
                                </td>
                                <td>
                                    <div :title="item.apiDesc">{{ item.apiDesc }}</div>
                                </td>
                                <!-- <td>
                                    <div :title="item.tableName?.join('、') || '-'">{{ item.tableName?.join('、') || '-' }}</div>
                                </td> -->
                                <td>
                                    <div :data-group-id=" item.groupId" :title="item.groupName">{{ item.groupName || '-'}}</div>
                                </td>
                                <td>
                                    <div :title="item.createTime ? formatTime(Number(item.createTime)) : 0">
                                        {{ item.createTime ? formatTime(Number(item.createTime)) : 0 }}
                                    </div>
                                </td>
                                <td class="apiUrl">
                                    <div class="url-box">
                                        <div @click="viewApiDetail(item)" class="url-text">{{ item.apiPath }}</div>
                                        <img class="download" @click="exportData(item)" src="@/assets/icons/download.png">
                                    </div>
                                </td>
                                <td class="api-operate">
                                    <div>
                                        <span @click="authManage(item)">{{ t('apiManage.authManager') }}</span>
                                        <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                        <span @click="moveTo(item)">{{ t('indexPage.moveTo') }}</span>
                                        <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <span :style="{color: item.state === 1 ? '#00B42A' : '#F53F3F'}">
                                            {{ item.state === 1 ? t('apiManage.normal') : t('apiManage.abnormity') }}
                                        </span>
                                        <a-tooltip v-if="item.state === 0">
                                            <template #title>
                                                {{ item.exceptionCause }}
                                            </template>
                                            <img style="width: 12px; margin-top: -4px; margin-left: -10px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                        </a-tooltip>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <a-switch 
                                            size="small"
                                            @click="changeStatus(item)" 
                                            :checkedValue="1"
                                            :unCheckedValue="0"
                                            v-model:checked="item.enable"
                                        />
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </table>
                </a-spin>
    
            </div>
            <div class="noData" v-if="!indexTableData.length">
                <img src="@/assets/images/img_null.png" alt="" />
                <p>{{ (accessConfig.apiMgrAuth && accessConfig.apiMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
            </div>
            <div class="page" v-if="apiDataTotal > 12">
                <a-pagination 
                    v-model:current="apiPageNumber" 
                    :total="apiDataTotal"
                    :pageSize="12"
                    show-less-items 
                    @change="pageChange"
                />
            </div>
        </div>
    </template>
    <template v-else-if="apiPageId === 'addApiPage'">
        <selfConfigView />
    </template>

    <!-- api详情页 -->
    <apiDetail v-else-if="apiPageId === 'apiDetailPage'"/>

    <!-- 历史记录 -->
    <historyRecord v-else-if="apiPageId === 'apiHistoryRecord'" />

    <!-- 删除弹窗 -->
    <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle" />

    <!-- 授权管理弹窗 -->
    <authManageModal 
        v-if="authManageModalVisible"
        :authApiInfo="state.authApiInfo"
        @confirmAuthHandle="confirmAuthHandle" 
    />
    <apiAddModal
        v-if="apiAddModalVisible"
        :editData="state.editData"
        :operFlag="state.operFlag"
    />

    <!-- api多表合并 -->
    <apiMergeModal v-if="apiMergeModalVisible && apiPageId === 'addApiPage'"/>

    <!-- api删除步骤 -->
    <delProgressModal v-if="apiDelProgressModalVisible && apiPageId === 'addApiPage'" />

    <!-- 添加列 -->
    <addColumnModal v-if="apiAddColumnModalVisible && apiPageId === 'addApiPage'" ref="modalRef" />

    <!-- 切换提示 -->
    <exitTipModal v-if="exitTipModalVisible && apiPageId === 'addApiPage'"></exitTipModal>

    <!-- 分组管理 -->
    <apiGroupManage v-bind="groupModalState" @update:modalVisible="groupModalState.visible = $event"/>
</template>

<script setup>
import { modalStore } from '@/Stores/modalStore';
import { deleteApi, getApiDetail, enableApi } from '@/apis/apiManage'
import { storeToRefs } from 'pinia';
import { formatTime, handleExportHtmlStr } from '@/utils/utils'
import updateRecord from '@/assets/icons/update_record.png'
import blood_analyze from '@/assets/icons/blood_analyze.png'
import selfConfigView from '../components/selfconfig'
import deleteModal from '../components/deleteModal.vue'
import myButton from '@/components/buttons/myButton.vue';
import apiMergeModal from '../components/apiMergeModal'
import delProgressModal from '../components/apiDelProgressModal';
import authManageModal from '../components/authManageModal.vue'
import { apiManageStore } from '@/Stores/apiManageStore'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { mainStore } from '@/Stores/mainStore'
import apiAddModal from '../components/apiAddModel'
import addColumnModal from '../components/apiAddColumnModal'
import exitTipModal from '../components/exitTipModal'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import apiDetail from '../apiDetail'
import historyRecord from '../historyRecord'
import headDropDown from '@/components/tableHeadDropdown'
import apiGroupManage from '../components/apiGroupManage'
import { getStandardLibList } from '@/apis/dataStandard'
import { getDetail } from '@/apis/dataMarket'
import { SYSTEM_MENU_MAP } from '@/constants/systemManage'

const { t } = useI18n()

const useApiManageStore = apiManageStore()
const useApiConfigStore = apiConfigStore()
const useMainStore = mainStore()

const useModalStore = modalStore()
const { 
    apiAddModalVisible, 
    authManageModalVisible,
    apiMergeModalVisible,
    apiDelProgressModalVisible,
    apiAddColumnModalVisible,
    exitTipModalVisible
} = storeToRefs(useModalStore)
const { accessConfig } = storeToRefs(useMainStore)
const { activeMenuName, indexTableData, apiPageId, apiPageNumber, apiDataTotal, apiSearchValue } = storeToRefs(useApiManageStore)
const state = reactive({
    tableData: [],
    deleteData: {},
    editData: {},
    operFlag: 'add',
    authApiInfo: {}
})
let loading = ref(false)

let deleteModalRef = ref()

const groupModalState = reactive({
    visible: false,
    modalType: 'manage',
    // 移动的分组
    moveApi: {},
})

// 默认未分组信息
const DEFAULT_GROUP_ID = '-1'
const defaultGroup = {
  name: '未分组API',
  id: DEFAULT_GROUP_ID,
  value: DEFAULT_GROUP_ID
}

const groupIds = ref('')

// 分组列表
const groupList = ref([])

const router = useRouter()

onMounted(() => {
    useApiManageStore.initApiList()
    getApiGroupList()
})


// 获取api分组
const getApiGroupList = () => {
  getStandardLibList({ groupType: 2 }).then(res => {
    if (res.code !== 1) return message.error(res.message)
    groupList.value = [
      defaultGroup,
      ...(res.data.map(it => ({
        ...it,
        value: it.id
      })))
    ]
  })
}

provide('API_GROUP_OBJ', {
    list: groupList,
    getList: getApiGroupList,
})

watch(() => apiSearchValue.value, () => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.read == 0) {
            return
        }
    }
    useApiManageStore.setApiPageNumber(1)
    useApiManageStore.initApiList(null, groupIds.value)
})

// 选择分组
const updateCheckFn = (ids) => {
    if(ids.includes(DEFAULT_GROUP_ID)) {
        ids = ids.filter(id => id !== DEFAULT_GROUP_ID)
        ids.unshift('-1')
    }
    groupIds.value = ids.join(',')
    useApiManageStore.setApiPageNumber(1)
    useApiManageStore.initApiList(null, groupIds.value)
}

const groupManageFn = () => {
    groupModalState.visible = true
    groupModalState.modalType = 'manage'
}

const moveTo = (item) => {
    groupModalState.visible = true
    groupModalState.modalType = 'moveTo'
    groupModalState.moveApi = item
}

const authManage = (item) => {
    state.authApiInfo = item
    useModalStore.changeAuthManageModalVisible()
}

const editHandle = (item) => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    if (!item.queryConfig) {
        state.editData = item
        state.operFlag = 'edit'
        useModalStore.changeApiAddModalVisible()
        return
    }
    useApiConfigStore.setSelfFlag('edit')
    useApiConfigStore.setTableSource(item.queryConfig.concat())
    useApiConfigStore.setSelfEditData(item)
    state.operFlag = 'edit'
    const headInfo = {
        apiName: item.apiName, // 接口名称
        apiDesc: item.apiDesc, // 接口描述
        apiType: item.apiType.value, // 接口类型
        resTemplateId: item.resTemplateId || '', // 模板id
    }
    useApiConfigStore.setHeaderInfo(headInfo)
    useApiManageStore.setApiPageId('addApiPage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'addApiPage')
}

const addApiRecord = () => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    state.operFlag = 'add'
    useApiConfigStore.setSelfFlag('add')
    useApiManageStore.setApiPageId('addApiPage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'addApiPage')
    // useModalStore.changeApiAddModalVisible()
}

const showApiHistory = () => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.read == 0) {
            return message.error(t('common.noAuth'))
        }
    }

    useApiManageStore.setApiPageId('apiHistoryRecord')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'apiHistoryRecord')
}

const removeHandle = (item) => {
    if (accessConfig.value.apiMgrAuth) {
        if (accessConfig.value.apiMgrAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    deleteModalRef.value.modalVisible = true
    state.deleteData = item
}

const pageChange = () => {
    useApiManageStore.initApiList(null, groupIds.value)
}

// 确认删除回调
const confirmRemoveHandle = () => {
    deleteApi({
        ids: state.deleteData.id
    }).then(res => {
        if (res.code == 1) {
            if (indexTableData.value.length === 1) {
                useApiManageStore.setApiPageNumber(apiPageNumber.value - 1 || 1)
            }
            useApiManageStore.initApiList('update', groupIds.value)
            useApiManageStore.setApiDataTotal('minus')
            message.success(res.message)
        }
        state.deleteData = {}
    })
}

// 确认授权回调
const confirmAuthHandle = () => {
}

const exportData = (item) => {
    getApiDetail({
        id: item.id,
        export: 1, // 该参数用于区分查看和导出
    }).then(res => {
        if(res.code === 0) return message.error(res.message)
        asBlob(handleExportHtmlStr(res)).then((data) => {
            saveAs(data, `${item.apiName}.docx`);
        });
    })
}

// 查看接口详情
const viewApiDetail = (item) => {
    useApiManageStore.initApiDetail({
        id: item.id
    })

    useApiManageStore.setApiPageId('apiDetailPage')
    useApiManageStore.changeTabPageId('edit', activeMenuName.value, 'apiDetailPage')
}

const changeStatus = item => {
    enableApi(item.id, {enable: Boolean(item.enable)}).then((res) => {
        if(res.code === 1) {
            message.success(res.message)
        } else {
            message.error(res.message)
        }
    })
}

// 跳转数据集市api详情
const showMarketApiDetail = async (item) => {
    if(!item.dmResourceId)  return

    let res = await getDetail(item.dmResourceId)
    // 集市资源被删除 接口提示
    if(res.code !== 1)  return message.error(res.message)

    useApiManageStore.setActiveMenuName(SYSTEM_MENU_MAP.MARAKET_MANAGE)

    useApiManageStore.addApiTab({
        name: 'dataMarket.marketManage',
        id: SYSTEM_MENU_MAP.MARAKET_MANAGE,
        path: '/system/marketManage',
    })

    useMainStore.setDataSourceInfo(res.data)
    // 路由跳转
    router.push('/system/marketManage')
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
        .bottom-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            .right-box {
                height: 100%;
                display: flex;
                align-items: center;
                img{
                    margin-bottom: 2px;
                }
            }
            span {
                color: #2B67FF;
                font-size: 14px;
                line-height: 17px;
                margin-right: 30px;
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
        overflow: auto;
        .tableContainer {
            width: 100%;
            td {
                height: 40px;
                max-height: 56px;
                width: calc(100% / 8);
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
                    word-break: break-all;
                    line-height: 1.2;
                    &.dataMarketApi{
                        color: #2B67FF;
                        cursor: pointer;
                    }
                    & > span {
                        color: #3d82f2;
                        cursor: pointer;
                        margin-right: 16px;
                    }
                }
                &.api-operate{
                    width: 16%;
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
                .url-box {
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .url-text {
                    max-width: 80%;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    cursor: pointer;
                }
                .download {
                    position: absolute;
                    right: 8px;
                    width: 14px;
                    height: 14px;
                    margin-left: 5px;
                    margin-top: -3px;
                    cursor: pointer;
                }
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
