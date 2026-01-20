<template>
    <div class="apiAddModal">
        <div class="maskLayer"></div>
        <div class="popDiv">
            <div class="popuHead">
                <span class="popClose fr" @click="useModalStore.changeApiAddModalVisible()"><img style="width: 16px"
                        src="@/assets/icons/close.png" /></span>
                <p class="fl colorDeep">{{ props.operFlag === 'add' ? '添加' : t('common.edit') }}</p>
            </div>

            <div class='modalBody' :style="{overflowY: activeKey == 0 ? 'scroll' : ''}">
                <div class="progress-line" v-if="props.operFlag === 'add'">
                    <div :class="[activeKey !== 0 ? 'pro-box first-gray' : 'pro-box first-blue']">
                        <div :class="[activeKey !== 0 ? 'cricle gray-bgc' : 'cricle blue-bgc']">
                            <div style="width: 37%;height: 105%;">1</div>
                        </div>
                        <span :class="[activeKey !== 0 ? 'blue-text' : 'gray-text']">基本信息</span>
                    </div>
                    <div :class="[activeKey !== 1 ? 'pro-box third-gray' : 'pro-box third-blue']"
                        style="margin-left: -15px">
                        <div :class="[activeKey !== 1 ? 'cricle gray-bgc' : 'cricle blue-bgc']">
                            <div style="width: 37%;height: 105%;">2</div>
                        </div>
                        <span :class="[activeKey !== 1 ? 'blue-text' : 'gray-text']">选择数据</span>
                    </div>
                    <div :class="[activeKey !== 2 ? 'pro-box second-gray' : 'pro-box second-blue']"
                        style="margin-left: -15px">
                        <div :class="[activeKey !== 2 ? 'cricle gray-bgc' : 'cricle blue-bgc']">
                            <div style="width: 37%;height: 105%;">3</div>
                        </div>
                        <span :class="[activeKey !== 2 ? 'blue-text' : 'gray-text']">筛选</span>
                    </div>
                </div>
                <div class="data-area" v-if="activeKey === 0">
                    <div class="form-area">
                        <a-form ref="formRef" :model="formState" v-bind="layout">
                            <a-form-item name="apiType" :label="t('apiManage.apiType')" :rules="[{ required: true, message: '请选择接口类型' }]">
                                <a-radio-group v-model:value="formState.apiType">
                                    <a-radio :value="0">{{ t('apiManage.normalApi') }}</a-radio>
                                    <a-radio :value="1">{{ t('apiManage.bigScreenApi') }}</a-radio>
                                </a-radio-group>
                            </a-form-item>
                            <a-form-item name="apiName" :label="t('apiManage.apiName')" :rules="[{ required: true, message: t('apiManage.enterApiName') }]">
                                <input class="ipt1" :placeholder="t('common.pleaseEnter')" type="text" v-model.trim="formState.apiName">
                            </a-form-item>
                            <a-form-item name="apiDesc" :label="t('apiManage.apiDesc')" :rules="[{ required: true, message: t('apiManage.enterApiDesc')}]">
                                <textarea class="ipt2" :placeholder="t('common.pleaseEnter')" v-model.trim="formState.apiDesc"></textarea>
                            </a-form-item>
                            <a-form-item name="resTemplateId" :label="t('apiManage.selectTemplate')">
                                <a-select 
                                    allowClear
                                    :notFoundContent="t('common.noData')" 
                                    showSearch
                                    :filter-option="filterOption"
                                    :options="templateList"
                                    v-model:value="formState.resTemplateId"
                                    style="width: 415px;"
                                >
                                    <!-- <a-select-option v-for="item in templateList" :key="item.id" :value="item.id">
                                        {{ item.templateName }}
                                    </a-select-option> -->
                                </a-select>
                            </a-form-item>
                        </a-form>
                    </div>
                </div>
                <div class="select-code" v-if="activeKey === 1">
                    <div class='leftTree'>
                        <div class='search'>
                            <input type="text" @keyup.enter="onSearch" v-model="state.searchText" placeholder='搜索' />
                            <img class="sear" src="@/assets/icons/search.png" alt="" />
                        </div>
                        <ul class="table-list" v-show="state.searchText.trim()">
                            <li v-for="item in state.tableList"
                                :class="[item.id === state.tableId ? 'tableLi activeTable' : 'tableLi']" :key="item.id"
                                @click="onTableSelect(item)">
                                <div class="text-box">
                                    <img class="lefticon" :src="item.imgSrc" alt="">
                                    <a-tooltip>
                                        <template #title>{{ item.tableAlias }}</template>
                                        <span class="text-long">{{ item.tableAlias }}</span>
                                    </a-tooltip>
                                </div>
                            </li>
                        </ul>
                        <div class="table-list" v-show="!state.searchText.trim()">
                            <a-tree 
                                :tree-data="state.leftMenuList" 
                                :defaultExpandAll="true"
                                :selectedKeys="state.selectedKeys"
                                @select="onSelect" 
                                @expand="onExpand" 
                            />
                        </div>
                    </div>
                    <div class='rightArea'>
                        <div class='centerCode'>
                            <div class='code_header'>
                                <div class='search' v-if="state.codeList.length > 0">
                                    <input type="text" v-model="state.codeText" placeholder='搜索' />
                                    <img class="sear" src="@/assets/icons/search.png" alt="" />
                                </div>
                                <div class='title'>选择字段</div>
                            </div>
                            <a-spin :spinning="state.codeListLoading">
                                <ul class='codeUl'>
                                    <template v-if="state.codeList.length > 0 || state.searching">
                                        <div class="select-all">
                                            <img @click="selectAll(1)" v-if="selectedNum === 0" style="width: 16px"
                                                src="@/assets/icons/not_select.png" alt="">
                                            <img @click="selectAll(2)" v-else-if="selectedNum === state.codeBackList.length"
                                                style="width: 16px" src="@/assets/icons/is_select.png" alt="">
                                            <img @click="selectAll(3)" v-else style="width: 16px"
                                                src="@/assets/icons/doing_select.png" alt="">
                                            全选
                                        </div>
                                        <template v-for="item in state.codeList" :key="item.id">
                                            <li class='codeLi' @click="selectCode(item)">
                                                <input type="checkbox" :checked="item.isSelect" />
                                                <img :src="item.imgType == 'textImg' ? text_img : (item.imgType == 'numImg' ? num_img : time_img)"
                                                    alt="" />
                                                <a-tooltip :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                                                    <template #title>
                                                        {{item.columnAlias || item.columnName}}
                                                    </template>
                                                    <span>
                                                        {{item.columnAlias || item.columnName}}
                                                    </span>
                                                </a-tooltip>
                                            </li>
                                        </template>
                                    </template>
                                    <div v-else class='codeBlank'>
                                        <div class='box'>
                                            <img :src="selectblank1" alt="" />
                                            <div class='text'>请在左侧选择数据表</div>
                                        </div>
                                    </div>
                                </ul>
                            </a-spin>
                        </div>
                        <div class="table">
                            <a-spin :spinning="state.tableLoading">
                                <div class='rightTable'>
                                    <div class="tableBlock" v-if="state.previewColumns.length">
                                        <myTable 
                                            :tableColumns="state.previewColumns" 
                                            :tableData="state.previewTableData"
                                        />
                                    </div>
                                    <div class='tableBlank' v-else-if="(!state.previewColumns.length && !state.tableLoading)">
                                        <div class='box'>
                                            <img :src="selectblank1" alt="" />
                                            <div class='text'>请在左侧选择数据表</div>
                                        </div>
                                    </div>
                                </div>
                            </a-spin>
                        </div>
                    </div>
                </div>
                <div v-if="activeKey === 2" style="height: calc(100% - 68px); overflow: scroll">
                    <FilterData 
                        ref="filterDataRef"
                        :tableLoading="state.tableLoading"
                        :previewColumns="state.previewColumns"
                        :previewTableData="state.previewTableData"
                        @getFilterTableData="getFilterTableData"
                    />
                </div>
            </div>

            <div class="shadowBox popuBottom" style="height: 63px;">
                <!-- <myButton class="fr mr25" @click="onOk" type="primary">{{ (activeKey !== 2 && props.operFlag === 'add') ? '下一步' : '确定' }}</myButton> -->
                <myButton class="fr mr25" @click="onOk" type="primary">{{ t('common.confirm') }}</myButton>
                <!-- <myButton class="fr mr25" @click="cancel">{{ activeKey === 0 ? '取消' : '上一步' }}</myButton> -->
                <myButton class="fr mr25" @click="cancel">{{ t('common.cancel') }}</myButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch, provide } from 'vue'
import { storeToRefs } from 'pinia';
import { modalStore } from '@/Stores/modalStore';
import { apiManageStore } from '@/Stores/apiManageStore'
import { createApi, editApi } from '@/apis/apiManage'
import myButton from '@/components/buttons/myButton.vue';
import myTable from '@/components/table';
import FilterData from './fliter.vue'
import { getTableImg, getimgType, getCodeType,apiSymbolKey } from '@/utils/utils';
import { getCodeList, getPreviewData } from '@/apis/config';
import { getTableList, getGroupListApi } from '@/apis/group';
import num_img from '@/assets/icons/num_img.png'
import text_img from '@/assets/icons/text_img.png'
import time_img from '@/assets/icons/time_img.png'
import flieImg from '@/assets/icons/file.png'
import selectblank1 from '@/assets/images/img_null1.png'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const useModalStore = modalStore()
const useApiManageStore = apiManageStore()
const { templateList } = storeToRefs(useApiManageStore)
const activeKey = ref(0)
const formRef = ref()
const filterDataRef = ref()
const formState = reactive({
    apiName: '',
    apiDesc: '',
    apiType: 0,
    resTemplateId: ''
})
const state = reactive({
    searchText: '',
    selectedKeys: [],
    codeList: [],
    codeBackList: [],
    previewColumns: [],
    tableList: [],
    searching: false,
    previewTableData: [],
    leftMenuList: [],
    codeListLoading: false,
    tableLoading: false,
    tableId: '',
    codeText: '',
    selectedTable: {}
})
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
const layout = {
    labelCol: { span: 6 },

}
const selectedCode = computed(() => {
    return state.codeBackList.filter(i => i.isSelect)
})
onMounted(async () => {
    if (props.operFlag === 'edit') {
        editInitPage()
    } else {
        initLeftList()
    }
    useApiManageStore.initTemplateList()
})
const selectedNum = computed(() => {
    return state.codeBackList.filter(i => i.isSelect).length
})
watch(() => state.searchText, val => {
    if (val.trim()) {
        const jsonData = {
            tableAlias: state.searchText,
            groupId: '',
            pageSize: 100000,
            pageNum: 1
        }
        newGetTableList(jsonData)
    } else {
        state.tableList = []
    }
})
watch(() => state.codeText, val => {
    if (!val.trim()) {
        state.codeList = state.codeBackList
        state.searching = false
    } else {
        state.searching = true
        state.codeList = state.codeBackList.filter(item => 
            item.columnAlias ? item.columnAlias.indexOf(val.trim()) > -1 : item.columnName.indexOf(val.trim()) > -1
        )
    }
})
provide(apiSymbolKey, reactive({
    selectedCode: selectedCode
}))
const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const onSearch = () => {
    const jsonData = {
        tableAlias: state.searchText,
        groupId: '',
        pageSize: 100000,
        pageNum: 1
    }
    newGetTableList(jsonData)
}
const editInitPage = () => {
    formState.apiDesc = props.editData.apiDesc
    formState.apiName = props.editData.apiName
    formState.apiType = props.editData.apiType.value || 0
    formState.resTemplateId = props.editData.resTemplateId || ''
    state.selectedKeys = [props.editData.tableId]
    state.tableId = props.editData.tableId
    state.selectedTable = props.editData
    // getTableCodeList({
    //     tableId: props.editData.tableId
    // })
    // const ids = props.editData.columnIds.split(',')
    // setTimeout(() => {
    //     let columns = []
    //     state.codeBackList.forEach(item => {
    //         ids.forEach(itemId => {
    //             if (item.id === itemId) {
    //                 item.isSelect = true
    //                 columns.push(item.columnName)
    //             }
    //         })
    //     })
    //     const selectConfig = {
    //         action: "select",
    //         contents: {
    //             tableId: props.editData.tableId, //表ID
    //             columns//用户选择的列名
    //         }
    //     }
    //     getTableData([selectConfig])
    // }, 130)
}
const newGetTableList = (jsonData) => {
    getTableList(jsonData).then(res => {
        if (res.code == 1) {
            res.data.records.forEach(item => {
                item.imgSrc = getTableImg(item.tableType)
            })
            state.tableList = res.data.records
        } else {
            message.error(res.message)
        }
    })
}
const initLeftList = () => {
    getGroupListApi().then(res => {
        if (res.code == 1) {
            res.data.length && res.data.forEach(item => {
                item.title = <span className='outTreeTitle'>{item.name}</span>
                item.key = item.id
                if (item.subList.length) {
                    item.subList.forEach(citem => {
                        citem.title = <div className='child'><img style={{ width: '16px', marginRight: '4px' }} src={flieImg} />{citem.name}</div>
                        citem.key = citem.id
                        const params = {
                            groupId: citem.id,
                            pageSize: 100000,
                            pageNum: 1
                        }
                        getTableList(params).then(res => {
                            if (res.code == 1) {
                                res.data.records.forEach(temp => {
                                    temp.key = temp.id
                                    temp.imgSrc = getTableImg(temp.tableType)
                                    temp.title = <div className='text-box'>
                                        <img className={'lefticon'} src={temp.imgSrc} alt="" />
                                        <span className={'text-long'}>{temp.tableAlias}</span>
                                    </div>
                                })
                                citem.children = res.data.records
                            }
                        })
                    })
                } else {
                    const params = {
                        groupId: item.id,
                        pageSize: 100000,
                        pageNum: 1
                    }
                    getTableList(params).then(res => {
                        if (res.code == 1) {
                            res.data.records.forEach(temp => {
                                temp.key = temp.id
                                temp.imgSrc = getTableImg(temp.tableType)
                                temp.title = <div className='text-box'>
                                    <img className={'lefticon'} src={temp.imgSrc} alt="" />
                                    <span className={'text-long'}>{temp.tableAlias}</span>
                                </div>
                            })
                            item.children = res.data.records
                        }
                    })
                    item.isLeaf = true
                }
                item.children = item.subList
            })
            nextTick(() => {
                state.leftMenuList = res.data
            })
        }
    })
}
const cancel = () => {
    if (activeKey.value === 1) {
        activeKey.value = 0
        return
    } else if (activeKey.value === 2) {
        activeKey.value = 1
        selectCode()
        return
    } else {
        useModalStore.changeApiAddModalVisible()
    }
}
const onOk = () => {
    if (activeKey.value === 0) {
        formRef.value.validateFields().then((res) => {
            if (res) {
                // 如果是编辑，只显示第一步
                if (props.operFlag === 'edit') {
                    const paramsData = {
                        apiDesc: formState.apiDesc,
                        apiName: formState.apiName,
                        apiType: formState.apiType,
                        resTemplateId: formState.resTemplateId || '',
                        columnIds: props.editData.columnIds,
                        fid: props.editData.fid,
                        id: props.editData.id,
                        version: props.editData.version,
                        tableId: props.editData.tableId,
                        queryConfig: props.editData.queryConfig
                    }
                    editApi(paramsData).then(res => {
                        if (res.code == 1) {
                            message.success(res.message)
                            useApiManageStore.initApiList()
                            useModalStore.changeApiAddModalVisible()
                        } else {
                            message.error(res.message)
                        }
                    })
                } else {
                    activeKey.value = 1
                }
            }
        })
    } else if(activeKey.value === 1) {
        const data = state.codeBackList.filter(i => i.isSelect)
        if(!data.length) return message.warn('请选择字段')
        activeKey.value = 2
    } else {
        // return
        const selectedData = state.codeBackList.filter(i => i.isSelect)
        if (selectedData.length) {
            const { fid, id } = state.selectedTable
            const paramsData = {
                apiDesc: formState.apiDesc,
                apiName: formState.apiName,
                apiType: formState.apiType,
                resTemplateId: formState.resTemplateId || '',
                columnIds: selectedData.map(i => i.id).join(','),
                fid,
                tableId: state.selectedTable.tableId ? state.selectedTable.tableId : id,
                queryConfig: JSON.stringify([{
                    action: "where",
                    contents: filterDataRef.value.sortItemList
                }])
            }
            createApi(paramsData).then(res => {
                if (res.code == 1) {
                    message.success(res.message)
                    useApiManageStore.initApiList('update')
                    useModalStore.changeApiAddModalVisible()
                } else {
                    message.error(res.message)
                }
            })
        } else {
            message.warn('请选择字段')
        }
    }
}
const onTableSelect = (record) => {
    state.selectedKeys = [record.id]
    state.selectedTable = record
    state.tableId = record.id
    getTableCodeList({
        tableId: record.id
    })
}
const onSelect = (record, selectedNodes) => {
    if (selectedNodes.node.dataRef.pid) return
    state.selectedKeys = record
    state.tableId = record[0]
    if (record.length) {
        state.selectedTable = selectedNodes.node.dataRef
        const params = {
            tableId: record[0]
        }
        getTableCodeList(params)
    } else {
        state.codeList = []
        state.codeBackList = []
        state.previewColumns = []
        state.previewTableData = []
    }
}
const getTableCodeList = (params) => {
    state.codeListLoading = true
    state.codeList = []
    state.codeBackList = []
    getCodeList(params).then(res => {
        if (res.code == 1) {
            res.data.length && res.data.forEach(item => {
                item.isSelect = false
                item.imgType = getimgType(item.columnType)
                item.type = getCodeType(item.columnType)
            })
            state.codeList = res.data
            state.codeBackList = state.codeList
        } else {
            // message.error('服务器暂时异常,请重新尝试')
        }
        state.previewColumns = []
        state.previewTableData = []
        state.codeListLoading = false
    })
}
const selectCode = (record) => {
    if(record) {
        record.isSelect = !record.isSelect
    }
    let columns = []
    state.codeBackList.forEach(item => {
        if (item.isSelect) {
            columns.push(item.columnName)
        }
    })
    const selectConfig = {
        action: "select",
        contents: {
            tableId: state.tableId, //表ID
            columns//用户选择的列名
        }
    }
    getTableData([selectConfig])
}
const onExpand = () => {

}
const selectAll = type => {
    if (type === 1) {
        state.codeBackList.forEach(item => {
            item.isSelect = true
        })
        const selectConfig = {
            action: "select",
            contents: {
                tableId: state.tableId
            }
        }
        getTableData([selectConfig])
    } else {
        state.codeBackList.forEach(item => {
            item.isSelect = false
        })
        const selectConfig = {
            action: "select",
            contents: {
                tableId: state.tableId,
                columns: []
            }
        }
        getTableData([selectConfig])
    }
}
// 获取筛选数据
const getFilterTableData = info => {
    let columns = []
    state.codeBackList.forEach(item => {
        if (item.isSelect) {
            columns.push(item.columnName)
        }
    })
    const selectConfig = {
        action: "select",
        contents: {
            tableId: state.tableId, //表ID
            columns//用户选择的列名
        }
    }
    getTableData([selectConfig, info])
}
const getTableData = (selfConfig) => {
    state.tableLoading = true
    state.previewColumns = []
    state.previewTableData = []
    getPreviewData(selfConfig).then(res => {
        if (res.code == 1) {
            const columns = res.data.targetTableColumns
            for (let key in columns) {
                columns[key].dataIndex = key
                columns[key].imgType = getimgType(columns[key].columnType)
                state.previewColumns.push(columns[key])
            }
            state.previewTableData = res.data.queryResult || []
        } else {
            // message.error('获取数据异常，请重新再试')
        }
        state.tableLoading = false
    })
}

</script>

<style lang="less" scoped>
.apiAddModal {
    font-family: 'PingFang SC';
    font-style: normal;
    width: 100%;
    :deep(.ant-tree-title) {
        .text-box {
            display: inline-block;
            height: 40px;
            display: flex;
            align-items: center;
            margin-left: -20px;
        }

        .text-long {
            width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .lefticon {
            width: 16px;
            margin-right: 4px;
        }
        .child {
            max-width: 140px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            img {
                display: none;
            }
        }
        .outTreeTitle {
            max-width: 140px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden; 
        }
    }

    .modalBody {
        height: 500px;
        width: 680px;
        display: flex;
        padding-left: 35px;
        .progress-line {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px 10px;
            gap: 10px;
            height: 68px;

            .pro-box {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 164px;
                height: 36px;
                cursor: pointer;
            }

            .first-gray {
                background-image: url(@/assets/images/first_step_gray.png);
                background-size: contain;
            }

            .second-gray {
                background-image: url(@/assets/images/second_step_gray.png);
                background-size: contain;
            }
            
            .third-gray {
                background-image: url(@/assets/images/center-step-gray.png);
                background-size: contain;
            }

            .first-blue {
                background-image: url(@/assets/images/first_step_blue.png);
                background-size: contain;
            }

            .second-blue {
                background-image: url(@/assets/images/second_step_blue.png);
                background-size: contain;
            }

            .third-blue {
                background-image: url(@/assets/images/center-step-blue.png);
                background-size: contain;
            }

            .blue-text {
                font-size: 14px;
                color: #8A8B99;
            }

            .gray-text {
                color: #1E6FFA;
                font-size: 14px;
            }

            .blue-bgc {
                background: rgba(30, 111, 250, 0.7)
            }

            .gray-bgc {
                background: #ACB4BF;
            }

            .cricle {
                border-radius: 18px;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-weight: 600;
                font-size: 12px;
                margin-right: 8px;
            }
        }

        .data-area {
            height: 40vh;
            margin-top: 30px;
            display: flex;
            justify-content: center;

            .form-area {

                .ipt1 {
                    width: 412px;
                    height: 32px;
                }

                .ipt2 {
                    width: 412px;
                    height: 200px;
                    border: none;
                    padding: 7px 8px 7px 12px;
                    background-color: #F3F3F3;
                }
            }
        }

        .select-code {
            height: calc(100% - 68px);
            display: flex;
            background: #EEF0F5;

            .leftTree {
                width: 200px;
                height: 99%;
                background: #fff;

                .table-list {
                    height: calc(100% - 44px);
                    -ms-overflow-style: none;
                    overflow: -moz-scrollbars-none;
                    overflow: scroll;
                    .tableLi {
                        padding: 0px 12px 0px 20px;
                        width: 240px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        cursor: pointer;

                        .text-box {
                            display: inline-block;
                            height: 50px;
                            display: flex;
                            align-items: center;
                        }

                        .text-long {
                            width: 140px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .lefticon {
                            width: 16px;
                            margin-right: 4px;
                        }
                    }

                    .tableLi:hover {
                        background: rgba(61, 130, 242, 0.1);
                    }

                    .activeTable {
                        background: rgba(61, 130, 242, 0.1);
                    }
                }
                .table-list::-webkit-scrollbar {
                    width: 0 !important;
                }

                .child {
                    height: 20px;
                    display: flex;
                    align-items: center;
                }

                .search {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    padding: 8px 12px;
                    gap: 10px;
                    width: 180px;
                    height: 44px;
                    position: relative;

                    input {
                        width: 180px;
                        height: 30px;
                    }

                    .sear {
                        width: 16px;
                        position: absolute;
                        top: 14px;
                        right: 5px;
                        cursor: pointer;
                    }
                }
            }

            :deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
                margin-left: -25px;
                padding-left: 28px;
                background: rgba(61, 130, 242, 0.1);
            }

            .rightArea {
                width: calc(100% - 200px);
                height: 99%;
                border: 8px solid #EEF0F5;
                border-bottom: none;
                display: flex;

                .centerCode {
                    width: 200px;
                    background-color: #fff;
                    margin-right: 8px;

                    .code_header {
                        .search {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                            padding: 8px 12px;
                            gap: 10px;
                            width: 200px;
                            height: 44px;
                            position: relative;

                            input {
                                width: 176px;
                                height: 30px;
                            }

                            .sear {
                                width: 16px;
                                position: absolute;
                                top: 14px;
                                right: 22.6px;
                                cursor: pointer;
                            }
                        }

                        .title {
                            padding: 0px 12px;
                            width: 200px;
                            height: 32px;
                            line-height: 32px;
                        }
                    }
                    
                    .ant-spin-nested-loading {
                        height: calc(100% - 76px);
                        :deep(.ant-spin-container) {
                            height: 100%;
                        }
                    }

                    .codeUl {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        overflow: scroll;
                        -ms-overflow-style: none;
                        overflow: -moz-scrollbars-none;

                        .select-all {
                            width: 200px;
                            height: 40px;
                            padding: 0px 16px 0px 12px;
                            display: flex;
                            flex-direction: row;
                            align-items: center;

                            img {
                                margin-right: 8px;
                                cursor: pointer;
                            }
                        }

                        .codeLi {
                            height: 36px;
                            display: flex;
                            align-items: center;
                            padding: 0px 16px 0px 12px;
                            cursor: pointer;

                            img {
                                width: 22px;
                                height: 16px;
                                margin: 0px 8px;
                            }

                            input {
                                width: 16px;
                                height: 16px;
                            }

                            span {
                                display: inline-block;
                                width: 200px;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                        }
                    }

                    .codeUl::-webkit-scrollbar {
                        width: 0 !important;
                    }
                }

                .table {
                    height: 100%;
                    width: calc(100% - 200px);
                    .ant-spin-nested-loading {
                        height: 100%;
                        width: 100%;
                        :deep(.ant-spin-container) {
                            height: 100%;
                            width: 100%;
                        }
                    }
                }

                .rightTable {
                    height: 100%;
                    width: 100%;
                    background-color: #fff;
                    .tableBlock {
                        height: 100%;
                        overflow: scroll;
                        padding: 0px 10px;
                    }
                }
            }

            .codeBlank,
            .tableBlank {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
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
        }
    }
}
</style>