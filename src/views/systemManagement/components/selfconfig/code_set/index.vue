<template>
    <div class="codeSet">
        <div class="codeSelect">
            <div class="text">
                <span>{{ t('selfConfig.selectCode') }}</span>
                <!-- 推送管理显示同步按钮 -->
                <span class="asyncWrap" v-if="showAsync" @click="asyncFn">
                    <BiIcon name="refresh"/>
                    <a-tooltip placement="topLeft">
                        <template #title>
                            {{ t('pushManage.asyncTips') }}
                        </template>
                        <span>{{ t('pushManage.async2Step3') }}</span>
                    </a-tooltip>
                </span>
            </div>
            <div class="search">
                <input type="text" v-model="state.searchText" :placeholder="t('common.search')">
                <img class="sear" src="@/assets/icons/search.png" alt="">
            </div>
            <div class="myTable">
                <table ref="tableRef">
                    <colgroup>
                        <col :width="colWidths[0]" style="min-width: 50px;"/>
                        <col :width="colWidths[1]" />
                        <col :width="colWidths[2]" />
                        <col :width="colWidths[3]" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>
                                <div class="th-flex">
                                    <img @click="selectAll(1)" class="check-img" v-if="selectedNum === 0" src="@/assets/icons/not_select.png" alt="">
                                    <img @click="selectAll(2)" class="check-img" v-else-if="selectedNum === codeSetList.codeBackList.length" src="@/assets/icons/is_select.png" alt="">
                                    <img @click="selectAll(3)" class="check-img" v-else src="@/assets/icons/doing_select.png" alt="">
                                    <span>{{ t('common.codeName') }}</span>
                                </div>
                                <div class="resizerWrap">
                                    <span class="resizer"></span>
                                </div>
                            </th>
                            <th class="phyField">
                                {{ isFormPush ? t('api.fieldAlias') : t('api.phyFieldName')}}
                                <div class="resizerWrap">
                                    <span class="resizer"></span>
                                </div>
                                <a-tooltip destroyTooltipOnHide>
                                    <template #title>
                                        {{ isFormPush ? t('api.cxPhyFieldTips') : t('api.phyFieldTips') }}
                                    </template>
                                    <img src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                            </th>
                            <th>
                                {{ t('api.codeType') }}
                                <div class="resizerWrap">
                                    <span class="resizer"></span>
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <draggable
                        :list="codeSetList.codeList"
                        tag="tbody"
                        handle=".handle"
                        item-key="codeId"
                        drag-class="chosenClass"
                        @end="dragEnd"
                        >
                        <template #item="{ element, index }">
                            <tr :class="{'list-group-item': true, errorField: errorCodeCols.includes(element.columnName)}">
                                <td>
                                    <div class='name'>
                                        <img @click="codeSelect(element)" class="check-img" v-show="!element.isSelect" src="@/assets/icons/not_select.png" alt="">
                                        <img @click="codeSelect(element)" class="check-img" v-show="element.isSelect" src="@/assets/icons/is_select.png" alt="">
                                        <input ref="fieldInputRef" @blur="onIptBlur(element)" @input="inputFn(element, index)" class="ipt" v-if="element.isFieldRename" type="text" v-model="element.columnAlias" />
                                        <span class="columnName" :title="element.columnAlias || element.columnName" @click="rename(element, 'field')" v-else>{{ element.columnAlias || element.columnName }}</span>
                                        <img class="edit" src="@/assets/icons/edit1.png" alt="" @click="rename(element, 'field')">
                                    </div>
                                </td>
                                <td >
                                    <div :class="{phyName: true, isRepeat: index === repeatIndex}">
                                        <input ref="phyNameInputRef" @blur="onIptBlur(element)" @input="inputFn(element, index)" class="ipt" v-if="element.isPhyRename" type="text" v-model="element.newColumnName" />
                                        <div :title="element.newColumnName" @click="rename(element, 'phyName')" v-else>{{ element.newColumnName }}</div>
                                        <img class="edit" src="@/assets/icons/edit1.png" alt="" @click="rename(element, 'phyName')">
                                    </div>
                                </td>
                                <td class="type">
                                    <a-select  v-model:value="element.type" @select="(value,options) => onSelect(options, element, index)">
                                        <a-select-option 
                                            v-for="item in typeList" 
                                            :key="item.key" 
                                            :value="item.text"
                                            :disabled="optionDisabled(element, item)"
                                            :title="t(item.text)"
                                        >
                                            <span role="img">
                                                <BiIcon :name="item.iconName" :class="svgClass(item, element)"/>
                                            </span>
                                           <span class="cloName" :title="t(item.text)"> {{ t(item.text) }}</span>
                                        </a-select-option>
                                    </a-select>
                                </td>
                                <td class="handle"><img src="@/assets/icons/eightDot.png" /></td>
                            </tr>
                        </template>
                    </draggable>
                </table>
            </div>
        </div>
        <preview-table
            :tableLoading="tableLoading"
            :tableColumns="previewColumns"
            :tableData="previewData"
            :missingFields="stepError"
            :totalDataCount="totalDataCount"
        />
    </div>
</template>

<script setup>
import { reactive, watch, onMounted, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { apiManageStore } from '@/Stores/apiManageStore';
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
import { useI18n } from 'vue-i18n'
import { isEmptyObject } from '@/utils/utils'
import { useErrorStep } from '@/hooks/selfConfig/useApiErrorStep'
import previewTable from '@/components/selfconfig/previewTable'
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth'

const { t } = useI18n()
const useApiManageStore = apiManageStore()
const useApiConfigStore = apiConfigStore()
const { allConfigData, operActiveId, previewColumns, previewData, tableSource, tableLoading, leftMergeTable, headerInfo, totalDataCount } = storeToRefs(useApiConfigStore)
const { themeEditData } = storeToRefs(useApiManageStore)
const { stepError } = useErrorStep()

// 字段名是否发生变化
const fieldChange = ref(false)

const fieldInputRef = ref()
const phyNameInputRef = ref()
const repeatIndex = ref(-1) // 重复物理字段名索引
const tableRef = ref()
const colWidths = ref(['95','100','82', '12'])

// 获取主题的状态信息
const themeState = inject('themeState', undefined)

const asyncHandle = inject('asyncPushFields', false)
const showAsync = inject('showAsync', false)

const  hasChanged = ref(false)

// 推送平台是否为表单推送
const isFormPush = computed(() => {
    if(!themeState?.pushPlatformType)  return false
    return themeState.pushPlatformType === 4
})
const codeSetList = computed(() => {
    let exContentsMap = new Map();
    let obj = {
        codeList: [],
        codeBackList: [],
        previewColumns: [],
        previewData: []
    }

    if (!isEmptyObject(themeEditData.value)) {
        const hasExclude = themeEditData.value.queryConfig.find(item => item.uuid === operActiveId.value);
        if (hasExclude) {
            exContentsMap = new Map(hasExclude.excludeContents?.map(item => [item.column, item]));
        }
    }

    if (allConfigData.value.length > 0) {
        const foundItem = allConfigData.value.find(item => item.uuid === operActiveId.value);
        if (foundItem) {
            obj = foundItem;
        }
    }
    if(!hasChanged.value && obj.codeList.length>0){
        obj.codeList?.forEach(it => {
            if (it.newColumnName === undefined) {
                it.newColumnName = it.columnName;
            }
            if (exContentsMap.has(it.columnName)) {
                const matchingExItem = exContentsMap.get(it.columnName);
                Object.assign(it, matchingExItem);
            }
        });
        hasChanged.value = true
    } else {
        obj.codeList?.forEach(it => {
            if (it.newColumnName === undefined) {
                it.newColumnName = it.columnName;
            }
        });
    }
    // 手动添加uuid 避免字段id重复导致拖拽异常问题
    obj.codeList.map(it => {
        if(!it.codeId) {
            it.codeId = uuidv4()
        }
    })
    return obj;
});

const selectedNum = computed(() => {
    return codeSetList.value.codeBackList.filter(i => i.isSelect).length
})

const typeList = [{
    key: 'string',
    text: 'selfConfig.string',
    imgSrc: text_img,
    iconName: 'text',
},{
    key: 'datetime',
    text: 'selfConfig.datetime',
    imgSrc: time_img,
    iconName: 'time',
}, {
    key: 'date',
    text: 'selfConfig.date',
    imgSrc: time_img,
    iconName: 'time',
},{
    key: 'time',
    text: 'selfConfig.time',
    imgSrc: time_img,
    iconName: 'time',
},{
    key: 'numeric',
    text: 'selfConfig.numeric',
    imgSrc: num_img,
    iconName: 'number',
}, {
    key: 'bigint',
    text: 'selfConfig.bigint',
    imgSrc: num_img,
    iconName: 'number',
}]

const state = reactive({
    showClearImg: false,
    searchText: '',
    day: 'tom',
    codeTypeList: []
})

// 拖拽列宽逻辑处理
useChangeColWidth(tableRef)

watch(() => state.searchText, val => {
    if (!val.trim()) {
        codeSetList.value.codeList = codeSetList.value.codeBackList
        refresh()
    } else {
        codeSetList.value.codeList = codeSetList.value.codeBackList.filter(item => 
            item.columnAlias ? item.columnAlias.indexOf(val.trim()) > -1 : item.columnName.indexOf(val.trim()) > -1
        )
    }
})

const optionDisabled = (record, item) => {
    // 目前的类型转换逻辑是 字符串可以转日期和数字 数字可以转字符 日期可以转字符
    if ((record.type === 'selfConfig.numeric' || record.type === 'selfConfig.bigint') && (item.text === 'selfConfig.time'|| item.text === 'selfConfig.date' || item.text === 'selfConfig.datetime')) {
        return true
    } else if ((record.type === 'selfConfig.time' || record.type === 'selfConfig.date' || record.type === 'selfConfig.datetime') && (item.text === 'selfConfig.numeric' || item.text === 'selfConfig.bigint')) {
        return true
    }
    return false
}

const rename = async (record, type) => {
    // 存在重复物理字段名
    if(repeatIndex.value > -1) return
    if(type === 'field') {
        record.isFieldRename = !record.isFieldRename
        await nextTick()
        fieldInputRef && fieldInputRef.value.focus()
    } else if(type === 'phyName') {
        record.isPhyRename = !record.isPhyRename
        await nextTick()
        phyNameInputRef && phyNameInputRef.value.focus()
    }
}

const codeSelect = record => {
    record.isSelect = !record.isSelect
    refresh()
}

const selectAll = (type) => {
    let excludeContents = []
    state.codeTypeList = []
    if (type === 1) {
        codeSetList.value.codeBackList.forEach(item => {
            item.isSelect = true
        })
    } else {
        codeSetList.value.codeBackList.forEach(item => {
            item.isSelect = false
        })
    }
    codeSetList.value.codeBackList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    newColumnName: info.newColumnName,
                    isSelect: info.isSelect
                }
                state.codeTypeList.push(o)
            }
        } else {
            let eobj = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                newColumnName: info.newColumnName,
                isSelect: info.isSelect
            }
            excludeContents.push(eobj)
        }
    })
    let data = {
        uuid: operActiveId.value,
        action: "setting",
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        contents: state.codeTypeList,
        excludeContents: excludeContents, // 未选中的内容
    }
    useApiConfigStore.setTableSource(data, 'change')
    useApiConfigStore.setSelfConfig(data, 'codeset')
}

const onSelect = (value, item, index) => {
    let excludeContents = []
    state.codeTypeList = []
    let obj = {}
    if (item.imgType == 'textImg' && value.key == 'string') {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias,
            newColumnName: item.newColumnName,
        }
    } else {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias,
            newColumnName: item.newColumnName,
            targetFormat: value.key
        }
    }
    item.codeSetting = obj
    const targetIndex = state.codeTypeList.findIndex(i => i.column === item.columnName)
    if (targetIndex >= 0) {
        state.codeTypeList[targetIndex] = obj
    }
    codeSetList.value.codeBackList.forEach((info, i) => {
        if (info.isSelect) {
            if (info.codeSetting && i !== index) {
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting && i !== index){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    newColumnName: info.newColumnName
                }
                state.codeTypeList.push(o)
            }
            if (i === index) {
                state.codeTypeList.push(obj)
            }
        } else {
            let eobj = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                newColumnName: info.newColumnName,
                isSelect: info.isSelect
            }
            excludeContents.push(eobj)
        }
    })
    let data = {
        uuid: operActiveId.value,
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        action: "setting",
        contents: state.codeTypeList,
        excludeContents: excludeContents, // 未选中的内容
    }
    useApiConfigStore.setTableSource(data, 'change')
    useApiConfigStore.setSelfConfig(data, 'codeset')
}

const inputFn = (elm, index) => {
    fieldChange.value = true
    if(!elm) return
    
    let isRepeat = codeSetList.value.codeList?.some(it => it !== elm && it.newColumnName === elm.newColumnName)

    // 物理字段名不能重复且不能为空
    if(isRepeat || !elm.newColumnName) {
        repeatIndex.value = index
    } else {
        repeatIndex.value = -1
    }
    if(isRepeat) {
        useApiConfigStore.setPhyCodeFlag('repeat')
    } else if(!elm.newColumnName) {
        useApiConfigStore.setPhyCodeFlag('blank')
    } else {
        useApiConfigStore.setPhyCodeFlag('normal')
    }
}

const onIptBlur = record => {
    // 存在重复物理字段名
    if(repeatIndex.value > -1) return
    // 字段未发生修改
    if(!fieldChange.value) {
        record.isFieldRename = false
        record.isPhyRename = false
        return
    }

    fieldChange.value = false
    record.isFieldRename = false
    record.isPhyRename = false
    state.codeTypeList = []
    let excludeContents = []
    codeSetList.value.codeList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                info.codeSetting.columnAlias = info.columnAlias
                info.codeSetting.newColumnName = info.newColumnName
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    newColumnName: info.newColumnName
                }
                state.codeTypeList.push(o)
            }
        } else {
            let eobj = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                newColumnName: info.newColumnName,
                isSelect: info.isSelect
            }
            excludeContents.push(eobj)
        }
    })
    let data = {
        uuid: operActiveId.value,
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        action: "setting",
        contents: state.codeTypeList,
        excludeContents: excludeContents, // 未选中的内容
    }

    useApiConfigStore.setTableSource(data, 'change')
    useApiConfigStore.setSelfConfig(data, 'codeset')
}

const dragEnd = (event) => {
    state.codeTypeList = []
    codeSetList.value.codeList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                info.codeSetting.newColumnName = info.newColumnName
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    newColumnName: info.newColumnName
                }
                state.codeTypeList.push(o)
            }
        }
    })
    let data = {
        uuid: operActiveId.value,
        action: "setting",
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        contents: state.codeTypeList
    }
    useApiConfigStore.setTableSource(data, 'change')
    useApiConfigStore.setSelfConfig(data, 'codeset')
}

const svgClass = (item, elm) => {
    return [
        item.iconName + 'Icon',
        elm.type === item.text && elm.errorColumn ? 'errorStatus' : ''
    ]
}

// 异常字段列名
const errorCodeCols = computed(() => 
    codeSetList.value.codeList.filter(code => code.errorColumn)
        .map(it => it.columnName)
)

const refresh = ()=>{
    let excludeContents = []
    state.codeTypeList = []
    codeSetList.value.codeList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    newColumnName: info.newColumnName,
                    isSelect: info.isSelect
                }
                state.codeTypeList.push(o)
            }
        } else {
            let eobj = {
                column: info.columnName,
                columnAlias: info.columnAlias,
                newColumnName: info.newColumnName,
                isSelect: info.isSelect
            }
            excludeContents.push(eobj)
        }
    })
    let data = {
        uuid: operActiveId.value,
        action: "setting",
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        contents: state.codeTypeList,
        excludeContents: excludeContents, // 未选中的内容
    }
    useApiConfigStore.setTableSource(data, 'change')
    useApiConfigStore.setSelfConfig(data, 'codeset')
}

// 同步回调
const asyncFn = () => {
    asyncHandle && asyncHandle()
}
</script>

<style lang="less" scoped>

span[role="img"]{
    svg{
        width: 16px;
        height: 16px;
        position: relative;
        top: 3px;
    }
}
.codeSet {
    .codeSelect {
        width: 318px;
        flex-shrink: 0;
        background: #fff;
        .chosenClass {
            border-bottom: 3px solid #3D82F2;;
        }
        .text {
            width: 100%;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            padding: 12px 12px 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .asyncWrap{
                display: inline-flex;
                align-items: center;
                color: #2B67FF;
                gap: 4px;
                cursor: pointer;
                svg{
                    width: 15px;
                    height: 15px;
                }
            }
        }
        .search {
            height: 46px;
            padding: 8px 12px;
            position: relative;
            input {
                width: 100%;
                height: 30px;
                padding-right: 30px;
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
        .check-img {
            width: 16px;
            height: 16px;
            margin-right: 6px;
            cursor: pointer;
        }

        .myTable {
            width: 100%;
            height: calc(100% - 76px);
            background-color: #fff;
            padding: 10px 8px 16px 12px;
            overflow-y: scroll;
            // overflow-x: hidden;

            -ms-overflow-style: none;
            overflow: -moz-scrollbars-none;
            .check-img {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                cursor: pointer;
            }
            table {
                border-collapse: collapse;
                border-spacing: 0;
                width: fit-content;
                table-layout: fixed;
            }

            thead tr {
                td, th {
                    border: 1px solid #E0EBFF;
                    background: #ECF3FF;
                    height: 36px;
                    padding: 0px 8px;
                    line-height: 1;
                    text-align: left;
                    position: relative;

                    &:last-of-type {
                        border: none;
                        background: #fff;
                    }

                    &.phyField{
                        position: relative;
                        img{
                            width: 12px;
                            position: absolute;
                            top: 12px;
                            right: 6px;
                        }
                    }
                    .th-flex{
                        display: flex;
                        align-items: center;
                    }
                    .resizerWrap {
                        position: absolute;
                        width: 4px;
                        height: 100%;
                        right: 0;
                        top: 0px;
                        .resizer{
                            display: none;
                            width: 100%;
                            height: 100%;
                            background-color: #2B67FF;
                        }
                        &:hover{
                            .resizer{
                                display: inline-block;
                                cursor: ew-resize;
                            }
                        }
                    }
                }
            }

            .list-group-item {
                height: 36px;

                td {
                    height: 36px;
                    padding: 0px 8px;  
                    border: 1px solid #E0EBFF;

                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #fff !important;
                    }

                    &:last-of-type {
                        border: none;
                        background: #fff;
                    }
                }
                .name {
                    display: flex;
                    align-items: center;
                }
                .name, .phyName {
                    font-size: 12px;
                    position: relative;
                    &:hover{
                        .edit{
                            display: block;
                        }
                    }

                    div {
                        padding: 0;
                        font-size: 12px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        cursor: pointer;
                        width: 90%;
                    }
                    .ipt {
                        height: 28px;
                        width: 82px;
                        background-color: #F3F3F3;
                        &:focus{
                            + .edit{
                                display: none;
                            }
                        }
                        &.isRepeat{
                            background-color: #afa;
                        }
                    }
                    .columnName{
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        cursor: pointer;
                        width: 90%;
                    }
                    .edit{
                        width: 12px;
                        height: 12px;
                        cursor: pointer;
                        display: none;
                        position: absolute;
                        right: 0px;
                        top: 4px;
                    }
                }

                .isRepeat{
                    .ipt, .ipt:focus{
                        border: 1px solid #ff4d4f;
                        box-shadow: none;
                    }
                }

                .name{
                    .ipt{
                        width: 60px;
                    }
                }
                .cloName{
                    margin-left: 4px;
                    font-size: 13px;
                    width: 26px;
                    display: inline-flex;
                    overflow: hidden;
                }

                .type {
                    padding: 0;

                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #fff !important;
                    }

                    :deep(.ant-select-selector){
                        padding: 0 8px;
                    }
                }

                .handle {
                    img {
                        width: 8px;
                        height: 20px;
                    }

                    cursor: pointer;
                }
            }

            .errorField {
                .name{
                    span{
                        color: #F53F3F;
                    }
                }
                .cloName{
                    margin-left: 4px;
                    color: #F53F3F;
                }
            }
        }
        .myTable::-webkit-scrollbar {
            width: 0 !important;
        }
    }
    .table-con {
        // width: calc(100vw - 647px);
        height: calc(100vh - 310px);
        background-color: #fff;
        p {
            float: right;
            margin-right: 12px;
            margin-top: 12px;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            width: 215px;
            text-align: right;
        }
        .tables {
            width: 100%;
            // width: calc(100vw - 655px);
            height: calc(100vh - 353px);
            background-color: #fff;
            padding-left: 10px;
            overflow: scroll;
        }
    }
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
        background-color: #fff !important;
        border: none;
    }
}


.ant-spin-nested-loading{
    width: calc(100% - 330px);
}
</style>