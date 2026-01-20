<template>
    <a-spin :spinning="state.importLoading">
        <div class="formPage">
            <div class="formHead">
                <div class="back">
                    <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
                </div>
                <div class="headBox">
                    <div class="add">
                        <div class="text">{{ addDataMode === 'add' ? t('common.addDataTable') : t('db.importTable') }}</div>
                        <div class="iptGroup">
                            <div>
                                <span class="textColor text1">{{ t('common.tableName') }}</span>
                                <input
                                    v-if="addDataMode === 'add'"
                                    v-model="state.name"
                                    class="ipt1"
                                    type="text"
                                    :disabled="iptDisable"
                                    :placeholder="t('common.enterTableName')"
                                />
                                <input v-else :value="indexTableDesc.tableAlias" class="ipt1" type="text" disabled />
                            </div>
                            <div>
                                <span class="textColor text2">{{ t('common.desc') }}</span>
                                <input
                                    v-if="addDataMode === 'add'"
                                    v-model="state.desc"
                                    class="ipt2"
                                    type="text"
                                    :disabled="iptDisable"
                                    :placeholder="t('common.tableDesc')"
                                />
                                <input v-else :value="indexTableDesc.description" class="ipt2" type="text" disabled />
                            </div>
                        </div>
                        <div class="formItemBody">
                            <a-form ref="formRef" :model="formState">
                            <a-form-item name="updatePolicy" :label="t('common.updatePolicy')">
                                <a-radio-group v-model:value="formState.updatePolicy" name="checkboxgroup" @change="changePolicy">
                                    <a-radio value="NONE">{{ t('common.noUpdate') }}</a-radio>
                                    <a-radio value="FULL_UPDATE">{{ t('common.fullUpdate') }}</a-radio>
                                    <a-radio :disabled="!dbFormData.isOpenLog || state.importList.length > 1 || hasChangeTableStructure" value="REALTIME_UPDATE">
                                        <template v-if="!dbFormData.isOpenLog">
                                            <a-tooltip>
                                                <template #title>{{ t('db.realTimeTip') }}</template>
                                                {{ t('common.realTimeUpdate') }}
                                            </a-tooltip>
                                        </template>
                                        <template v-else-if="state.importList.length > 1">
                                            <a-tooltip>
                                                <template #title>{{ t('db.realTip') }}</template>
                                                {{ t('common.realTimeUpdate') }}
                                            </a-tooltip>
                                        </template>
                                        <template v-else>
                                            {{ t('common.realTimeUpdate') }}
                                        </template>
                                    </a-radio>
                                    <a-radio :disabled="state.importList.length > 1 || hasChangeTableStructure" value="INCR_UPDATE">
                                        <a-tooltip>
                                            <template #title>{{ t('db.incrTip') }}</template>
                                            {{ t('common.incrUpdate') }}
                                        </a-tooltip>
                                    </a-radio>
                                </a-radio-group>
                            </a-form-item>
                            <!-- 实时更新和全量更新 需要设置主键 -->
                            <div class="iptGroup" v-if="showSetPrimaryKey">
                                <div class="primarykeyWrap">
                                    <span
                                        :class="{ 'hide-before': formState && formState.updatePolicy !== 'REALTIME_UPDATE' }"
                                    >{{ t('common.primaryKey') }}</span>
                                    <tips tipsContent="数据表内的唯一值字段，设置后将保障数据传输的一致性；不设置或设置错误的主键都可能导致数据不准确问题"/>
                                </div>
                                <a-select
                                    class="selectPrimaryKey"
                                    :notFoundContent="t('common.noData')" 
                                    v-model:value="state.primaryKey" 
                                    placeholder="请选择"
                                    :disabled="!enableSetPrimaryKey"
                                    allowClear
                                >
                                    <a-select-option v-for="item in primaryKeyColumns" :value="item.columnName">
                                        <span role="img">
                                            <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                        </span>
                                        {{ item.columnAlias || item.columnName }}
                                    </a-select-option>
                                </a-select>
                            </div>
                            <!-- 更新频率 -->
                            <regularUpdateInput ref="regularUpdateRef" :updatePolicy="formState.updatePolicy"/>
                            <div v-if="formState.updatePolicy === 'INCR_UPDATE'">
                                <a-form-item 
                                    name="dependColumn" 
                                    :label="t('common.updateDepend')" 
                                    :rules="[{ required: true, message: '请选择更新依据' }]"
                                >
                                    <a-select 
                                        :notFoundContent="t('common.noData')" 
                                        showSearch
                                        style="width: 256px" 
                                        v-model:value="formState.dependColumn" 
                                    >
                                        <a-select-option 
                                            v-for="item in state.importList[0]?.dependColumns"
                                            :key="item.columnName" 
                                            :value="item.columnName"
                                        >
                                            <span role="img">
                                                <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                            </span>
                                            {{ item.columnAlias || item.columnName }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                            </div>
                        </a-form>
                        </div>
                        
                    </div>
                    <div class="leftConfig">
                        <div class="btn">
                            <myButton type="primary" @click="importFile">{{ t('common.import') }}</myButton>
                        </div>
                    </div>
                </div>
            </div>
            <div class="formBody">
                <div class="leftTree">
                    <div class="treehead">
                        <span v-if="isMultipleSelect">
                            {{ t('form.selected') }} <span class="numText">{{ selectedNum }}/10</span> {{ t('form.tableNum') }}
                        </span>
                        <span v-else>{{ t('common.selectTable') }}</span>
                    </div>
                    <div class="search">
                        <input @keydown.enter="onSearch" type="text" v-model="state.searchText" :placeholder="t('common.search')" />
                        <img @click="onSearch" class="sear" src="@/assets/icons/search.png" alt="" />
                        <img
                            @click="clearSearchText"
                            v-show="state.showClearImg"
                            class="clear"
                            src="@/assets/icons/clear.png"
                            alt=""
                        />
                    </div>
                    <div class="select-all" v-if="state.treeList.length || state.filterLoading">
                        <div class="flex-block">
                            <i
                                :class="{
                                'select-icon': true,
                                'is-select': isMultipleSelect,
                                'no-select': !isMultipleSelect
                                }"
                                @click="changeMultipleState"
                            ></i>
                            {{ t('common.selectMultiple') }}
                        </div>
                        <a-tooltip>
                            <template #title>
                                {{ t('db.filterData') }}
                            </template>
                            <div @click="filterData" :class="[!isActive ? 'flex-block filter' : 'filter-active flex-block filter']">
                                 <BiIcon name="unique"/>
                                {{ t('selfConfig.unique') }}
                            </div>
                        </a-tooltip>
                    </div>
                    <a-spin :spinning="state.filterLoading"><ul class="treeUl"></ul></a-spin>
                    <ul v-if="!state.filterLoading" class="treeUl" ref="dbTreeRef" @scroll="dbTreeScroll">
                        <li
                            v-for="item in state.treeList"
                            :key="item.id"
                            :class="[state.activeKey == item.table_name ? 'active' : '']"
                            @click="onDebounceSelect(item, 2)" 
                        >
                            <i
                                v-if="isMultipleSelect || item.imported"
                                :class="{
                                'select-icon': true,
                                'is-select': !item.imported && item.isSelect,
                                'no-select': !item.imported && !item.isSelect,
                                'disable-select': item.imported,
                                }"
                                @click.stop="onSelect(item, 1)"
                            ></i>

                            <BiIcon name="DB" class="DBIcon"/>
                            <a-tooltip destroyTooltipOnHide :mouseEnterDelay="0.3" :mouseLeaveDelay="0">
                                <template #title>
                                    {{ t('common.tableName') }}:&nbsp;{{ item.table_name }}
                                    <br>
                                    {{ t('common.desc') }}:&nbsp;{{ item.table_comment }}
                                </template>
                                <p class="p-text">{{ item.table_name }}</p>
                            </a-tooltip>
                        </li>
                        <div class="loading-text" v-if="dbTableCount <= state.treeList.length && state.treeList?.length > 30">{{ t('common.reachBottom') }}</div>
                        <div class="loading-text" v-if="state.getTreeLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading') }}</div>
                    </ul>
                </div>
                <setCode 
                    ref="setCodeRef" 
                    v-if="columnsState.allColumns.length && !isMultipleSelect" 
                    @filterFn="drawerVisible = true"
                />
                <!-- <div style="width: 12px;"></div> -->
                <a-spin :spinning="state.tableSpinning">
                    <div class="blank" v-if="!columnsState.selectColumns.length">
                        <div className="box">
                            <img src="@/assets/images/img_null1.png" alt="" />
                            <div className="text">{{ t('common.selectTableFromLeft') }}</div>
                        </div>
                    </div>
                    <div class="table-con" v-else>
                        <div class="tables">
                            <p>{{ t('common.previewNum') }}</p>
                            <div class="table-wrap">
                                <myTable
                                    :tableColumns="columnsState.selectColumns"
                                    :tableData="state.tableData"
                                    width="calc(100vw - 560px)"
                                />
                            </div>
                            <!-- <span class="total-data">
                                共<i>{{ totalData }}</i>条数据 
                                <BiIcon name="refresh"/>
                            </span> -->
                        </div>
                    </div>
                </a-spin>
            </div>
        </div>
    </a-spin>
    <!-- 字段筛选抽屉组件 -->
    <drawerFilter 
        ref="drawerFilterRef" 
        :drawerVisible="drawerVisible"
        @closeDrawer="drawerVisible=false"
        @submitFn="submitFn"
     /> 
</template>

<script setup>
import { reactive, watch, computed, onMounted, ref, onUnmounted, nextTick, h } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue';
import * as _ from 'loadsh'
import { v4 as uuidv4 } from 'uuid'
import { getimgType, getIconSrc, getCodeType, getObjectBase64Str } from '@/utils/utils'
import { getDbPreviewData, getDbPreviewDataV2, dbTableImport, getDbList } from '@/apis/db'
import { apiManageStore } from '@/Stores/apiManageStore';
import myButton from '@/components/buttons/myButton.vue'
import myTable from '@/components/table'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { debounce } from 'loadsh'
import tips from '@/components/tips'
import regularUpdateInput from '@/components/regularUpdateInput'
import setCode from './setCode'
import drawerFilter from '@/components/filterColumn/drawerFilter.vue';
import createDialog from '@/utils/dialog'

const { t } = useI18n()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const dbTreeRef = ref()
const isSelectAll = ref(false) // 是否全选
const isSearch = ref(false)
const isActive = ref(false)
const importedNum = ref(0)
const { activeTabKey, dbTableList, dbFormData, addDataMode, indexTableDesc, dbPageNumber, dbTableCount, isEmptyImport } = storeToRefs(useMainStore)
const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});
const state = reactive({
    name: '',
    desc: '',
    searchText: '',
    activeKey: '',
    showClearImg: false,
    treeSpinning: false,
    treeList: [],
    tableData: [],
    importList: [],
    noSelectList: [], // 在全选时没被选中的表
    tableSpinning: false,
    importLoading: false,
    getTreeLoading: false,
    filterLoading: false,
    primaryKey: ''
})

const columnsState = reactive({
    allColumns: [],
    selectColumns: []
})
const drawerVisible = ref(false)
const curTableInfo = ref()
const drawerFilterRef = ref()
// const totalData = ref(0)
const isMultipleSelect = ref(false)
const setCodeRef = ref()
const selectTable = ref(false)
const filterInfo  =ref([])
// 是否改过筛选条件
const hasModifiedFilterInfo = ref(false)
const regularUpdateRef = ref(null)

// 设置字段属性组件使用
provide('COLUMNS_INFO', columnsState)

// 字段筛选组件使用
provide('FILTER_COLUMNS', columnsState)

let formState = reactive({
    updatePolicy: 'NONE',
    updateRate: 1,
    updateUnit: 1,
    dependColumn: '',
    primaryKey: '',
})

onMounted(() => {
    state.treeList = _.cloneDeep(dbTableList.value)
})

onUnmounted(() => {
    dbPageNumber.value = 1
})

const hasChangeTableStructure = ref(false)


// 改变了表结构 置灰实时更新,增量更新 仅允许设置不更新和全量更新
watch([columnsState, hasModifiedFilterInfo], () => {
    hasChangeTableStructure.value = hasModifiedFilterInfo.value || JSON.stringify(columnsState.allColumns) !== JSON.stringify(columnsState.selectColumns) 

    if(['REALTIME_UPDATE', 'INCR_UPDATE'].includes(formState.updatePolicy)) {
        formState.updatePolicy = 'NONE'
    } 
}, {
    deep: true
})

const iptDisable = computed(() => {
    if (state.importList.length > 1) return true
    return false
})

const selectedNum = computed(() => {
    if (isSelectAll.value) { // 全选
        return isActive.value ? dbTableCount.value - state.noSelectList.length - importedNum.value : dbTableCount.value - state.noSelectList.length
    } else {
        return state.importList.length
    }
})

watch(() => state.searchText, (val) => {
    if (!val.trim()) {
        state.showClearImg = false
        if (isSearch.value) {
            onSearch()
            isSearch.value = false
        }
    } else {
        state.showClearImg = true
    }
})

const resetState = (from) => {
    dbPageNumber.value = 1
    state.treeList = []
    state.noSelectList = []
    state.name = ''
    state.desc = ''
    state.activeKey = ''
    columnsState.allColumns = []
    columnsState.selectColumns = []
    state.tableData = []
    state.filterLoading = false
    importedNum.value = 0
    if (from === 'search') {
        isSelectAll.value = false
    }
    isSearch.value = true
}

const onSearch = () => {
    dbFormData.value.tableName = state.searchText.trim()
    resetState('search')
    state.filterLoading = true
    getDbTree(2)
}

const clearSearchText = () => {
    state.searchText = ''
}

const beforeSelectValidate = async () => {
    // 多选不进行校验
    if(isMultipleSelect.value) {
        hasModifiedFilterInfo.value = false
        setCodeRef.value?.setChangeFlag(false)
        return Promise.resolve(true)
    }

    let hasModifiedColumn = setCodeRef.value?.getChangeFlag()
    // 是否修改过字段 增加过筛选
    if(!hasModifiedColumn && !hasModifiedFilterInfo.value) return Promise.resolve(true)

    return createDialog({
        title: '提示',
        content: '切换数据表后操作内容不会保留，确定切换？',
        okText: '确定',
        cancelText: '取消',
    }).then(() => {     // 确定
        setCodeRef.value.setChangeFlag(false)
        return true
    }).catch(() => {    // 取消
       return false 
    })
}

const onSelect = async (record, type) => {
    if (record.imported) {
        return
    }

    let validateRes = await beforeSelectValidate()

    if(!validateRes) return

    if(selectedNum.value >= 10 && !record.isSelect) {
        return message.warning('最多同时导入10张表')
    }

    curTableInfo.value = record
    if (type === 1) {
        
        record.isSelect = !record.isSelect
        selectTable.value = record.isSelect
        if (record.isSelect) {
            state.activeKey = record.table_name
            getDbData(record)
        }
        let temp = []
        if (state.importList.length > 0) {
            temp = state.importList.filter((item) => item.table_name != record.table_name)
            if (record.isSelect) {
                state.importList = [...temp, record]
            } else {
                state.importList = temp
            }
        } else {
            state.importList.push(record)
        }
        if (state.importList.length > 1) {
            state.name = ''
            state.desc = ''
        } else {
            if (temp.length) {
                state.name = temp[0].table_name
                state.desc = temp[0].table_comment
            } else if (record.isSelect) {
                state.name = record.table_name
                state.desc = record.table_comment
            } else {
                state.name = ''
                state.desc = ''
            }
        }
        if (state.importList.length > 1 && formState.updatePolicy === 'INCR_UPDATE') {
            formState.updatePolicy = 'NONE'
            formState.dependColumn = ''
        }
        // 全量更新的 primaryKey 逻辑
        if(state.importList.length === 1 && formState.updatePolicy === 'FULL_UPDATE'){
            if(state.importList[0] && state.importList[0].dependColumns){
                let targetColumn = state.importList[0].dependColumns.find(it => it.isPrimaryKey === 1)
                state.primaryKey = targetColumn?.columnName ?? ''
            }
        } else if(state.importList.length >1 && formState.updatePolicy === 'FULL_UPDATE'){
            state.primaryKey = ''
        }
    } else {
        state.importList = [record]
        selectTable.value = false
        state.activeKey = record.table_name
        getDbData(record)
        setCodeRef.value?.resetSerchKw()
        drawerFilterRef.value?.resetFilterState() 
        hasModifiedFilterInfo.value = false
    }
    // if (isSelectAll.value && type === 1) {
    //     let temp1 = []
    //     if (state.noSelectList.length > 0) {
    //         temp1 = state.noSelectList.filter((item) => item.table_name != record.table_name)
    //         if (!record.isSelect) {
    //             state.noSelectList = [...temp1, record]
    //         } else {
    //             state.noSelectList = temp1
    //         }
    //     } else {
    //         state.noSelectList.push(record)
    //     }
    //     if (state.importList.length === 1) { // 在这调用是因为最后一个，增量更新被放开了，如果不进行调用的话，更新依据没获取到
    //         state.activeKey = state.importList[0].table_name
    //         getDbData(state.importList[0])
    //     }
    //     if (state.importList.length === 0) {
    //         isSelectAll.value = false
    //     }
    // }

    if(!isMultipleSelect.value && type === 2) {
        state.name = record.table_name
        state.desc = record.table_comment
    }
}

// 切换多选状态
const changeMultipleState = () => {
    isMultipleSelect.value = !isMultipleSelect.value
    // 切换为多选时 重置筛选条件
    if(isMultipleSelect.value) {
        getDbData(curTableInfo.value)
    }else {
        resetData()
    }
}

const resetData = () => {
    state.treeList.forEach(item => {
        item.isSelect = false
    })
    isSelectAll.value = false
    state.importList = []
    state.name = ''
    state.desc = ''
}

const onDebounceSelect = _.debounce(onSelect, 200, {
    leading: true,  // 延迟开始前调用
    trailing: false // 延迟结束后调用
})

const dbTreeScroll = _.debounce(() => {
    if (dbTableCount.value <= state.treeList.length) {
        return
    }
    let {clientHeight, scrollTop, scrollHeight} = dbTreeRef.value
    if (scrollHeight - scrollTop <= clientHeight + 80) {
        dbPageNumber.value++
        getDbTree()
    }
}, 200)
/**
 * 默认是1， 如果是1的话是滚动加载 如果是2的话是搜索，状态都要清空
 * @param {number} type 
 */
const getDbTree = (type = 1) => {
    dbFormData.value.pageNum = dbPageNumber.value
    if (type === 1 && dbTableCount.value !== state.treeList.length) {
        state.getTreeLoading = true
    }
    getDbList(dbFormData.value).then(async res => {
        if (res.code == 1) {
            state.getTreeLoading = false
            if (dbTableCount.value === state.treeList.length) {
                return
            }
            // if (isSelectAll.value && res.data.data.length) {
            //     res.data.data.forEach(item => {
            //         item.isSelect = true
            //     })
            // }
            useMainStore.setDbTableCount(res.data.count || dbTableCount.value)
            importedNum.value = res.data.importedNum || importedNum.value
            const mergeType = dbFormData.value.tableName ? 1 : 0
            if (type === 1) {
                let tableList = [ ...state.treeList, ...res.data.data]
                if(state.importList.length){
                    tableList = mergeArrays(tableList, state.importList, 'table_name', mergeType)
                }
                useMainStore.setDbTableList(tableList)
            } else {
                state.filterLoading = false
                let tableList = res.data.data
                if(state.importList.length){
                    tableList = mergeArrays(tableList, state.importList, 'table_name' , mergeType)
                }
                useMainStore.setDbTableList(tableList)
            }
            await nextTick(1)
            state.treeList = _.cloneDeep(dbTableList.value)
        } else {
            state.filterLoading = false
            message.error(res.message)
        }
    })
}

const getDbData = (record, type) => {
    if(!record) return

    const jsonData = {
        ...dbFormData.value,
        tableName: record.table_name,
    }

    const requestParams = {
        dbInfo: jsonData,
        tableName: record.table_name,
    }

    // 筛选操作 传递操作字段和筛选条件
    if(type === 'filter') {
        requestParams.selectColumns = columnsState.selectColumns
        requestParams.selfConfigWhereStr = getObjectBase64Str(filterInfo.value)
    }
    
    state.tableSpinning = true
    
    getDbPreviewDataV2(requestParams).then((res) => {
        if (res.code == 1) {
            let scolumns = res.data.selectColumns
            let tcolumns = res.data.tableColumns

            tcolumns?.forEach((item) => {
                item.imgType = getimgType(item.columnType)
                item.type = getCodeType(item.columnType)
                item.dataIndex = item.columnName

                // 解决筛选完后 字段名未同步
                let target  = scolumns.find(it => it.columnName === item.columnName)
                if(target) {
                    item.columnAlias = target.columnAlias
                }
            })

            scolumns?.forEach((item) => {
                item.imgType = getimgType(item.columnType)
                item.type = getCodeType(item.columnType)
                item.dataIndex = item.columnName
            })
            columnsState.selectColumns = scolumns
            columnsState.allColumns = tcolumns
            record.dependColumns = tcolumns
            state.tableData = res.data.queryResult
            state.tableSpinning = false
            // 设置主键
            if(selectTable.value && state.importList.length === 1) {
                let targetColumn = tcolumns.find(it => it.isPrimaryKey === 1)
                state.primaryKey = targetColumn?.columnName ?? ''
            }

        } else {
            message.error(res.message)
            state.tableSpinning = false
        }
    })
}

const filterData = () => {
    isActive.value = !isActive.value
    if (isActive.value) {
        dbFormData.value.ignoreImported = 1
    } else {
        dbFormData.value.ignoreImported = 0
    }
    resetState()
    state.filterLoading = true
    getDbTree(2)
}

const importFile = debounce(() => {
    if (!state.name && state.importList.length < 2 && addDataMode.value !== 'import') {
        return message.warn(t('common.pleaseEnterName'))
    }
    if (!state.importList.length) {
        return message.warn(t('common.pleaseSelectTable'))
    }

    if(formState.updatePolicy === 'REALTIME_UPDATE' && !state.primaryKey) {
        return message.warn('实时更新需要选择主键')
    }

    let tables = []
    let jsonData = []
    /*if (isSelectAll.value) { // 如果是全选
        tables = [{
            tableAlias: '',
            description: '',
            groupId: activeTabKey.value,   
            tableSource: JSON.stringify({
                dbInfo: dbFormData.value,
                tableName: '',
            }),
            updatePolicy: formState.updatePolicy,
            updateParams: setReularUpdate(formState)
        }]
        const excludeTable = state.noSelectList.map(i => i.table_name)
        jsonData = {
            realTable: tables,
            dbInfo: dbFormData.value,
            all: 1,
            excludeTable
        }
    } else { // 如果是非全选，按照原来的逻辑
        const length = state.importList.length
        if (state.importList.length) {
            tables = state.importList.map((item) => {
                let result = {
                    tableAlias: length > 1 ? item.table_name : state.name,
                    description: length > 1 ? item.table_comment : state.desc,
                    groupId: activeTabKey.value,
                    tableSource: JSON.stringify({
                        dbInfo: dbFormData.value,
                        tableName: item.table_name,
                    }),
                    updatePolicy: formState.updatePolicy,
                    updateParams: setReularUpdate(formState),
                }
                // 数据库导入数据到空表 传递空表id
                if(addDataMode.value === 'import'){
                    result.tableAlias = indexTableDesc.value.tableAlias
                    result.description = indexTableDesc.value.description
                    result.id = indexTableDesc.value.id
                }
                return result
            })
        }
        jsonData = {
            realTable: tables,
            dbInfo: dbFormData.value
        }
    }*/

    const length = state.importList.length
    if (state.importList.length) {
        tables = state.importList.map((item) => {
            let result = {
                tableAlias: length > 1 ? item.table_name : state.name,
                description: length > 1 ? item.table_comment : state.desc,
                groupId: activeTabKey.value,
                tableSource: JSON.stringify({
                    dbInfo: dbFormData.value,
                    tableName: item.table_name,
                }),
                updatePolicy: formState.updatePolicy,
                updateParams: setReularUpdate(formState),
            }
            // 数据库导入数据到空表 传递空表id
            if(addDataMode.value === 'import'){
                result.tableAlias = indexTableDesc.value.tableAlias
                result.description = indexTableDesc.value.description
                result.id = indexTableDesc.value.id
            }
            return result
        })
    }
    jsonData = {
        realTable: tables,
        dbInfo: dbFormData.value
    }
    
    // 实时更新
    if(formState.updatePolicy === 'REALTIME_UPDATE'&& state.primaryKey  && state.importList.length === 1 ) {
        state.importList[0].dependColumns.forEach((it)=>{
            if(it.columnName === state.primaryKey){
                it.isPrimaryKey = 1
            } else {
                it.isPrimaryKey = 0
            }
        })
        jsonData.realTableColumnList = [state.importList[0].dependColumns]
    // 全量更新
    } else if(formState.updatePolicy === 'FULL_UPDATE' && state.importList.length === 1 ){
        state.importList[0].dependColumns.forEach((it)=>{
            if(it.columnName === state.primaryKey){
                it.isPrimaryKey = 1
            } else {
                it.isPrimaryKey = 0
            }
        })
        jsonData.realTableColumnList = [state.importList[0].dependColumns]
    }

    // 单选 realTableColumnList传所有字段 兼容全量更新主键逻辑 
    if(!isMultipleSelect.value) {
        // jsonData.selfConfigWhere = filterInfo.value
        let filterData= drawerFilterRef.value.getFilterData()

        // 筛选含有数据传递selfConfigWhere字段
        if(filterData.length > 0) {
            drawerFilterRef.value.removeTrashKey()
            jsonData.selfConfigWhere = [{
                uuid: uuidv4(),
                action: 'where',
                contents: filterData
            }]
        }
        
        // jsonData.realTableColumnList = [columnsState.selectColumns]
        if(jsonData.realTableColumnList?.length) {
            jsonData.realTableColumnList[0] = jsonData.realTableColumnList[0].filter(it => {
                    // 主键默认选中
                    if(it.columnName === state.primaryKey) return true
                    return columnsState.selectColumns.find(f => f.columnName === it.columnName)
                }
            )
        } else {
            jsonData.realTableColumnList = [columnsState.selectColumns] 
        }
        
    }

    jsonData.isComingEmptyImport = isEmptyImport.value

    state.importLoading = true

    console.log('jsonData', jsonData)
    dbTableImport(jsonData).then((res) => {
        if (res.code == 1) {
            message.success(res.message)
            useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
            useMainStore.setPageId('pageTable')
            useMainStore.selectTabs({
                id: activeTabKey.value,
            }, 'import')
            useApiManageStore.initRedDot()
        } else {
            message.error(res.message)
        }
        state.importLoading = false
    })
}, 400, {
    leading: true,
    trailing: false 
})
const goBack = () => {
    useMainStore.setPageId('pageTable')
}

// 定时更新
const setReularUpdate = (info) => {
    if(!['INCR_UPDATE', 'FULL_UPDATE'].includes(formState.updatePolicy)) {
        return JSON.stringify(info)
    }
    let uuid = regularUpdateRef.value.uuid
    let regularUpdateInfo = useMainStore.getRegularUpdateInfo(uuid)
    return JSON.stringify({
        ...info,
        primaryKey: state.primaryKey ?? undefined,
        timeExpression: regularUpdateInfo.cronStr
    })
}

// 表已经有多个主键，则显示主键的切换 columns
// 无主键则显示全部columns 
// 只有一个主键，默认赋值，不可切换点击
const primaryKeyColumns = computed(()=>{
    let columns = state.importList[0]?.dependColumns
    const primaryKeyLists =  columns?.filter(it => it.isPrimaryKey === 1)
    if(!hasOnePrimaryKey.value && primaryKeyLists && primaryKeyLists.length > 1){
        return primaryKeyLists
    } else {
        return columns || state.columns
    }
})

// 是否只含有一个主键字段 
const hasOnePrimaryKey = computed(() => {
    let columns = state.importList[0]?.dependColumns
    const primaryKeyLists =  columns?.filter(it => it.isPrimaryKey === 1)
    if(primaryKeyLists && primaryKeyLists.length === 1){
        return true
    } else {
        return false
    }
})

// 展示设置主键
const showSetPrimaryKey = computed(()=>{
    if((formState.updatePolicy === 'REALTIME_UPDATE' || // 实时更新
        formState.updatePolicy === 'FULL_UPDATE') && //全量更新
        state.importList.length === 1    // 选中一张表
    ){
        return true
    } else {
        false
    }
})


// 启用设置主键
const enableSetPrimaryKey = computed(() => {
    return (formState.updatePolicy === 'REALTIME_UPDATE' // 实时更新
    ||  formState.updatePolicy === 'FULL_UPDATE')  //全量更新
    &&  state.importList.length === 1    // 选中一张表
    &&  !hasOnePrimaryKey.value  // 只有一个主键字段
})

const changePolicy = () => {
    if((formState.updatePolicy === 'REALTIME_UPDATE' || formState.updatePolicy === 'FULL_UPDATE') && state.importList.length === 1) {
        let columns = state.importList[0]?.dependColumns
        let targetColumn = columns?.find(it => it.isPrimaryKey === 1)
        state.primaryKey = targetColumn?.columnName ?? ''
    }
}

// 合并两个数组含有相同属性的对象并将参照数组置顶，arr1 :长目标数组 arr2: 短参照数组 key:属性值   
// type 0：显示所有的importList    1:不显示所有的importList
const mergeArrays = (arr1, arr2, key, type) => {
    const map = new Map();
    // 将 arr1 中的对象按照指定的 key 存储到一个 Map 中，便于快速查找
    arr1.forEach(obj => map.set(obj[key], obj));
    // 遍历 arr2，如果在 map 中找到相同 key 的对象，则用 arr2 中的对象替换掉 arr1 中的对象，并将替换后的对象的 key 值记录下来
    const replacedKeys = new Set(); // 去除重复对象
    arr2.forEach(obj => {
        if (map.has(obj[key])) {
            const replacedObj = map.get(obj[key]);
            replacedKeys.add(replacedObj[key]);
            map.set(obj[key], obj);
        } else if(!map.has(obj[key]) && type == 0){
            map.set(obj[key], obj);
            const replacedObj = map.get(obj[key]);
            replacedKeys.add(replacedObj[key]);
        }
    });
    const arr3 = Array.from(map.values())
    // 将替换后的对象按照在 arr3 中的顺序排序
    const sortedArr1 = arr3.filter(obj => replacedKeys.has(obj[key]));
    const restArr1 = arr3.filter(obj => !replacedKeys.has(obj[key]));
    const mergedArray = sortedArr1.concat(restArr1);
    return mergedArray;
}

const submitFn = () => {
    drawerVisible.value = false
    try{
        filterInfo.value = [{
            uuid: uuidv4(),
            action: 'where',
            contents: drawerFilterRef.value.getFilterData()
        }]

        // 有筛选条件 切换表时进行提示
        hasModifiedFilterInfo.value = !!filterInfo.value.length
        console.log('filterInfo', filterInfo)
        getDbData(curTableInfo.value, 'filter')
    } catch(e) {
        message.error('筛选配置解析失败')
        console.log('e', e)
    }
    // getDbData()
}

watch(() => state.importList, (nv) => {
    // 选多张表 重置更新策略
    if(nv.length > 1 && ['REALTIME_UPDATE', 'INCR_UPDATE'].includes(formState.updatePolicy)) {
        formState.updatePolicy = 'NONE'
    }
})

</script>

<style lang="less" scoped>
.formPage {
    height: calc(100vh - 126px);
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.ant-spin-container) {
        height: 100%;
    }

    .formHead {
        width: 100%;
        background-color: #fff;

        .back {
            height: 36px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .backbox {
                width: 60px;
                height: 20px;
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;
                span{
                    display: flex;
                    align-items: center;
                }
    
                img {
                    width: 16px;
                    margin-right: 4px;
                }
            }
        }

        .headBox {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .add {
                padding: 16px;

                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }
                .formItemBody {
                    max-height: 130px;
                    margin-top: 5px;

                    .ant-form-item {
                        margin-bottom: 0;
                    }

                    .row {
                        display: flex;
                        height: 52px;
                        align-items: center;
                        // margin-bottom: 15px;

                        .col2 {
                            height: 32px;
                            display: flex;
                            align-items: center;

                            .ml8mr20 {
                                margin-left: 8px;
                                margin-right: 20px;
                            }

                            .wid276 {
                                width: 276px;
                            }

                            .col3 {
                                display: flex;
                                align-items: center;
                            }
                        }
                    }

                    :deep(.ant-form-item-label>label) {
                        width: 78px;
                        &::after{
                            content: '';
                        }
                    }
                }

                .iptGroup {
                    margin-top: 8px;
                    display: flex;
                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        margin-right: 26px;
                    }

                    .text2 {
                        margin: 0px 14px 0px 30px;
                    }

                    .ipt1 {
                        width: 15.7vw;
                    }

                    .ipt2 {
                        width: 26.1vw;
                    }
                    .primarykeyWrap{
                        display: flex;
                        align-items: center;
                        margin-right: 20px;
                        &>span{
                            position: relative;
                            &::before{
                                content: '*';
                                color: #F53F3F;
                                position: absolute;
                                top: 0;
                                left: -7px;
                            }
                        }
                        .hide-before::before {
                            display: none;
                        }
                        &>div{
                            position: relative;
                            bottom: 1px;
                            left: 2px;
                        }
                    }
                    .selectPrimaryKey{
                        width: 240px;
                    }
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;
                .btn {
                    display: flex;
                    justify-content: flex-end;
                }
            }
        }
    }

    .formBody {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
        gap: 12px;
        .leftTree {
            width: 240px;
            height: 100%;
            background-color: #fff;

            .treehead {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding: 16px 12px;
                width: 240px;
                height: 52px;
                border-bottom: 1px solid #e9e9e9;
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
            }

            .numText {
                color: #3d82f2;
            }

            .treeTabs {
                width: 240px;
                height: 44px;
                padding: 12px;
                border-bottom: 1px solid #e9e9e9;
                display: flex;

                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.6);

                .tab1 {
                    margin-right: 16px;
                    cursor: pointer;
                }

                .tab2 {
                    cursor: pointer;
                }

                .tabline {
                    width: 28px;
                    height: 2px;
                    background: #3d82f2;
                    margin-top: 8px;
                }

                .activeText {
                    font-weight: 600;
                    font-size: 14px;
                    color: #3d82f2;
                }
            }
            
            .select-icon {
                display: inline-block;
                margin-right: 8px;
                cursor: pointer;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                background-size: 100%;
                background-image: url('@/assets/icons/doing_select.png');
                &.is-select {
                background-image: url('@/assets/icons/is_select.png');
                }
                &.no-select {
                background-image: url('@/assets/icons/not_select.png');
                }
                &.disable-select{
                    background-image: url('@/assets/icons/disabled_select.png');
                }
            }

            .select-all {
                width: 240px;
                height: 38px;
                padding: 0px 16px 0px 12px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                .flex-block {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .filter {
                    width: 65px;
                    height: 26px;
                    padding: 4px 6px;
                    color: rgba(0, 0, 0, 0.6);
                    cursor: pointer;
                    svg {
                        width: 14px;
                        height: 14px;
                        fill: #828C99;
                        margin-right: 4px;
                    }
                }
                .filter:hover {
                    color: #2B67FF;
                    svg {
                        fill: #2B67FF; 
                    }
                }
                .filter-active {
                    background: #E8F2FF;
                    border-radius: 4px;
                    color: #2B67FF !important;
                    svg {
                        fill: #2B67FF;
                    }
                }
            }

            .search {
                width: 240px;
                height: 46px;
                padding: 8px 12px;
                position: relative;
                margin-bottom: 10px;

                input {
                    width: 216px;
                    height: 30px;
                    padding-right: 60px;
                }

                .sear {
                    width: 16px;
                    position: absolute;
                    top: 16px;
                    right: 22.6px;
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

            .treeUl {
                width: 240px;
                height: calc(100% - 153px);
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                margin: 0;
                overflow: hidden auto;

                svg {
                    margin-right: 4px;
                }

                li {
                    width: 240px;
                    min-height: 50px;
                    max-height: 60px;
                    padding: 0px 16px 0px 12px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;

                    .checkIpt {
                        width: 16px;
                        height: 16px;
                        margin: 0;
                    }

                    .banIpt {
                        cursor: not-allowed;

                        :deep(input[type='checkbox' i]:disabled) {
                            background-color: #3d82f2;
                        }
                    }

                    .p-text {
                        width: calc(100% - 35px);
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        margin: 0;
                    }

                    .liText {
                        width: calc(100% - 35px);
                        display: inline-block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                li:hover {
                    background: rgba(61, 130, 242, 0.1);
                }

                .active {
                    background: rgba(61, 130, 242, 0.1);
                }

                .loading-text {
                    color: rgba(0, 0, 0, 0.4);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
            }
        }
    }

    .blank {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        flex-wrap: wrap;

        .box {
            text-align: center;
        }

        img {
            width: 180px;
            height: 130px;
        }

        .text {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .ant-spin-nested-loading{
        flex-grow: 1;
        overflow: hidden
    }

    .table-con {
        height: 100%;
        background-color: #fff;
        padding: 10px;
        .update-config {
            display: flex;
            height: 40px;
            justify-content: space-between;
            align-items: center;
            .update {
                height: 40px;
                display: flex;
                align-items: center;
                margin-left: 10px;
                .text3 {
                    margin-left: 4px;
                }
                .text4 {
                    color: #3D82F2;
                    margin-left: 4px;
                }
                .updata-text {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    margin-left: 10px;
                }
            }
        }
        p {
            margin-bottom: 10px;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
        }

       .tables {
            height: 100%;
            position: relative;
            .table-wrap{
                height: 88%;
                overflow: auto;
            }
            .total-data{
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                position: absolute;
                bottom: 4px;
                left: 0;
                i{
                    font-style: normal;
                    margin: 2px;
                    color: #2B67FF;
                }
                svg{
                    width: 14px;
                    height: 14px;
                    margin-left: 6px;
                    margin-top: 2px;
                    cursor: pointer;
                }
            }
       }
    }
}
</style>
