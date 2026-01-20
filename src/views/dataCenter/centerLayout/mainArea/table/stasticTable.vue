<template>
    <a-spin :spinning="indexTableLoading">
        <div class="table-area">
            <div class="headTitle" v-if="Object.keys(indexTableDesc).length > 0">
                <div class="leftBox">
                    <div>
                        <a-tooltip placement="topLeft" v-if="isError" :title="t('bloodRelation.tablePreviewError')" color="#F53F3F">
                            <span class="title errorText"> {{ indexTableDesc.tableAlias }}</span>
                        </a-tooltip>
                        <span class="title" v-else> {{ indexTableDesc.tableAlias }}</span>
                        <a-tooltip
                            v-if="iconStatus!==0"
                            :visible="standardTooltipVisible" 
                            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                            @mouseenter="standardTooltipVisible=true"
                            @mouseleave="standardTooltipVisible=false"
                            placement="topLeft" 
                            :title="indexTableDesc.standardTablePath"
                        >
                            <span class="standard" :class="{without: iconStatus==2}" >{{ t('indexPage.standard') }}</span>
                        </a-tooltip>
                        <span class="safety" v-if="indexTableDesc.desensitized">{{ t('indexPage.desensitized') }}</span>
                        <span @click="editTable" :class="{ 'operate-btn':true , 'disable-opearte': isEmptyTable }"><img src="@/assets/icons/edit1.png" /> {{ t('common.edit')}}</span>
                        <span @click="exportData" :class="{ 'operate-btn':true , 'disable-opearte': disabledExport }"><img :src="exportImg" /> {{ t('common.export')}}</span>
                        <span @click="filterHanlder" :class="{ 'operate-btn':true , 'disable-opearte': isEmptyTable }"><img src="@/assets/icons/filter.png" /> {{ t('selfConfig.filter')}}</span>
                        <span @click="viewBloodRelation" class="operate-btn">
                            <img src="@/assets/icons/blood_analyze.png">
                            {{ t('indexPage.bloodRelationAnalysis') }}
                        </span>
                        <span @click="showDataDictionary" class="operate-btn">
                            <img src="@/assets/icons/data_dictionary.png">
                            {{ t('indexPage.dataDictionary') }}
                        </span>
                        <!-- 数据标准 -->
                        <span @click="showDataStandard" :class="{ 'operate-btn':true , 'disable-opearte': isEmptyTable }">
                            <img src="@/assets/icons/data_standard.png">
                            {{ t('dataStandard.dataStandard') }}
                        </span>
                    </div>
                    <div class="subTitle">{{ indexTableDesc.description || '-' }}</div>
                    <div class="subTitle tableInfo">
                        <span>{{ t('indexPage.founder') }}:&nbsp;{{ indexTableDesc.createrName || '-' }}</span>
                        <span class="speartor"></span>
                        <span>{{ t('common.total') }} {{ tableTotalNum || '-' }} {{ t('common.size') }}</span>
                        <span class="tableSize">{{ getFileSize(indexTableDesc.tableSize) }}</span>
                        <span class="speartor"></span>
                        <template v-if="updateStatus?.updateTime">
                            <span>{{ t('indexPage.updateTime') }}:&nbsp;{{ formatTime(parseInt(updateStatus?.updateTime)) }}</span>
                            <span class="speartor"></span>
                        </template>                        
                        <template v-if="updateStatus">
                            <span>{{ updateStatus.status == 0 ? t('indexPage.updateError') +
                                ':' + updateStatus.failedReason : t('indexPage.updateSuccess') }}</span>
                            <span class="speartor"></span>
                        </template>
                        <a-tooltip placement="topRight" :title="updatePolicyTooltip()">
                            <span :class="{paused: updateStatusPaused}">{{ t('common.updatePolicy') }}:&nbsp;{{ getUpdatePolicy() }}</span>
                            <span v-if="indexTableDesc.parseUpdateParams && showUpdateRate && updateRateParam">，{{ updateRateParam }}</span>
                        </a-tooltip>
                        <span class="speartor"></span>
                        <template v-if="indexTableDesc.hasBeConnected != -1">
                            <span>{{ t('indexPage.hasBeConnected') }}:&nbsp;{{ indexTableDesc.hasBeConnected ? t('indexPage.beConnected'):t('indexPage.notConnect') }}</span>
                            <span class="speartor"></span>
                        </template>
                        <template v-if="indexTableStandardCheckTime.length > 0">
                            <span>{{ t('common.standardCheckTime')+':'+(indexTableStandardCheckTime?formatTime(indexTableStandardCheckTime):'')}}</span>
                            <span v-if="iconStatus!==0" class="standardStatus" :class="{without: iconStatus==2}">
                                {{ iconStatus==2 ? t('common.fail') : t('common.success') }}
                            </span>
                            <span class="speartor"></span>
                        </template>
                        <span :class="{updateRecord: true, error: isError}" @click="showUpdateRecord">
                            <BiIcon name="time" class="timeIconActive"></BiIcon>
                            <span>{{ t('indexPage.updateRecord') }}</span>
                        </span>
                    </div>
                </div>
                <div class="rightBox">
                    <!-- excel 追加、替换 -->
                    <myButton v-if="indexTableDesc.tableType.value === 2" style="margin-left: 24px;"
                        @click="changeExcelData(1)">{{ t('indexPage.replaceData') }}</myButton>
                    <myButton v-if="indexTableDesc.tableType.value === 2" style="margin-left: 24px;"
                        @click="changeExcelData(2)">{{ t('indexPage.addData') }}</myButton>
                    <myButton v-if="indexTableDesc.tableType.value === 5" style="margin-left: 24px;"
                        @click="changeSqlData(1)">{{ t('indexPage.replaceData') }}</myButton>
                    <myButton v-if="indexTableDesc.tableType.value === 5" style="margin-left: 24px;"
                        @click="changeSqlData(2)">{{ t('indexPage.addData') }}</myButton>
                    
                    <!-- 表状态: 更新中 显示刷新按钮 -->
                    <myButton v-if="indexTableDesc.tableStatus.value === 3" style="margin-left: 24px;"
                        @click="refreshFn">{{ t('indexPage.refresh') }}</myButton>
                    <myButton v-else-if="showUpdateNow" class="blank-import"  style="margin-left: 24px;" @click="updateFn">{{
                        t('common.updateNow') }}</myButton>
                    <!-- 标准表： 修改  -->
                    <myButton class="blank-importStandard" v-if="!indexTableDesc.tableType.value && indexTableDesc.standardId"
                        @click="editStandard()">{{ t('indexPage.updateStandard') }}</myButton>

                    <!-- 空表tableType为0 仅空表展示导入数据和导入标准按钮 -->
                    <myButton class="blank-importStandard" v-if="!indexTableDesc.tableType.value && !indexTableDesc.standardId" @click="importStandard">{{ t('indexPage.importStandard') }}</myButton>
                    <myButton class="blank-import" v-if="!indexTableDesc.tableType.value" @mouseenter="onmouseenter"
                        @mouseleave="onmouseleave">{{ t('indexPage.importData') }}</myButton>
                    <transition name="fade">
                        <ul @mouseenter="onmouseenter" @mouseleave="onmouseleave" v-show="state.menuVisible"
                            class="selectMenu">
                            <li v-for="item in option" :key="item.id" @click="onAddTable(item)">
                                <img :src="item.src" alt="" />
                                {{ t(item.text) }}
                            </li>
                        </ul>
                    </transition>
                    <div class="subTitle pre-text">
                        {{ t('common.previewNumTip1') + currentPageSetting.displaySize + t('common.previewNumTip2')}}
                        <img v-if="tableTotalNum" @click="editPreviewNum" src="@/assets/icons/edit-gray.png"
                            alt="">
                    </div>
                </div>
            </div>
            <div class="tables" v-if="indexTableColumns.length && !tableColumnChangeLoading">
                <myTable :tableColumns="indexTableColumns" :tableData="indexTableData" :showHeadTooltip="true"/>
            </div>
            <!-- 空表 || 表单结构同步中 -->
            <div class="area-blank" v-if="!indexTableColumns.length || tableColumnChangeLoading">
                <div class="excelWrap" v-if="excelLoading">
                    <loadingIcon/>
                    <span>数据加载中，可前往 </span>
                    <span class="loadingText" @click="toTaskCenter">任务中心</span>
                    <span>查看进度，</span>
                    <span class="loadingText" @click="refreshFn">点击刷新</span>
                    <span>查看已加载数据</span>
                </div>
                <div class="tableChange" v-else-if="tableColumnChangeLoading">
                    <loadingIcon/>
                    <span>数据加载中，</span>
                    <span class="loadingText" @click="refreshFn">点击刷新</span>
                    <span>查看已加载数据</span>
                </div>
                <div class="empty-checkingTip" v-else-if="indexTableDesc.standardId">
                    <EmptyStandardTable />
                </div>
                <div class='box' v-else>
                    <img src='@/assets/images/img_null.png' alt="" />
                    <div class='blank-text'>{{ t('common.noData') }}</div>
                </div>
            </div>
            <!-- 数据对比校验提示 -->
            <div class="check-tips" v-if="showTableCheckingTips">
                <div class="done" v-if="hasStandradChecked">
                    <img class="img" src="@/assets/icons/success.png" alt="">
                    <span>数据校验已完成，可前往 </span>
                    <span class="loadingText" @click="toTaskCenter">任务中心</span>
                    <span>查看校验结果</span>
                </div>
                <div class="checking" v-if="[1, 2].includes(indexTableDesc.dataCheckTaskStatus)">
                    <loadingIcon/>
                    <span>数据校验中，可前往 </span>
                    <span class="loadingText" @click="toTaskCenter">任务中心</span>
                    <span>查看校验进度</span>
                </div>
            </div>
            <div class="preview-box" v-if="indexTableDesc.id">
                <div class="table-size">
                    {{ t('indexPage.beforeDisplay') }}<span class="detail-number">{{ currentPageSetting.displaySize
                    }}</span>{{ t('indexPage.dataSize') }}，
                    {{ t('indexPage.total') }}<span class="detail-number">{{ tableTotalNum }}</span>{{
                        t('indexPage.dataSize') }}
                </div>
                <div class="jump-page" v-if="totalPageNumber !== 1">
                    <input v-model="currentPageSetting.pageNum" class="page-input" type="text"
                        @change="jumpChange">&nbsp;/&nbsp;{{ totalPageNumber }}
                    <div :class="[canPrve ? 'page-change prve' : 'prve-ban page-change prve']" @click="pageChange('minus')">
                    </div>
                    <div :class="[canNext ? 'page-change next' : 'next-ban page-change next']" @click="pageChange('add')">
                    </div>
                </div>
            </div>
            <myModal v-if="showModalTip"
                modalName="提示" 
                @onCancel="()=> showModalTip = false" 
                @onConfirm="()=> showModalTip = false" 
                :showCancel="false" 
                width="500px"
                okText="知道了" 
            >
                <template #modal-body>
                    <div class="delbox">
                        该数据表关联的标准已修改/删除，可重新进行数据校验
                    </div>
                </template>
            </myModal>
        </div>
    </a-spin>
</template>

<script setup>
import { mainStore } from '@/Stores/mainStore'
import { modalStore } from '@/Stores/modalStore'
import { configStore } from '@/Stores/configStore'
import { apiManageStore } from '@/Stores/apiManageStore'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { formatTime, getFileSize, parseUpdatePolicy, isNumber, fileExport } from '@/utils/utils'
import { storeToRefs } from 'pinia'
import { updateNow } from '@/apis/common'
import { readDataCheck } from '@/apis/dataStandard'
import { getEditAuth, getTableAuth } from '@/apis/authorityManage'
import * as _ from 'loadsh'
import myButton from '@/components/buttons/myButton.vue'
import myTable from '@/components/table'
import myModal from '@/components/myModal'
import img2 from '@/assets/icons/addtable2.png'
import img3 from '@/assets/icons/addtable3.png'
import exportImg from '@/assets/icons/download.png'
import sqlimg from '@/assets/icons/sql.png'
import databaseimg from '@/assets/icons/database.png'
import apiIcon from '@/assets/icons/api-icon.png'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import loadingIcon from '@/components/loadingIcon.vue'
import useToTaskCenter from '@/hooks/dataCenter/useToTaskCenter'
import createDialog from '@/utils/dialog'
import { getReularUpdateTips } from '@/utils/regularUpdate'
import useOpenPageCurrentTab from '@/hooks/dataCenter/useOpenPageCurrentTab'
import EmptyStandardTable from '@/views/dataCenter/centerLayout/mainArea/emptyStandardTable/index.vue'

const { t } = useI18n()
const useMainStore = mainStore()
const useModalStore = modalStore()
const useConfigStore = configStore()
const useApiManageStore = apiManageStore()
const useDataStandardStore = dataStandardStore()
const { dataCenterImportStandardDetail } = storeToRefs(useDataStandardStore)
const { indexTableData, indexTableColumns, indexTableDesc, indexTableLoading, standardTooltipVisible, activeTabKey, updateStatus, tablePages, tableTotalNum, 
    tableColumnChangeLoading,indexTableStandardCheckTime } = storeToRefs(useMainStore)
const option = [
    {
        id: '002',
        src: img2,
        text: 'common.formApplication',
    },
    {
        id: '003',
        src: img3,
        text: 'common.excelImport',
    },
    {
        id: '004',
        src: databaseimg,
        text: 'common.dbLibrary',
    },
    {
        id: '005',
        src: sqlimg,
        text: 'common.sqlImport',
    },
    {
        id: '007',
        src: apiIcon,
        text: 'common.apiImport'
    },
    // {
    //     id: '008',
    //     src: kafkaIcon,
    //     text: 'common.kafkaImport',
    // },
    // {
    //     id: '006',
    //     src: img4,
    //     text: 'common.selfProvision',
    // },
]
// 标准icon状态变量，0：不显示；1符合标准，显示紫色；2不符合标准，显示灰色
const iconStatus = computed(() => {
    let result;
    if(indexTableDesc.value.standardStatus == 3){
        result =  0
    }else if(indexTableDesc.value.standardStatus == 2){
        result =  2
    }else if(indexTableDesc.value.standardStatus == 1){
        result =  1
    }else if(indexTableDesc.value.standardStatus == 0){
        if(indexTableDesc.value.dataCheckTaskStatus == 3){
            result =  1
        }else if(indexTableDesc.value.dataCheckTaskStatus == 4){
            result =  2
        }else{
            result =  0
        }
    }    
    return result   
})

const state = reactive({
    menuVisible: false,
})
// 数据标准的红点
const showModalTip = ref(false)
// 数据标准的校验状态提示
const showTableCheckingTips = ref(false)
const openTargetPage = useOpenPageCurrentTab()


const showUpdateNow = computed(() => { // 1,3,4,6,7
    const v = indexTableDesc.value.tableType.value
    const arr = [1, 3, 4, 6, 7]
    if (arr.includes(v)) {
        return true
    }
    return false
})

const currentPageSetting = computed(() => {
    const data = tablePages.value.find(item => item.id === indexTableDesc.value.id)
    return data
})

const totalPageNumber = computed(() => {
    const number = currentPageSetting.value.displaySize / 100
    return number > 1 ? Math.ceil(number) : 1
})

const canPrve = computed(() => {
    return currentPageSetting.value.pageNum === 1 ? false : true
})

const canNext = computed(() => {
    return currentPageSetting.value.pageNum < totalPageNumber.value ? true : false
})

const statusMap = {
    normal: 1, 
    completed: 2, // 完成
    updating: 3, // 更新中
    error: 4 // 错误
}

const tableStatus = computed(() => {
    return indexTableDesc.value.tableStatus.value
})

const disabledExport = computed(() => {
    if(indexTableDesc.value.tableStatus.value === 1 || indexTableDesc.value.tableType.value === 0){
        return true
    }
    return false
})

// 当前表是否异常
const isError = computed(() => {
    return tableStatus.value === statusMap['error']
})


// 是否为空表
const isEmptyTable = computed(() => {
    return indexTableDesc.value?.tableType?.value === 0
})

const jumpChange = (e) => {
    const val = e.target.value
    if (!isNumber(val)) {
        currentPageSetting.value.pageNum = 1
    } else {
        if (val <= 0) {
            currentPageSetting.value.pageNum = 1
        } else if (val > totalPageNumber.value) {
            currentPageSetting.value.pageNum = totalPageNumber.value
        }
    }
    useMainStore.onlyGetPreviewData({
        id: indexTableDesc.value.id
    })
}

const pageChange = (type) => {
    if (type === 'minus') {
        if (canPrve.value && currentPageSetting.value.pageNum > 1) {
            currentPageSetting.value.pageNum--
        } else {
            return
        }
    } else {
        if (canNext.value && currentPageSetting.value.pageNum < totalPageNumber.value) {
            currentPageSetting.value.pageNum++
        } else {
            return
        }
    }
    useMainStore.onlyGetPreviewData({
        id: indexTableDesc.value.id
    })
}


const editPreviewNum = () => {
    useModalStore.changeSetPageSizeModalVisible()
}

// 导入数据配置鼠标事件 begin
const onmouseenter = () => {
    state.menuVisible = true
}
const onmouseleave = () => {
    state.menuVisible = false
}

const filterHanlder = () =>{
    useModalStore.changeFilterModalVisivle()
    useMainStore.setFileterTableInfo(indexTableDesc.value)
}
const exportData = _.debounce(
    async() =>{
        if(disabledExport.value) return
        message.warning(t('common.tableExporting'))
        let res = await fileExport({
            tableId: indexTableDesc.value?.id,
            tableType: indexTableDesc.value?.tableType?.value,
            dataNum: indexTableDesc.value?.dataNum,
            tableAlias: indexTableDesc.value?.tableAlias
        })
        if(res.code === 0) return
        if (indexTableDesc.value?.dataNum > 10000) {  // 大于10000条 任务中心下载
            message.success(t('common.taskBuildSuccess'))
        }
        useApiManageStore.initRedDot()
    }
,400)

// 编辑表
const editTable = async () => {
    let res = await getEditAuth(indexTableDesc.value.id)

    if (res.code == 1) {
        if (res.data) {
            return message.error(t('common.noAuth'))
        }

        if(indexTableDesc.value.tableType.value === 4) {  // 自助配置表编辑
            selfConfigEdit()
        } else {    // 非自助配置表编辑
            useMainStore.setEditTableType(indexTableDesc.value.tableType)
            useMainStore.setPageId('PageEditTable')
        }
    } else {
        message.error(res.message)
    }
}

const selfConfigEdit = async () => {
    useMainStore.updateAddDataMode('add')
    useConfigStore.updateConfigUniqueData(activeTabKey.value, 'push')
    useConfigStore.setTableSource(JSON.parse(indexTableDesc.value.tableSource).config, 'equal', activeTabKey.value)
    useConfigStore.setSelfEditData(indexTableDesc.value, activeTabKey.value)
    useMainStore.changeTabsList({}, 'change', activeTabKey.value)
    // 更新异常表异常信息
    useConfigStore.updateErrorConfigData(activeTabKey.value)
    useConfigStore.setHeaderInfo({
        tableName: indexTableDesc.value.tableAlias,
        desc: indexTableDesc.value.description || ''
    }, activeTabKey.value)
    const updateParams = indexTableDesc.value.updateParams ? JSON.parse(indexTableDesc.value.updateParams) : {
        updateRate: 1,
        updateUnit: 0
    }
    const updateInfo = {
        updateParams: {
            updateRate: updateParams.updateRate,
            updateUnit: updateParams.updateUnit,
            partUpdate: false,  // 部分更新默认关闭
            partUpdateColumn: undefined,
            partUpdateStartValue: '',
            partUpdateEndValue: ''
        }, // 更新参数
    }

    let updatePolicyValue = indexTableDesc.value.updatePolicy.value
    if(updatePolicyValue === 1) {
        updateInfo.updatePolicy = 'FULL_UPDATE'
        // 更新策略为全量更新且开启部分更新 回显部分更新数据
        if(indexTableDesc.value.parseUpdateParams.partUpdate) {
            updateInfo.updateParams.partUpdate = indexTableDesc.value.parseUpdateParams.partUpdate
            updateInfo.updateParams.partUpdateColumn = indexTableDesc.value.parseUpdateParams.partUpdateColumn ?? ''
            updateInfo.updateParams.partUpdateStartValue = indexTableDesc.value.parseUpdateParams.partUpdateStartValue ?? ''
            updateInfo.updateParams.partUpdateEndValue = indexTableDesc.value.parseUpdateParams.partUpdateEndValue ?? ''
        }
    } else if(updatePolicyValue === 6) {
        updateInfo.updatePolicy = 'CASCADE_UPDATE'
    } else {
        updateInfo.updatePolicy = 'NONE'
    }
    
    useConfigStore.changeUpdateInfo(updateInfo, activeTabKey.value)
    useMainStore.setPageId('pageConfig')
    useConfigStore.setSelfFlag('edit', activeTabKey.value)
}
const showDataDictionary = () => {
    getTableAuth(indexTableDesc.value.id).then(res => {
        if (res.code == 1) {
            if(res.message){
                const authInfo = JSON.parse(res.message)
                if(authInfo?.use){
                    openTargetPage('dataDictionary')
                }else{
                    message.error(t('common.noAuth'))
                }
            }else{
                message.error(t('common.noAuth'))
            }
        } else {
            message.error(res.message)
        }
    })

}
const viewBloodRelation = () => {
    openTargetPage('bloodRelation')
}

const onAddTable = (item) => {
    if(indexTableDesc.value.tableType.value === 9){
        useMainStore.setIsEmptyImport(false)
    } else {
        useMainStore.setIsEmptyImport(true)
    }
    // 新增数据方式改为导入
    useMainStore.updateAddDataMode('import')

    let type = t(item.text)
    switch (type) {
        case t('common.formApplication'):
            useMainStore.setPageId('pageForm')
            break
        case t('common.excelImport'):
            // useMainStore.setPageId('pageDB')
            useModalStore.changeUploadModalVisible()
            break
        case t('common.dbLibrary'):
            // useMainStore.setPageId('pageDB')
            // 显示添加数据库弹窗
            useModalStore.changeDBModalVisible()
            break
        case t('common.sqlImport'):
            useMainStore.setPageId('pageSql')
            break
        case t('common.selfProvision'):
            useMainStore.changeTabsList({}, 'change', activeTabKey.value)
            useConfigStore.updateConfigUniqueData(activeTabKey.value, 'push')
            useMainStore.setPageId('pageConfig')
            break
        case t('common.apiImport'):
            // 修改为页面
            useMainStore.setPageId('ApiPage')
            break
        case t('common.kafkaImport'):
            useModalStore.changeKafkaModalVisible()
            break
        default:
            break
    }
}

/**
 * type 1 替换数据；type 2 追加数据
 * @param {number} type 
 */
const changeExcelData = type => {
    if (type === 1) {
        useMainStore.updateAddDataMode('coverData')
    } else {
        useMainStore.updateAddDataMode('addData')
    }
    useModalStore.changeUploadModalVisible()
}

/**
 * type 1 替换数据；type 2 追加数据
 * @param {number} type 
 */
const changeSqlData = type => {
    if (type === 1) {
        useMainStore.updateAddDataMode('sqlCoverData')
    } else {
        useMainStore.updateAddDataMode('sqlAddData')
    }
    useMainStore.setPageId('pageSql')
}

// 展示更新记录
const showUpdateRecord = () => {
    openTargetPage('updateRecord')
}

const updateFn = () => {
    // API表: 增量接收推送 弹窗提示
    if(indexTableDesc.value.tableType.value === 7 && indexTableDesc.value.updatePolicy.value === 4) {
        createDialog({
            title: '提示',
            content: '立即更新会全量拉取一次接口源数据，保持中台数据与接口源一致，确定执行立即更新？',
            okText: '确定',
            cancelText: '取消',
        }).then(() => {
            updateTable()
        }).catch(() => {})
    } else {
        updateTable()
    }
}

// 立即更新
const updateTable = () => {
    const hide = message.loading(t('pushManage.updatIng'), 0)
    setTimeout(hide, 2000)
    updateNow({
        id: indexTableDesc.value.id
    }).then(res => {
        if (res.code == 1) {
            useMainStore.getIndexTable({
                id: indexTableDesc.value.id
            })
            hide()
            message.success(res.message)
        } else {
            hide()
            message.error(res.message)
        }
    })
}

// 更新策略
const getUpdatePolicy = () => {
    // 服务端处理逻辑
    // 删除数据源 => 更新策略会改为不更新 表状态改为 数据源被删除
    // 禁用数据源 => 更新策略不会改变 表状态改为 冻结状态

    // 数据源被禁止 表状态为冻结状态 更新策略展示为不更新
    if(indexTableDesc.value.tableStatus.value === 5) {
        return t('common.noUpdate')
    }
    return t(parseUpdatePolicy(indexTableDesc.value.updatePolicy.value))
}

// excel表无数据 且 状态为空表或导入中
const excelLoading = computed(() => {
    return !indexTableColumns.value.length &&                   // 无数据
           indexTableDesc.value?.tableType?.value === 2 &&      // excel表
          (indexTableDesc.value?.tableStatus?.value === 0 ||    // 空表
           indexTableDesc.value?.tableStatus?.value === 1)      // 导入中
})

const toTaskCenter = () => {
    useToTaskCenter()
}

const refreshFn = () => {
    useMainStore.getIndexTable({
        id: indexTableDesc.value?.id
    })
}

const timeExpression = computed(() => {
    return indexTableDesc.value?.parseUpdateParams?.timeExpression
})

// 更新频率
const updateRateParam = computed(() => {
    // 新增定时更新 优先获取cron表达式
    if(showUpdateRate.value && timeExpression.value) {
       return getReularUpdateTips(timeExpression.value, 'rate')
    }

    let updateRate = indexTableDesc.value?.parseUpdateParams?.updateRate
    if(!updateRate) return ''

    let updateUnit = indexTableDesc.value?.parseUpdateParams?.updateUnit
    if(updateUnit === 0) {
        return updateRate + '小时/次'
    } else if(updateUnit === 1) {
        return updateRate + '天/次'
    } else if(updateUnit === 2) {
        return updateRate + '分钟/次'
    }
})

// 更新策略是否为已暂停
const updateStatusPaused = computed(() => 
    indexTableDesc.value.updatePolicy.value === 8
)

// 展示更新频率
const showUpdateRate = computed(() => {
    return [1, 2, 5, 7].includes(indexTableDesc.value.updatePolicy.value)
})

// 数据标准校验完成
const hasStandradChecked = computed(() => {
    return [3, 4].includes(indexTableDesc.value.dataCheckTaskStatus)
})

const updatePolicyTooltip = () => {
    if(updateStatusPaused.value) {
        return '任务执行异常，请在更新记录内重启任务'
    }
    if(timeExpression.value) {
       return getReularUpdateTips(timeExpression.value, 'detail')
    }
    return ''
}

const importStandard = ()=>{
    useDataStandardStore.setImportStandardStatus(0)
    useMainStore.setPageId('standardPage')
}

const editStandard = async ()=>{
    useDataStandardStore.setImportStandardStatus(1)
    useDataStandardStore.updateImportStandardKey(indexTableDesc.value.standardId)
    await useDataStandardStore.getImportStandardTable(indexTableDesc.value.standardId)
    let outItem = { id: dataCenterImportStandardDetail.value.libId }
    let innerItem = { id: indexTableDesc.value.standardId }
    useDataStandardStore.selectLeftList({
        outItem,
        innerItem
    })
    useMainStore.setPageId('standardPage')
}

// 数据标准
const showDataStandard = async ()=> {
    // 校验结果的提示
    if(indexTableDesc.value.isRead === 0 && indexTableDesc.value.dataCheckTaskStatus){
        showTableCheckingTips.value = true
        // 校验完成后 结果需提示一次 根据表isRead字段判断
        hasStandradChecked.value &&
            readDataCheck({
                id: indexTableDesc.value.id,
                standardTableId: indexTableDesc.value.standardId
            }).then(res => {
                if(res.code != 1) {
                    message.error(res.message)
                    return
                }
                indexTableDesc.value.isRead = 1
            })

        setTimeout(()=>{
            showTableCheckingTips.value = false
        },4000)
        return
    }
    if(indexTableDesc.value.standardId){
        useDataStandardStore.setImportStandardStatus(1)
        useDataStandardStore.updateImportStandardKey(indexTableDesc.value.standardId)
        await useDataStandardStore.getImportStandardTable(indexTableDesc.value.standardId)
    }else{
        useDataStandardStore.setImportStandardStatus(0)
    }
    useMainStore.setPageId('standardCheck')
}
</script>
<style lang="less" scoped>
@errorColor: #F53F3F;

.ant-spin-nested-loading {
    height: 100%;
    :deep(.ant-spin-container){
        height: 100%;
    }
}

.table-area {
    width: calc(100vw - 425px);
    height: 100%;
    padding: 16px 16px 40px 16px;
    display: flex;
    flex-direction: column;
    position: relative;

    .fade-enter-from,
    .fade-enter-to {
        opacity: 0;
    }

    .fade-enter-to,
    .fade-enter-from {
        opacity: 1;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .tables {
        width: calc(100vw - 452px);
        overflow: auto;
        flex-grow: 1;
    }

    .preview-box {
        width: calc(100% - 32px);
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: rgba(0, 0, 0, 0.60);
        font-size: 12px;
        position: absolute;
        bottom: 10px;

        .detail-number {
            color: #2B67FF;
            margin: 0 4px;
        }

        .page-input {
            width: 48px;
            height: 24px;
            font-size: 12px;
        }

        .jump-page {
            height: 24px;
            display: flex;
            align-items: center;
        }

        .page-change {
            display: flex;
            width: 24px;
            height: 24px;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            border: 1px solid #E9E9E9;
            margin-left: 8px;
            cursor: pointer;
        }

        .prve {
            background-image: url(@/assets/icons/page-up.png);
            background-size: 16px;
            background-position: center;
        }

        .next {
            background-image: url(@/assets/icons/page-down.png);
            background-size: 16px;
            background-position: center;
        }

        .page-change:hover {
            background-color: #F7F8FA;
        }

        .prve-ban {
            background-image: url(@/assets/icons/ban-page-up.png);
            cursor: not-allowed;
        }

        .next-ban {
            cursor: not-allowed;
            background-image: url(@/assets/icons/ban-page-down.png);
        }
    }

    .headTitle {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        .leftBox {
            flex-grow: 1;

            .standard {
                background: rgba(237, 233, 247, 1);
                color: rgba(123, 61, 245, 1);
                padding: 4px 5px 3px 5px; 
                border-radius: 2px;
                font-weight: 600;
                font-size: 12px;
                margin-left: 10px;
                border-radius: 2px;
                &.without{
                    background:rgba(242, 242, 242, 1);
                    color:#616161;
                }
            }

            .safety {
                background: #E9F7E9;
                color: #12B252;
                padding: 4px 5px 3px 5px;
                border-radius: 2px;
                font-weight: 600;
                font-size: 12px;
                margin-left: 10px;
            }

            .title {
                font-weight: 600;
                font-size: 15px;
                color: rgba(0, 0, 0, 0.8);
                &.errorText{
                    font-weight: 600;
                    color: @errorColor;
                }
            }

            .operate-btn {
                font-weight: 400;
                font-size: 14px;
                color: #3d82f2;
                cursor: pointer;
                margin-left: 20px;

                img {
                    margin-top: -3px;
                    width: 14px;
                }
            }
            .redDot {
                position: relative;
                &::after{
                    content: '';
                    position: absolute;
                    top: 3px;
                    right: -6px;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: red;
                    cursor: pointer;
                }
            }

            .disable-opearte{
                color: #3d82f2;
                opacity: 0.3;
                cursor: not-allowed; 
                pointer-events: none;
            }

            .updateRecord {
                cursor: pointer;
                margin-left: 3px;

                svg{
                    width: 12px;
                    height: 12px;
                    margin-right: 4px;
                    position: relative;
                    top: 2px;
                }

                span {
                    line-height: 20px;
                    color: #3d82f2;
                }

                &.error{
                    svg{
                        fill: @errorColor;
                    }
                    span{
                        color: @errorColor;
                    }
                }
            }

        }

        .subTitle {
            font-weight: 400;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            margin-top: 2px;
        }
        .tableInfo{
            .tableSize{
                margin-left: 12px;
            }
            .speartor{
                display: inline-block;
                width: 1px;
                height: 12px;
                background-color: #E9E9E9;
                margin: 0 12px;
                position: relative;
                top: 2px;
            }
            .paused{
                color: #F33131;
            }
            .standardStatus {
                margin-left: 12px;
                color:#00B42A;
                &.without{
                    color:#F53F3F;
                }
            }
        }

        .rightBox {
            position: relative;
            margin-right: 14px;
            display: flex;
            flex-basis: 150px;
            flex-shrink: 0;
            justify-content: flex-end;
            .blank-importStandard {
                position: absolute;
                right: 108px;
            }

            .blank-import {
                position: absolute;
                right: 0;
            }

            .selectMenu {
                position: absolute;
                width: 125px;
                background: #ffffff;
                border: 1px solid #e9e9e9;
                box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.12);
                border-radius: 4px;
                right: -22px;
                top: 36px;
                padding: 3px 0;
                z-index: 5;

                img {
                    width: 16px;
                    margin-right: 8px;
                }

                li {
                    display: flex;
                    align-items: center;
                    height: 40px;
                    padding: 12px 8px 12px 12px;
                    cursor: pointer;
                    line-height: 1.1;
                }

                li:hover {
                    background: rgba(61, 130, 242, 0.1);
                }
            }

            .pre-text {
                position: absolute;
                bottom: 1px;
                right: -0;
                text-align: right;

                img {
                    width: 12px;
                    margin-top: -2px;
                    margin-left: 6px;
                    cursor: pointer;
                }
            }
        }
    }
    
    .check-tips{
        position: fixed;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        .done, .checking{
            border: 1px solid #F0F0F0;
            padding: 9px 16px;
            display: flex;
            align-items: center;
            box-shadow: 0px 6px 24px 0px #1F23291A;
            background-color: #fff;
            border-radius: 4px;
            .img {
                width: 18px;
                height: 18px;
                margin-right: 8px;
            }
            .loadingText{
                color: #2B67FF;
                cursor: pointer;
            }
        }
    }
    

    .area-blank {
        height: calc(100% - 120px);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        background-color: #fff;
        .excelWrap, .tableChange{
            display: flex;
            align-items: center;
            .loadingText{
                color: #2B67FF;
                cursor: pointer;
            }
        }
        .empty-checkingTip{
            width: 100%;
            height: 100%;
        }
        .box {
            text-align: center;
            &>img {
                width: 180px;
                height: 130px;
            }
        }

        .blank-text {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.4);
        }
    }
}
.delbox {
    padding: 30px 20px 30px 20px;
    font-weight: 400;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.8);
}
</style>