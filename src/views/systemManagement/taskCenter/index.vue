<template>
    <div class="manageWrapper">
        <div class="topContainer">
            <div class="basic-tabs" @click="basicTabsChange">
                <div :class="[taskSearchType === 0 ? 'tab-is-active' : '']" id="tab-a">{{ t('task.currentTask') }}</div>
                <div :class="[taskSearchType === 1 ? 'tab-is-active' : '']" id="tab-b">{{ t('task.hsitoryTask') }}<div v-if="taskCountObj.historyCount != 0" class="circle">{{ taskCountObj.historyCount }}</div></div>
            </div>
            <div class="right-option" v-show="taskSearchType === 1">
                <img @click="changeCheck(0)" v-if="taskHistoryDiff === 1" src="@/assets/icons/not_select.png" alt="">
                <img @click="changeCheck(1)" v-else src="@/assets/icons/is_select.png" alt="">
                {{ t('task.checkMine') }}
            </div>
        </div>
        <!-- 历史任务展示搜索框 -->
        <div class="search" v-show="taskSearchType === 1">
            <input type="text" 
            :value="taskCenterSearchKw" 
            @input="searchKwInput($event)" 
            @compositionstart="compositionStartFn"
            @compositionend="compositionEndFn($event)"
            :placeholder="t('common.search')"
            >
            <img class="sear" src="@/assets/icons/search.png" alt="">
        </div>
        <div class="current-tip" v-show="taskSearchType === 0 && taskList.length && !taskCenterLoading">
            {{ t('task.isUpdating') }}<span class="blue">{{ taskCountObj.updatingCount }}</span>,{{ t('task.waitUpdate') }}<span class="yellow">{{ taskCountObj.waitingCount }}</span>
        </div>
        <div class="tableWrapper" v-if="!taskCenterLoading">
            <table class="tableContainer" v-show="taskSearchType === 0">
                <tr>
                    <td>{{ t('task.taskName') }}</td>
                    <td>{{ t('task.taskType') }}</td>
                    <td>{{ t('apiManage.operationPerson') }}</td>
                    <td>{{ t('excel.size') }}</td>
                    <td>{{ t('task.taskBeginTime') }}</td>
                    <td>{{ t('excel.status') }}</td>
                    <td>{{ t('common.operation') }}</td>
                </tr>
                <tr v-for="item in taskList" :key="item.id">
                    <td>
                        <div :title="item.taskName">{{ item.taskName }}</div>
                    </td>
                    <td>
                        <div>{{ t(returnTaskType(item.taskType)) }}</div>
                    </td>
                    <td>
                        <div>{{ item.fnames }}</div>
                    </td>
                    <td>
                        <div>{{ getFileSize(Number(item.dataAmount)) }}</div>
                    </td>
                    <td>
                        <div>{{ formatTimeToSecond(item.createTime) }}</div>
                    </td> 
                    <td>
                        <div :title="t(returnTaskStatus(item))">{{ t(returnTaskStatus(item)) }}</div>
                    </td>
                    <td>
                        <div><span :class="{disable: item.disalbed || !canDelete(item)}" @click="deleteItem(item)">{{ t('common.delete') }}</span></div>
                    </td>
                </tr>
            </table>
            <table class="tableContainer" v-show="taskSearchType === 1">
                <tr>
                    <td style="width: 18.6%;">{{ t('task.taskName') }}</td>
                    <td style="width: 10%;" class="taskTypeWrap">
                        <!-- 历史任务展示搜索类型列表 -->
                        <a-dropdown>
                            <div>{{ t('task.taskType') }}</div>
                            <template #overlay>
                                <div class="taskTypList">
                                    <template v-for="(item, index) in tasks">
                                        <div 
                                            v-if="!index"
                                            @click="changeSearchTaskType('')"
                                            :class="{
                                                typeItem: true, 
                                                allType: true, 
                                                selectItem: searchTaskType === ''
                                            }"
                                        >全部类型</div>
                                        <div 
                                            @click="changeSearchTaskType(item.value)" 
                                            :class="{typeItem: true, selectItem: searchTaskType === item.value}"
                                        >{{ t(item.label) }}</div>
                                    </template>
                                </div>
                            </template>
                        </a-dropdown>
                    </td>
                    <td style="width: 7%;">{{ t('apiManage.operationPerson') }}</td>
                    <td style="width: 7%;">{{ t('excel.size') }}</td>
                    <td style="width: 10%;">{{ t('task.dataCount') }}</td>
                    <td style="width: 10%;">{{ t('task.taskBeginTime') }}</td>
                    <td style="width: 10%;">{{ t('task.taskEndTime') }}</td>
                    <td style="width: 18.6%;">{{ t('task.taskResult') }}</td>
                    <td style="width: 18.6%;">{{ t('task.failureReason') }}</td>
                </tr>
                <tr v-for="item in taskList" :key="item.id">
                    <td style="width: 18.6%;">
                         <div :title="item.taskName">{{ item.taskName }}</div>
                    </td>
                    <td style="width: 10%;">
                        <div>{{ t(returnTaskType(item.taskType)) }}</div>
                    </td>
                    <td style="width: 7%;">
                        <div>{{ item.fnames }}</div>
                    </td>
                    <td style="width: 7%;">
                        <div>{{ getFileSize(Number(item.dataAmount)) }}</div>
                    </td>
                    <td style="width: 10%;">
                            <div>
                                {{ returnTaskText(item) }}
                            </div>
                    </td>
                    <td style="width: 10%;">
                        <div>{{ formatTimeToSecond(item.createTime) }}</div>
                    </td> 
                    <td style="width: 10% ;">
                        <div>{{ formatTimeToSecond(item.updateTime) }}</div>
                    </td>
                    <td style="width: 18.6%;">
                        <div 
                            :style="{ color: returnTaskResults(item).type == 1 ? 'rgba(0, 0, 0, 0.8)' : (
                                returnTaskResults(item).type == 2 ? '#00B42A' : '#F53F3F'
                            ) }"
                        >
                            <div style="display: flex; align-items: center;">
                                <span>{{ returnTaskResults(item).text }} </span>
                                <img class="download" @click="exportData(item)" v-if="item.download" src="@/assets/icons/download.png">
                            </div>
                        </div>
                    </td>
                    <td style="width: 18.6%;">
                        <div v-if="item.taskError">
                            <span v-if="item.taskType=== 12 && item.taskState === 4" @click="showCheckErrorModal(item)">{{ t('common.check')}}</span>
                            <div v-else :title="(item.taskState === 4  && item.taskType!== 12 && item.taskError) || '-'">{{ (item.taskState === 4  && item.taskType!== 12 && item.taskError) || '-' }}</div>
                        </div>
                        <div v-else>-</div>
                    </td>
                </tr>
            </table>
        </div>
        <a-spin :spinning="taskCenterLoading">
        </a-spin>
        <div class="noData" v-if="!taskList.length && !taskCenterLoading">
            <img src="@/assets/images/img_null.png" alt="" />
            <p>{{ t('common.noData') }}</p>
        </div>
        <div class="page" v-if="taskDataTotal > 12">
            <a-pagination 
                v-model:current="taskPageNumber" 
                :total="taskDataTotal"
                :pageSize="12"
                show-less-items 
                @change="pageChange"
            />
        </div>
        <StandardCheckErrorModal v-if="checkErrorModal" :sourceObj="sourceObj" @onCancel="onCancel" />
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { removeHistoryDot, removeIndexDot, 
    stopTask, deleteTask, deleteTaskRecord, getDownloadUrl, exportSmallTable, exportMirror } from '@/apis/task';
import { apiManageStore } from '@/Stores/apiManageStore'
import StandardCheckErrorModal from '@/views/systemManagement/components/standardCheckErrorModal/index.vue'
import { mainStore } from '@/Stores/mainStore';
import { useI18n } from 'vue-i18n';
import { formatTimeToSecond, getFileSize, hrefClickDownload } from '@/utils/utils'
import dayjs from 'dayjs';
import {debounce} from 'loadsh'

const { t } = useI18n()

const useApiManageStore = apiManageStore()
const useMainStore = mainStore()
const { taskList, taskDataTotal, taskPageNumber, taskSearchType, taskCountObj, 
        taskHistoryDiff, taskCenterLoading, taskCenterSearchKw, searchTaskType } = storeToRefs(useApiManageStore)
const { systemConfig } = storeToRefs(useMainStore)

// 输入中文 锁定输入框
const searchInputLock = ref(false)
const checkErrorModal = ref(false)
const sourceObj = ref()

const tasks = [
    {label: 'common.excelImport',value: 0},
    {label: 'common.apiImport',value: 1},
    {label: 'task.fromDb',value: 2},
    {label: 'task.fromForm',value: 3},
    {label: 'common.sqlImport',value: 4},
    {label: 'common.excelExport',value: 5},
    {label: 'common.apiExport',value: 6},
    {label: 'common.dbExport',value: 7},
    {label: 'common.formExport',value: 8},
    {label: 'common.sqlExport',value: 9},
    {label: 'common.selfProvisionExport',value: 10},
    //{label: 'kafka导入',value: 11}, kafka不在任务中心列表,不需要展示
    {label: 'dataStandard.dataStandardCheck', value: 12},
]

const returnTaskType = (type) => {
    const taskObj = tasks.find((item)=> item.value === type)
    return taskObj ? taskObj.label : tasks[0]['label']
}

const returnTaskStatus = (record) => {
    const state = ['task.waitImport', 'task.importing', 'task.importStop', 'task.importSuccess', 'task.importError']
    const state1 = ['task.waitExport', 'task.exporting', 'task.exportStop', 'task.exportSuccess', 'task.exportError']
    const state2 = ['task.waitCheck', 'task.checking', 'task.checkStop', 'task.checkSuccess', 'task.checkError' ]
    // 导入操作
    if(record.taskType <= 4){
        return state[record.taskState]
    // 导出操作
    }else if(record.taskType > 4 && record.taskType <= 10){
        return state1[record.taskState]
    // 校验操作
    } else if(record.taskType === 12){
        return state2[record.taskState]
    }
}

const returnTaskResults = (record) => {
    switch (record.taskState) {
        // 成功状态
        case 3:
            if (record.taskResults) {
                return { text: record.taskResults, type: 1 };
            } else {
                let text = returnTaskStatus(record)
                return {
                    text: t(text),
                    type: 2
                };
            }
        // 失败状态
        case 4:
                let text = returnTaskStatus(record)
                return {
                    text: t(text),
                    type: 3
                };
            // }
        // 默认返回
        default:
            return {
                text: t('common.blankLine'),
                type: 1
            };
    }
}
const returnTaskText = (record) => {
  let dataCount = record.dataCount || 0;
  if (record.taskState == 3) {
    // 导入操作
    if(record.taskType <= 4){
        return t('common.import')+dataCount
    // 导出操作
    }else if(record.taskType > 4 && record.taskType <= 10){
        return t('common.export')+dataCount;
    // 校验操作
    } else if(record.taskType === 12){
        return t('common.verify')+dataCount;
    }
  } else {
    return t('common.blankLine');
  }
}
const basicTabsChange = async e => {
    const tabId = e.target.id
    taskPageNumber.value = 1
    if (tabId === 'tab-a') {
        useApiManageStore.setTaskSearchType(0)
    } else if (tabId === 'tab-b') {
        useApiManageStore.setTaskSearchType(1)
        if (taskCountObj.value.historyCount != 0) {
            await removeHistoryDot()
            await removeIndexDot()
            await useApiManageStore.initRedDot()
            useApiManageStore.setTaskListInterval('history')
        }
    }
    useApiManageStore.setTaskCenterSearchKw('')
    useApiManageStore.setSearchTaskType('')

    // await nextTick()
    useApiManageStore.initTaskList('change')
}

const changeCheck = (type) => {
    taskPageNumber.value = 1
    useApiManageStore.setTaskHistoryDiff(type)
    useApiManageStore.initTaskList()
}

const pageChange = () => {
    useApiManageStore.initTaskList(taskSearchType.value)
}

// 1 暂停 2 取消 3 重试
const handleTask = (type, record) => {
    const params = {
        jobId: record.objId,
        id: record.id
    }
    if (type === 1) {
        stopTask(params).then(res => {
            if (res.code === 1) {
                message.success(res.message)
            } else {
                message.error(res.message)
            }
        })
    } else if (type === 2) {
        deleteTask(params).then(res => {
            if (res.code === 1) {
                message.success(res.message)
            } else {
                message.error(res.message)
            }
        })
    } else if (type === 3) {

    }
}

// 导出小表
const exportTableFn = async (record, mirror = false) => {
    try {
        const link = document.createElement('a')
        const exportRes = mirror ? await exportMirror(record.id) : await exportSmallTable({id: record.tableId})
        const blob = new Blob([exportRes])
        const downloadUrl = window.URL.createObjectURL(blob)
        link.href = downloadUrl
        link.download = record.taskName + '.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch(e) {
        console.log('export small table error', e)
    }
}

const exportData = async (record) => {
    // 镜像环境
    if(systemConfig.value.mirror) {
        exportTableFn(record, true)
        return
    }

    if (!record.downloadAddress) { // 无下载地址
        exportTableFn(record, false)
        return
    }

    if (record.downloadAddress) {   // 含有下载地址
        try {
            let downloadRes = await getDownloadUrl({
                objectId: JSON.parse(record.downloadAddress).objectid
            })
            if (downloadRes.code == 1) {
                hrefClickDownload(
                    location.protocol + '//' + downloadRes.data.download.split('://')[1], 
                    record.taskName
                )
            }
        } catch(e) {
            console.log('export error', e)
        }
    }
}

const searchKwInput = (e) => {
    if(searchInputLock.value) return
    taskPageNumber.value = 1
    useApiManageStore.setTaskCenterSearchKw(e.target.value.trim())
    useApiManageStore.initTaskList('change')
}

const changeSearchTaskType = (typeIndex) => {
    taskPageNumber.value = 1
    useApiManageStore.setSearchTaskType(typeIndex)
    useApiManageStore.initTaskList('change')
}

const compositionStartFn = () => {
    searchInputLock.value = true
}
const compositionEndFn = (e) => {
    searchInputLock.value = false
    searchKwInput(e)
}

const showCheckErrorModal = (item) => {
    checkErrorModal.value = true
    sourceObj.value = item
}

const onCancel = ()=>{
    checkErrorModal.value = false
}

const deleteItem = debounce((item) => {
    // 删除中的禁止删除 当天的任务禁止删除
    if(item.disalbed || !canDelete(item)) {
        return
    }

    item.disalbed = true
    
    deleteTaskRecord(item.id).then(res => {
        if(res.code !== 1) {
            message.error(res.message)
        } else {
            message.success(res.message)
        }
        item.disalbed = false
    })
}, 300, {
    leading: true,
    trailing: false,
})

const canDelete = (item) => {
    // 当天的任务，删除按钮置灰
    return new Date(dayjs().format('YYYY MM-DD')) > item.createTime
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
        position: relative;
        .basic-tabs {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 3px;
            width: fit-content;
            height: 36px;
            background: #F3F3F3;
            border-radius: 8px;
            & > div {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding: 0px 12px;
                isolation: isolate;
                height: 30px;
                border-radius: 6px;
                flex: none;
                order: 1;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.4);
                transition: background 0.6s cubic-bezier(0.075, .82, .165, 1);
            }
            .circle {
                min-width: 16px;
                height: 16px;
                text-align: center;
                border-radius: 10px;
                padding: 0 6px;
                background: #F53F3F;
                line-height: 16px;
                font-size: 12px;
                color: #FFF;
                margin-left: 6px;
                white-space: nowrap;
            }
            .tab-is-active {
                background: #FFFFFF;
                box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
                border-radius: 6px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
            }
        }
        .right-option {
            position: absolute;
            right: 15px;
            top: 0;
            height: 100%;
            display: flex;
            align-items: center;
            img {
                width: 16px;
                margin-right: 6px;
            }
        }
    }
    .search {
        width: 210px;
        height: 30px;
        position: relative;
        margin-bottom: 16px;
        input {
            width: 208px;
            height: 30px;
            padding-right: 33px;
        }
        .sear {
            width: 16px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 13px;
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
    .current-tip {
        margin-bottom: 12px;
        color: rgba(0, 0, 0, 0.6);
        text-align: left;
        .blue {
            color: #2B67FF;
            font-weight: 600;
            margin: 0 4px;
        }
        .yellow {
            font-weight: 600;
            color: #FF7D00;
            margin: 0 4px;
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
                        &.disable{
                            opacity: .4;
                            cursor: default;
                        }
                    }
                    .download {
                        width: 14px;
                        height: 14px;
                        margin-left: 5px;
                        margin-top: -3px;
                        cursor: pointer;
                    }
                }
                &.taskTypeWrap{
                    &>div{
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        cursor: pointer;
                        &::after{
                            content: '';
                            display: inline-block;
                            width: 10px;
                            height: 10px;
                            background: url(@/assets/icons/down-arraw-icon.png) center/cover;
                        }
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
        top: 40%;
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

.taskTypList{
    width: 128px;
    height: 420px;
    overflow-y: auto;
    box-shadow: 0px 6px 24px 0px rgba(31, 35, 41, 0.10);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid #F0F0F0;
    border-radius: 4px;
    scrollbar-width: none;
    background-color: #fff;
    .typeItem{
        width: 100%;
        padding: 10px 14px;
        cursor: pointer;
        &.selectItem{
            color: #2B67FF;
            font-weight: 500;
        }
        &:nth-child(odd) {
            border-bottom: 1px solid #F0F0F0;
        }
        &:hover{
            background-color: #F2F3F5;
        }
    }
    .allType{
        padding: 14px 12px;
    }
    &::-webkit-scrollbar{
        width: 0;
    }
}
</style>
