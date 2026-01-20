<template>
    <div class="manageWrapper" :style="tmplPage === 'index' ? '--hightOffset: 98px' : '--hightOffset: 115px'">
        <p v-if="tmplPage === 'index'" class="my_title">{{ t('templateManage.templateManage') }}</p>
        <div :class="{topContainer: true, groupTop: tmplPage === 'group'}">
            <div class="search" v-if="tmplPage === 'index'">
                <input @input="onSearch" @compositionstart="onCompositionstart" @compositionend="onCompositionend" type="text" v-model="searchValue" :placeholder="t('common.search')">
                <img @click="onSearch" class="sear" src="@/assets/icons/search.png" alt="" />
            </div>
          
            <div @click="goBack" class="backbox" v-if="tmplPage === 'group'">
                <img src="@/assets/icons/return.png" alt="">
                {{ t('common.back') }}
            </div>
            <myButton class="add-btn" @click="() => { showModal() }">
                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="add" />
                {{ t('selfConfig.add') }}
            </myButton>
        </div>
        <p class="groupName" v-if="tmplPage==='group'">{{ tmpGroupName }}</p>
        <a-spin :spinning="tmpListLoading">
            <div ref="wrapperRef" class="tableWrapper" @scroll="handleScroll">
                <template v-if="tmplPage === 'index'">
                    <table class="tableContainer">
                        <colgroup>
                        <col width="40%"/>
                        <col width="40%"/>
                        <col width="20%"/>
                        </colgroup>
                        <tr>
                            <td>{{ t('templateManage.templateName') }}</td>
                            <td>{{ t('templateManage.templateContent') }}</td>
                            <td>{{ t('common.operation') }}</td>
                        </tr>
                        <template v-if="tmplGroupList.length">
                            <tr v-for="item in tmplGroupList" :key="item.id">
                                <td>
                                    <div class="renameContainer" v-if="state.renameGroupInfo.id === item.id">
                                        <input ref="renameInputRef" type="text" v-model="state.renameGroupInfo.name">
                                        <img @click.stop="renameGroup('ok', item)" :src="okImg" alt="">
                                        <img @click.stop="renameGroup('cancel')" :src="cancelImg" alt="">
                                    </div>
                                    <div v-else class="group">
                                        <img class="folder" src="@/assets/icons/folder.png" alt="">
                                        {{ item.groupName }}
                                    </div>
                                </td>
                                <td>
                                    <div v-if="item.id === SYSTEM_TEMPLATE_ID">{{ t('templateManage.systemTempCanNotEdit') }}</div>
                                    <div v-else>{{ item.description }}</div>
                                </td>
                                <td>
                                    <div class="operateWrap">
                                        <span @click="checkTmplList(item)">{{ t('common.check') }}</span>
                                        <!-- 系统模板不能删除、重命名 -->
                                        <template v-if="item.id !== SYSTEM_TEMPLATE_ID">
                                            <span @click="renameTmpList(item)">{{ t('common.rename') }}</span>
                                            <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                        </template>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-if="templateList.length">
                            <tr v-for="item in templateList" :key="item.id">
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.templateName }}
                                        </template>
                                        <div>{{ item.templateName }}</div>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.templateContent }}
                                        </template>
                                        <div>{{ item.templateContent }}</div>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <div class="operateWrap">
                                        <span @click="checkTmp(item)">{{ t('common.check') }}</span>
                                        <span v-if="item.exampleData" @click="reviewParseRes(item)">{{ t('templateManage.reviewParseRes') }}</span>
                                        <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                        <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </table>
                </template>
                <template v-if="tmplPage === 'group'">
                    <table class="tableContainer">
                        <colgroup>
                            <col width="40%"/>
                            <col width="40%"/>
                            <col width="20%"/>
                        </colgroup>
                        <tr>
                            <td>{{ t('templateManage.templateName') }}</td>
                            <td>{{ t('templateManage.templateContent') }}</td>
                            <td>{{ t('common.operation') }}</td>
                        </tr>
                        <template v-if="templateList.length">
                            <tr v-for="item in templateList" :key="item.id">
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.templateName }}
                                        </template>
                                        <div>{{ item.templateName }}</div>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <a-tooltip>
                                        <template #title>
                                            {{ item.templateContent }}
                                        </template>
                                        <div>{{ item.templateContent }}</div>
                                    </a-tooltip>
                                </td>
                                <td>
                                    <div class="operateWrap">
                                        <span @click="checkTmp(item)">{{ t('common.check') }}</span>
                                        <span v-if="item.exampleData" @click="reviewParseRes(item)">{{ t('templateManage.reviewParseRes') }}</span>
                                        <!-- 系统模板不能删除、重命名 -->
                                        <template v-if="item.groupId !== SYSTEM_TEMPLATE_ID">
                                            <span @click="editHandle(item)">{{ t('common.edit') }}</span>
                                            <span @click="removeHandle(item)">{{ t('common.delete') }}</span>
                                        </template>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </table>
                </template>
            </div>
        </a-spin>
        <div class="noData" v-if="!tmplGroupList.length && !templateList.length">
            <img src="@/assets/images/img_null.png" alt="" />
            <p>{{ (accessConfig.tmplMgrAuth && accessConfig.tmplMgrAuth.read == 0) ? t('common.noAuth') : t('common.noData') }}</p>
        </div>
        <templateModal
            :editData="state.editData"
            :operFlag="state.operFlag"
            :tmplPage="tmplPage"
            v-if="templateModalVisible" 
            />
        <deleteModal ref="deleteModalRef" @confirmRemoveHandle="confirmRemoveHandle" />
        <reviewModal v-if="state.showReviewModal" @hideModal="state.showReviewModal=false" :record="state.reviewTempInfo"/>
    </div>
</template>

<script setup>
import * as _ from 'lodash'
import { message } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { modalStore } from '@/Stores/modalStore';
import { deleteTemplate, deleteTmplGroup, editTmplGroup } from '@/apis/templateManage';
import { storeToRefs } from 'pinia';
import { useRouter  } from 'vue-router'
import { apiManageStore } from '@/Stores/apiManageStore'
import { mainStore } from '@/Stores/mainStore'
import templateModal from '../components/templateModal'
import reviewModal from '../components/templateModal/reviewResModal.vue'
import myButton from '@/components/buttons/myButton.vue';
import deleteModal from '../components/deleteModal.vue';
import { useI18n } from 'vue-i18n';
import okImg from '@/assets/icons/sureEdit.png'
import cancelImg from '@/assets/icons/cancelEdit.png'

const { t } = useI18n()

const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const useModalStore = modalStore()
const { templateModalVisible } = storeToRefs(useModalStore)
const { templateList,  templatePageNumber, apiPageId, tmplGroupList, tmpListLoading, tmpGroupPageNum, tmpGroupLoadEnd, resetTempWrapperScroll } = storeToRefs(useApiManageStore)
const { accessConfig } = storeToRefs(useMainStore)

const SYSTEM_TEMPLATE_ID = '9000000000000000000'   // 系统模板id

const state = reactive({
    tableData: [],
    deleteData: {},
    editData: {},
    operFlag: 'add',
    authApiInfo: {},
    renameGroupInfo: {  // 重命名分组
        id: -1,
        name: ''
    },
    showReviewModal: false,
    reviewTempInfo: {},     // 预览解析结果模板
})

let deleteModalRef = ref()

const renameInputRef = shallowRef(null)

const searchValue = ref('')

const tmplPage = ref('index') // index 首页 group 分组页面

const tmpGroupName = ref('')

const wrapperRef = shallowRef(null)

const inputLock = ref(false)

const editHandle = (item) => {
    state.editData = item
    state.operFlag = 'edit'
    useModalStore.changeTemplateModalVisible()
}

const checkTmplList = (record) => {
    tmplPage.value = 'group'
    tmpGroupName.value = record.groupName
    useApiManageStore.setTmplGroupId(record.id)
    useApiManageStore.initTemplateList()
}

const renameTmpList = async (record) => {
    state.renameGroupInfo = {
        id: record.id,
        name: record.groupName,
        version: record.version
    }
    await nextTick()
    renameInputRef.value[0].select()
}

const renameGroup = (type, item) => {
    if(type === 'ok') {
        let renameGroupInfo = state.renameGroupInfo
        editTmplGroup({
            id: renameGroupInfo.id,
            groupName: renameGroupInfo.name,
            version: renameGroupInfo.version
        }).then((res) => {
            if(res.code === 1) {
                useApiManageStore.setTempGroupName(item.id, renameGroupInfo.name)
                message.success(res.message)
            } else {
                message.error(res.message)
            }
        })
    }
    state.renameGroupInfo = {
        id: -1,
        name: ''
    }
}

const checkTmp = (record) => {
    state.editData = record
    state.operFlag = 'check'
    useModalStore.changeTemplateModalVisible()
}

const reviewParseRes = (record) => {
    state.showReviewModal = true
    state.reviewTempInfo = record
}

const onSearch = () => {
    !inputLock.value &&
    useApiManageStore.initTemplateList(searchValue.value)
}

const onCompositionstart = () => {
    inputLock.value = true
}

const onCompositionend = () => {
    inputLock.value = false
    onSearch()
}

// 滚动加载
const handleScroll = _.throttle(() => {
    let _ref = wrapperRef.value
    // 重置顶部滚动距离 
    if(resetTempWrapperScroll.value) {
        _ref.scrollTop = 0
        useApiManageStore.setResetTempWrapperScroll(false)
        return
    }
    let {scrollHeight, scrollTop, clientHeight} = _ref
    if(scrollHeight - scrollTop <= clientHeight + 10) {
        // 首页根目录加载分组数据
        if(tmplPage.value === 'index' && !tmpGroupLoadEnd.value && !searchValue.value) {
            useApiManageStore.setTmpGroupPageNum(tmpGroupPageNum.value+1)
            useApiManageStore.getTmpGroupList()
        } else {
            // 首页: 分页loading从1开始 
            if(tmplPage.value === 'index' && tmpGroupPageNum.value > 1) {
                useApiManageStore.getTempList()
                useApiManageStore.setTemplatePageNumber(templatePageNumber.value+1)
            } else {    // 分组/搜索页面: 分页loading从2开始
                useApiManageStore.setTemplatePageNumber(templatePageNumber.value+1)
                useApiManageStore.getTempList(searchValue.value)
            }
        }
    }
}, 200)

const goBack = () => {
    tmplPage.value = 'index'
    useApiManageStore.setTmplGroupId('')
    useApiManageStore.initTemplateList()
}

const showModal = () => {
    permissionValidate(() => {
        state.operFlag = 'add'
        useModalStore.changeTemplateModalVisible()
    })
}

const removeHandle = (item) => {
    permissionValidate(() => {
        deleteModalRef.value.modalVisible = true
        state.deleteData = item
    })
}
// 确认删除回调
const confirmRemoveHandle = async () => {
    // 删除模板
    let deleteTmp = 'templateName' in state.deleteData

    let res = deleteTmp ? 
        await deleteTemplate({ids: state.deleteData.id}):
        await deleteTmplGroup({ids: state.deleteData.id})

    if (res.code == 1) {
        useApiManageStore.initTemplateList()
        message.success(res.message)
    } else {
        message.error(res.message)
    }
    state.deleteData = {}
}

// 权限判断
const permissionValidate = (cb) => {
    if(accessConfig.value.tmplMgrAuth?.use == 0) {
        return message.error(t('common.noAuth'))
    }
    cb()
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
    .my_title{
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 20px;
    }
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
        .backbox {
            height: 20px;
            width: max-content;
            display: flex;
            align-items: center;
            color: #2B67FF;
            font-size: 14px;
            img {
                width: 16px;
                height: 16px;
                margin-right: 4px;
            }
        }
        .backbox:hover {
            cursor: pointer;
        }
        .search {
            width: 208px;
            height: 32px;
            position: relative;

            input {
                width: 100%;
                height: 30px;
            }

            .sear {
                width: 16px;
                position: absolute;
                top: 50%;
                right: 10px;
                cursor: pointer;
                transform: translateY(-50%);
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

    .groupTop{
        border-bottom: 1px solid #F0F0F0;
        margin-bottom: 20px;
        padding: 8px;
    }
    .groupName{
        font-size: 18px;
        font-weight: 600;
        line-height: 25px;
        margin-bottom: 16px;
    }
    .ant-spin-nested-loading{
        height: calc(100% - var(--hightOffset));
    }
    /deep/ .ant-spin-container{
        height: 100%;
    }
    .tableWrapper {
        position: relative;
        height: 100%;
        overflow: auto;
        .tableContainer {
            width: 100%;
            td {
                height: 40px;
                max-height: 56px;
                border: 1px solid #e0ebff;
                padding: 10px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                & > div {
                    max-height: 56px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    word-break: break-all;
                }
                .operateWrap{
                    white-space: nowrap;
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
            .renameContainer{
                img{
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                }
            }
            .group {
                display: flex;
                align-items: center;
            }
            .folder {
                width: 16px;
                height: 16px;
                margin-right: 4px;
            }
        }
        .bottomLoading{
            margin-left: 50%;
            margin-top: -35px;
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
