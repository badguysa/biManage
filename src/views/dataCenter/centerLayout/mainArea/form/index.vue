<template>
    <a-spin :spinning="state.importLoading">
        <div class="formPage" :style="{height: props.height}">
            <div class="formHead">
                <div class="back">
                    <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
                </div>
                <div class="headBox">
                    <div class="add">
                        <div class="text">{{ addDataMode === 'add' ? t('form.addFormTable') : t('form.importFromTable') }}</div>
                        <div class="iptGroup">
                            <div>
                                <span class="textColor text1">{{ t('common.tableName') }}</span>
                                <input
                                    v-if="addDataMode === 'add'"
                                    v-model="state.name"
                                    class="ipt1"
                                    type="text"
                                    :placeholder="t('common.enterTableName')"
                                    :disabled="iptDisable"
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
                                    :placeholder="t('common.tableDesc')"
                                    :disabled="iptDisable"
                                />
                                <input v-else :value="indexTableDesc.description" class="ipt2" type="text" disabled />
                            </div>
                        </div>
                        <div class="iptGroup" style="align-items: center; margin-top: 10px;">
                            <span class="textColor text1">{{ t('common.updatePolicy') }}</span>
                            <a-radio-group name="checkboxgroup" v-model:value="formState.updatePolicy">
                                <a-radio value="NONE">{{ t('common.noUpdate') }}</a-radio>
                                <a-radio value="REALTIME_UPDATE">{{ t('common.realTimeUpdate') }}</a-radio>
                            </a-radio-group>
                        </div>
                    </div>
                    <div class="leftConfig">
                        <div>
                            <myButton type="primary" @click="importFile">{{ t('common.import') }}</myButton>
                        </div>
                    </div>
                </div>
            </div>
            <div class="formBody">
                <div class="leftTree">
                    <div class="treehead">
                        <span v-if="selectedNum">
                            {{ t('form.selected') }} <span class="numText">{{ selectedNum }}</span> {{ t('form.tableNum') }}
                        </span>
                        <span v-else>{{ t('common.selectTable') }}</span>
                    </div>
                    <div class="treeTabs">
                        <div :class="[state.type === 0 ? 'tab1 activeText' : 'tab1']" @click="changeTabs(0)">
                            {{ t('form.form') }}
                            <div v-if="state.type === 0" class="tabline"></div>
                        </div>
                        <div :class="[state.type === 1 ? 'tab2 activeText' : 'tab2']" @click="changeTabs(1)">
                            {{ t('form.approve') }}
                            <div v-if="state.type === 1" class="tabline"></div>
                        </div>
                        <div v-if="systemConfig.allowFormCrossUnit" :class="[state.type === 2 ? 'tab3 activeText' : 'tab3']" @click="changeTabs(2)">
                            {{ t('form.crossUnit') }}
                            <div v-if="state.type === 2" class="tabline"></div>
                        </div>
                    </div>
                    <div class="search">
                        <input @keydown.enter="onSearch" type="text" v-model="state.searchText" :placeholder="t('common.search')">
                        <img @click="onSearch" class="sear" src="@/assets/icons/search.png" alt="" />
                    </div>
                    <div class="addCrossForm" v-if="state.type === 2" @click="addCrossForm">
                        <img class="add-img" src="@/assets/icons/add_relation.png" alt="">
                        <span class="txt">{{ t('form.addCrossUnit') }}</span>
                    </div>
                    <div class="select-all" v-if="!state.treeSpinning && showList.length">
                        <img @click="selectAll(1)" class="check-img" v-if="selectedNum === 0" src="@/assets/icons/not_select.png" alt="">
                        <img @click="selectAll(2)" class="check-img" v-else-if="selectedNum === formTotal" src="@/assets/icons/is_select.png" alt="">
                        <img @click="selectAll(3)" class="check-img" v-else src="@/assets/icons/doing_select.png" alt="">
                        {{ t('common.selectAll') }}
                    </div>
                    <ul ref="scorllList" 
                        v-if="!state.treeSpinning && showList.length" 
                        :class="{'treeUl': true, 'addTreeUl': state.type === 2 }" 
                        @scroll="scrollListener" 
                    >
                        <li
                            v-for="item in showList" 
                            :key="item.id"
                            :class="[state.activeKey == item.tableName ? 'active' : '']"
                        >
                            <div v-if="state.type !== 2" style="display: flex;justify-content: center; align-items: center;">
                                <template v-if="item.addStatus">
                                    <img class="checkIpt" src="@/assets/icons/disabled_select.png" alt="">
                                </template>
                                <template v-else>
                                    <img class="checkIpt" @click="onSelect(item, 1)" v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                    <img class="checkIpt" @click="onSelect(item, 1)" v-else src="@/assets/icons/not_select.png" alt="">
                                </template>
                                <img class='formImg' :src="formImg" alt="">
                                <p :title="item.comment" @click="onDebounceSelect(item, 2)" class="p-text">{{ item.comment }}</p>
                            </div>
                            <a-tooltip placement="topLeft" v-else>
                                <template #title>
                                    <div>单位fid: {{item.fid || 'fid'}}</div>
                                    <div>表单id: {{item.formId }}</div>
                                </template>
                                <div style="display: flex; justify-content: center; align-items: center;">
                                    <template v-if="item.addStatus">
                                        <img class="checkIpt" src="@/assets/icons/disabled_select.png" alt="">
                                    </template>
                                    <template v-else>
                                        <img class="checkIpt" @click="onSelect(item, 1)" v-if="item.isSelect" src="@/assets/icons/is_select.png" alt="">
                                        <img class="checkIpt" @click="onSelect(item, 1)" v-else src="@/assets/icons/not_select.png" alt="">
                                    </template>
                                    <img class='formImg' :src="formImg" alt="">
                                    <p :title="item.comment" @click="onDebounceSelect(item, 2)" class="p-text">{{ item.comment }}</p>
                                </div>
                            </a-tooltip>
                        </li>
                        
                        <div class="loading-text" v-if="!tableLoading && (state.formPageNum == totalPage) && state.treeList?.length > 50">{{ t('common.reachBottom') }}</div>
                        <div class="loading-text" v-if="tableLoading"><a-spin :indicator="indicator" />{{ t('common.scrollLoading') }}</div>
                    </ul>
                </div>

                <div style="width: 12px;"></div>
                <div class="blank" v-if="!state.columns.length">
                    <div className="box">
                        <img src="@/assets/images/img_null1.png" alt="" />
                        <div className="text">{{ t('common.selectTableFromLeft') }}</div>
                    </div>
                </div>
                <div class="table-con" v-if="state.columns.length">
                    <a-spin :spinning="state.tableSpinning" >
                        <p>{{ t('common.previewNum') }}</p>
                        <div class="tables">
                            <myTable :tableColumns="state.columns" :tableData="state.tableData" width="calc(100vw - 485px)" />
                        </div>
                    </a-spin>
                </div>
            </div>
        </div>
        <!-- 添加列弹窗 -->
        <addCrossFormModal v-if="addCrossFormModalVisible"  @modalConfirm="modalConfirm" />
    </a-spin>
</template>

<script setup>
import { reactive, watch, computed, onMounted, ref, h, toRaw } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue';
import { getFormListInFid, getTableData, importForm, getCrossFormList, importCrossForm } from '@/apis/form'
import * as _ from 'loadsh'
import { getimgType, filterArrByProperty } from '@/utils/utils'
import formImg from '@/assets/icons/addtable2.png'
import myButton from '@/components/buttons/myButton.vue'
import myTable from '@/components/table'
import addCrossFormModal from '@/views/dataCenter/centerLayout/modals/addCrossFormModal/index.vue'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore';
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const indicator = h(LoadingOutlined, {
    style: {
    fontSize: '14px',
    },
    spin: true,
});
const formState = reactive({
    updatePolicy: 'REALTIME_UPDATE'
})

const useModalStore = modalStore()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { addCrossFormModalVisible } = storeToRefs(useModalStore)
const { activeTabKey, addDataMode, indexTableDesc, crossFormList, systemConfig, isEmptyImport } = storeToRefs(useMainStore)

const props = defineProps({
    height: {}
})

const state = reactive({
    name: '',
    desc: '',
    searchText: '',
    searchBackText: '',
    activeKey: '',
    showClearImg: false,
    treeSpinning: false,
    type: 0,
    treeList: [],
    columns: [],
    tableData: [],
    importList: [],
    tableSpinning: false,
    importLoading: false,
    start: 0,
    end: 11,
    itemHeight: 50,
    noSelectList: [],
    formPageNum: 1,
})
const listWrap = ref() 
const scorllList = ref()
const isSelectAll = ref(false) // 是否全选
const tableLoading = ref(false) // 加载更多
const totalPage = ref(0) // 总页数
const formTotal = ref(0) // 表单总数
const isSearch = ref(false) // 是否搜索状态
const hasImportCount = ref(0) // 已经导入过的表
onMounted(() => {
    getTreeData()
})

const iptDisable = computed(() => {
    if (state.importList.length > 1) return true
    return false
})

const selectedNum = computed(() => {
    if (isSelectAll.value) {
        return formTotal.value - state.noSelectList.length - hasImportCount.value
    } else {
        return state.importList.length
    }
})
const scrollBarHeight = computed(() => {
    return (state.treeList.length * 50) + 'px'
})
const showList = computed(() => {
    return state.treeList
})
watch(
    () => state.searchText,
    (val) => {
        if (!val.trim()) {
            if (isSearch.value) {
                onSearch()
                isSearch.value = false
            }
        }
    }
)
const onSearch = () => {
    isSearch.value = true
    resetState()
    getTreeData()
    state.searchBackText = state.searchText
}
const scrollListener = () => {
    let {clientHeight, scrollTop, scrollHeight} = scorllList.value
    if (scrollHeight - scrollTop <= clientHeight + 80) {
        if (state.formPageNum === totalPage.value || state.type === 2) return
        state.formPageNum++
        getTreeData('scroll')
    }
}
const getTreeData = (from) => {
    if (from !== 'scroll') {
        state.treeSpinning = true
    } else {
        tableLoading.value = true
    }
    let api = null
    let params = null
    if(state.type !== 2){
        params = {
            name: state.searchText.trim(),
            formType: state.type,
            cpage: state.formPageNum,
            pageSize: 50
        }
        api = getFormListInFid
    } else {
        // 跨表单导入
        const formIdList = toRaw(crossFormList.value)
        params = {
            name: state.searchText.trim(),
            forms: formIdList,
            cpage: state.formPageNum,
            pageSize: 50
        }
        api = getCrossFormList
    }
    api(params).then((res) => {
        if (res.code == 1) {
            state.treeList = filterArrByProperty([...state.treeList, ...res.data ], 'formId', 'subForm')
            if (isSelectAll.value) {
                state.treeList.filter(i => i.addStatus != 1).forEach(item => {
                    item.isSelect = true
                })
            }
            totalPage.value = res.extendData?.totalPage
            formTotal.value = res.extendData?.total
            hasImportCount.value = res.extendData?.hasImportCount
        } else {
            message.error(res.message)
        }
        state.treeSpinning = false
        tableLoading.value = false
    })
}

const resetState = () => {
    state.columns = []
    state.tableData = []
    state.importList = []
    state.treeList = []
    state.name = ''
    state.desc = ''
    state.activeKey = ''
    isSelectAll.value = false
    totalPage.value = 0
    formTotal.value = 0
    state.noSelectList = []
    state.formPageNum = 1
}
const changeTabs = (type) => {
    state.type = type
    state.searchText = ''
    resetState()
    let forms = []
    if(crossFormList.value.length > 0){
        forms = crossFormList.value.filter(item => item.fid!=='' || item.formId!=='')
    }
    if(type !== 2 || forms.length > 0){
        getTreeData()
    }
}

const onSelect = (record, type) => {
    if (type === 1) {
        record.isSelect = !record.isSelect
        let temp = []
        if (state.importList.length > 0) {
            temp = state.importList.filter((item) => item.formId != record.formId)
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
                state.name = temp[0].comment
            } else if (record.isSelect) {
                state.name = record.comment
            } else {
                state.name = ''
            }
        }
        if (isSelectAll.value) {
            let temp1 = []
            if (state.noSelectList.length > 0) {
                temp1 = state.noSelectList.filter((item) => item.formId != record.formId)
                if (!record.isSelect) {
                    state.noSelectList = [...temp1, record]
                } else {
                    state.noSelectList = temp1
                }
            } else {
                state.noSelectList.push(record)
            }
            if (state.importList.length === 0) {
                isSelectAll.value = false
            }
        }
    } else {
        // if (record.addStatus == 1) return
        state.columns = []
        if (record.fields.length > 0) {
            record.fields.forEach((item) => {
                item.dataIndex = item.name
                item.columnAlias = item.comment
                item.imgType = getimgType(item.fieldType)
            })
        }
        state.columns = record.fields
        state.activeKey = record.tableName
        let jsonData = {
            formId: parseInt(record.formId),
            formType: parseInt(record.formType),
            curTableName: record.tableName,
            allField: record.allField.join(','),
        }
        if(state.type === 2){
            jsonData.fid = parseInt(record.fid)
        }
        state.tableSpinning = true
        getTableData(jsonData).then((res) => {
            if (res.code == 1 && res.data && res.data.length > 0) {
                const data = res.data.map((item) => {
                    if (item.length) {
                        const temp = item.map((citem) => {
                            return {
                                [citem.name]: citem.value,
                            }
                        })
                        let obj = {}
                        temp.forEach((i) => {
                            for (let key in i) {
                                obj[key] = i[key]
                            }
                        })
                        return obj
                    }
                })
                state.tableData = data
            } else {
                // state.columns = []
                state.tableData = []
            }
            state.tableSpinning = false
        })
    }
}
const selectAll = (type) => {
    if (type === 1) {
        state.treeList.filter(i => i.addStatus != 1).forEach(item => {
            item.isSelect = true
        })
        state.importList = state.treeList.filter(i => i.addStatus != 1) // 过滤掉不可导入的数据
        state.name = ''
        state.desc = ''
        isSelectAll.value = true
        state.noSelectList = []
    } else {
        state.treeList.filter(i => i.addStatus != 1).forEach(item => {
            item.isSelect = false
        })
        state.importList = []
        isSelectAll.value = false
    }
}

const onDebounceSelect = _.debounce(onSelect, 200)
const importFile = () => {
    if (!state.name && state.importList.length < 2 && addDataMode.value !== 'import') {
        return message.warn(t('common.pleaseEnterName'))
    }
    if (!state.importList.length) {
        return message.warn(t('common.pleaseSelectTable'))
    }
    let api = null
    const jsonData = {
        comment: state.name,
        desc: state.desc,
        formIds: state.importList.map((i) => i.formId).join(','),
        formType: state.type,
        groupId: activeTabKey.value,
        updatePolicy: formState.updatePolicy,
        isAll: isSelectAll.value ? 1 : 0,
        name: state.searchBackText,
        excludeFormIds: state.noSelectList.map(i => i.formId).join(',')
    }

    if (addDataMode.value === 'import') {
        jsonData.comment = indexTableDesc.value.tableAlias
        jsonData.desc = indexTableDesc.value.description
        jsonData.groupId = indexTableDesc.value.groupId
        jsonData.emptyTableId = indexTableDesc.value.id
    }
    if(state.type === 2 ){
        jsonData.forms = state.importList.map((i) => {
            return i = {
                formId: i.formId,
                fid: i.fid,
                formType: i.formType,
            }
        })
        api = importCrossForm
    } else {
        jsonData.isComingEmptyImport = isEmptyImport.value
        api = importForm
    }
    state.importLoading = true
    api(jsonData).then((res) => {
        if (res.code == 1) {
            useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
            useMainStore.selectTabs({
                id: activeTabKey.value,
            }, 'import')
            useMainStore.setPageId('pageTable')
            message.success(res.message)
            useApiManageStore.initRedDot()
        } else {
            message.error(res.message)
        }
        state.importLoading = false
    })
}
const goBack = () => {
    useMainStore.setPageId('pageTable')
}

onUnmounted(()=>{
    useMainStore.setCrossFormList([])
})

const addCrossForm = ()=>{
    useModalStore.changeAddCrossFormModalVisible()
}

const modalConfirm = ()=>{
    resetState()
    getTreeData()
}
</script>

<style lang="less" scoped>
.formPage {
    font-family: 'PingFang SC';
    font-style: normal;
    height: 100%;

    .formHead {
        width: 100%;
        height: 165px;
        background-color: #fff;
        margin-bottom: 12px;

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

                .iptGroup {
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
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;

                .update {
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-top: 16px;

                    .text3 {
                        margin-left: 4px;
                    }
                }
            }
        }
    }

    .formBody {
        display: flex;
        height: calc(100% - 175px);
        // overflow-y: scroll;

        .leftTree {
            width: 240px;
            height: 100%;
            background-color: #fff;
            .ant-spin-nested-loading {
                height: calc(100% - 150px);
                .ant-spin-container {
                    height: 100%;
                }
            }

            .treehead {
                display: flex;
                flex-direction: row;
                align-items: center;
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
                    margin-right: 16px;
                    cursor: pointer;
                }

                .tab3 {
                    cursor: pointer;
                }

                .tabline {
                    width: 100%;
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

            .select-all {
                width: 240px;
                height: 38px;
                padding: 0px 16px 0px 12px;
                display: flex;
                flex-direction: row;
                align-items: center;
                // margin-top: 10px;
                .check-img {
                    width: 15.5px;
                    margin-right: 8px;
                    cursor: pointer;
                }
            }

            .search {
                width: 240px;
                height: 46px;
                padding: 8px 12px;
                position: relative;

                input {
                    width: 216px;
                    height: 30px;
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

            .addCrossForm{
                display:flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #C3D4F6;
                border-radius: 4px;
                padding: 4px 0;
                margin: 0px 12px;
                cursor: pointer;
                height: 28px;
                .add-img{
                    margin-right: 6px;
                    width: 16px;
                    height: 16px;
                }
                .txt{
                    color: #67A2FD;
                }
            }

            .wrapList {
                position: relative;
                overflow-y: scroll;
                overflow-x: clip;
            }


            .treeUl {
                width: 240px;
                height: calc(100% - 188px);
                font-weight: 400;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                margin: 0;
                overflow: hidden auto;

                // -ms-overflow-style: none;
                // overflow: -moz-scrollbars-none;
                img {
                    width: 18px;
                    margin-right: 4px;
                    margin-left: 8px;
                }

                li {
                    width: 240px;
                    min-height: 50px;
                    max-height: 60px;
                    padding: 0px 16px 0px 12px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    position: relative;

                    .checkIpt {
                        width: 16px;
                        height: 16px;
                        margin: 0;
                    }

                    .formImg {
                        width: 18px;
                        height: 20px;
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
            }

            .addTreeUl{
                height: calc(100% - 216px);
            }

            .loading-text {
                color: rgba(0, 0, 0, 0.4);
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 15px 0;
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

    .table-con {
        padding: 0px 10px;
        width: calc(100vw - 475px);
        height: 100%;
        background-color: #fff;

        .ant-spin-nested-loading {
            height: 100%;
            :deep(.ant-spin-container) {
                height: 100%;
            }
        }
       p {
            width: 215px;
            float: right;
            margin-right: 12px;
            margin-top: 12px;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            text-align: right;
        }
       .tables {
            width: calc(100vw - 485px);
            height: 93%;
            overflow: scroll;
       }
    }
}
</style>
