<template>
    <div class="codeSet">
        <div class="codeSelect">
            <div class="text">{{ t('selfConfig.selectCode') }}</div>
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
                    </colgroup>
                    <thead>
                        <tr>
                            <th>
                                <div class="th-flex">
                                    <img @click="selectAll(1)" class="check-img" v-if="selectedNum === 0" src="@/assets/icons/not_select.png" alt="">
                                    <img @click="selectAll(2)" class="check-img" v-else-if="selectedNum === codeSetList.codeBackList.length" src="@/assets/icons/is_select.png" alt="">
                                    <img @click="selectAll(3)" class="check-img" v-else src="@/assets/icons/doing_select.png" alt="">
                                    {{ t('common.codeName') }}
                                </div>
                                <div class="resizerWrap">
                                    <span class="resizer"></span>
                                </div>
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
                                    <div class="name">
                                        <img @click="codeSelect(element)" class="check-img" v-show="!element.isSelect" src="@/assets/icons/not_select.png" alt="">
                                        <img @click="codeSelect(element)" class="check-img" v-show="element.isSelect" src="@/assets/icons/is_select.png" alt="">
                                        <input ref="inputRef" @blur="onIptBlur(element)" @change="changeFn" class="ipt" v-if="element.isRename" type="text" v-model="element.columnAlias" />
                                        <span class="columnName" :title="element.columnAlias || element.columnName" @click="rename(element)" v-else>{{ element.columnAlias || element.columnName }}</span>
                                        <img class="edit" src="@/assets/icons/edit1.png" alt="" @click="rename(element)">
                                    </div>
                                </td>
                                <td class="type">
                                    <a-select style="width: 88px" v-model:value="element.type" @select="(value, options) => onSelect(options, element, index)">
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
                                           <span class="cloName"> {{ t(item.text) }}</span>
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
import { reactive, watch, onMounted, computed, toRefs, nextTick } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
import previewTable from '@/components/selfconfig/previewTable'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useErrorStep'
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth'

const { t } = useI18n()
const useConfigStore = configStore()
const useMainStore = mainStore()
const { activeTabKey } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})

const { allConfigData, operActiveId, previewColumns, previewData, tableLoading, leftMergeTable, headerInfo, totalDataCount } = toRefs(configData.value)

const { stepError } = useErrorStep()

// 字段名是否发生变化
const fieldChange = ref(false)

const inputRef = ref()
const tableRef = ref()
const colWidths = ref(['116','90','12'])

const codeSetList = computed(() => {
    let obj = {
        codeList: [],
        codeBackList: [],
        previewColumns: [],
        previewData: []
    }
    if (allConfigData.value.length > 0) {
        allConfigData.value.forEach(item => {
            if (item.uuid === operActiveId.value) {
                obj = item
            }
        })
    }
    // 手动添加uuid 避免字段id重复导致拖拽异常问题
    obj.codeList.map(it => {
        if(!it.codeId) {
            it.codeId = uuidv4()
        }
    })
    return obj
})

watch(() => codeSetList.value.codeList, () => {
    // 触发重排 解决部分字段未展示问题
    colWidths.value[1] = colWidths.value[1] === '91' ? '90' : '91'
})

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
// 拖拽列宽逻辑处理
useChangeColWidth(tableRef)

const state = reactive({
    showClearImg: false,
    searchText: '',
    day: 'tom',
    codeTypeList: []
})

watch(() => state.searchText, val => {
    if (!val.trim()) {
        codeSetList.value.codeList = codeSetList.value.codeBackList
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

const rename = async (record) => {
    record.isRename = !record.isRename
    await nextTick()
    inputRef && inputRef.value.focus()
}

const codeSelect = record => {
    record.isSelect = !record.isSelect
    state.codeTypeList = []
    codeSetList.value.codeBackList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias,
                    isSelect: info.isSelect
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
    useConfigStore.setTableSource(data, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(data, 'codeset', activeTabKey.value)
}

const selectAll = (type) => {
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
                    isSelect: info.isSelect
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
    useConfigStore.setTableSource(data, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(data, 'codeset', activeTabKey.value)
}

const onSelect = (value, item, index) => {
    state.codeTypeList = []
    let obj = {}
    if (item.imgType == 'textImg' && value.key == 'string') {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias
        }
    } else {
        obj = {
            column: item.columnName,
            columnAlias: item.columnAlias,
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
                    columnAlias: info.columnAlias
                }
                state.codeTypeList.push(o)
            }
            if (i === index) {
                state.codeTypeList.push(obj)
            }
        }
    })
    let data = {
        uuid: operActiveId.value,
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        action: "setting",
        contents: state.codeTypeList
    }
    useConfigStore.setTableSource(data, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(data, 'codeset', activeTabKey.value)
}

const changeFn = () => {
    fieldChange.value = true
}

const onIptBlur = record => {
    if(!fieldChange.value) {
        record.isRename = false
        return
    }
    fieldChange.value = false

    record.isRename = false
    state.codeTypeList = []
    codeSetList.value.codeList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                info.codeSetting.columnAlias = info.columnAlias
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias
                }
                state.codeTypeList.push(o)
            }
        }
    })
    let data = {
        uuid: operActiveId.value,
        realTableId: leftMergeTable.value.id,
        tableAlias: headerInfo.value.tableName,
        description: headerInfo.value.desc,
        action: "setting",
        contents: state.codeTypeList
    }
    useConfigStore.setTableSource(data, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(data, 'codeset', activeTabKey.value)
}

const dragEnd = (event) => {
    state.codeTypeList = []
    codeSetList.value.codeList.forEach((info) => {
        if (info.isSelect) {
            if (info.codeSetting) {
                state.codeTypeList.push(info.codeSetting)
            } else if (!info.codeSetting){
                let o = {
                    column: info.columnName,
                    columnAlias: info.columnAlias
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
    useConfigStore.setTableSource(data, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(data, 'codeset', activeTabKey.value)
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
        background: #fff;
        .chosenClass {
            border-bottom: 3px solid #3D82F2;;
        }
        .text {
            width: 100%;
            height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            margin-top: 12px;
            margin-left: 12px;
        }
        .search {
            width: 100%;
            height: 46px;
            padding: 8px 12px;
            position: relative;
            input {
                width: 100%;
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
            overflow-x: hidden;
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
                td {
                    border: 1px solid #E0EBFF;
                    background: #ECF3FF;
                    height: 36px;
                    padding: 0px 8px;
                    line-height: 1;
                }
                th {
                    text-align: left;
                    border: 1px solid #E0EBFF;
                    background: #ECF3FF;
                    height: 36px;
                    padding: 0px 10px;
                    line-height: 1;
                    position: relative;
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
                :nth-child(3) {
                    border: none;
                    background: #fff;
                }
            }

            .list-group-item {
                height: 36px;
                // display: grid;
                // grid-template-columns: 116px 90px 12px;

                td {
                    // display: flex;
                    // flex-direction: row;
                    // align-items: center;
                    height: 36px;
                    padding: 0px 8px;  
                    border: 1px solid #E0EBFF;

                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #fff !important;
                    }
                }

                :nth-child(3) {
                    border: none;
                    background: #fff;
                    padding: 0px 8px;
                }

                .name {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    padding: 0 18px 0 0;
                    position: relative;
                    &:hover{
                        .edit{
                            display: block;
                        }
                    }

                    span {
                        display: inline-block;
                        padding: 0;
                        font-size: 12px;
                        height: 28px;
                        line-height: 28px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        cursor: pointer;
                        width: 100%;
                    }
                    .ipt {
                        height: 28px;
                        width: 75px;
                        background-color: #F3F3F3;
                        &:focus{
                            + .edit{
                                display: none;
                            }
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
                        margin-left: 8px;
                        margin-top: 3px;
                        position: absolute;
                        right: 8px;
                    }
                }
                .cloName{
                    margin-left: 4px;
                }

                .type {
                    padding: 0;
                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #fff !important;
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
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
        background-color: #fff !important;
        border: none;
    }
}
</style>