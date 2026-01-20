<template>
    <table ref="tableRef" class="mytable">
        <colgroup>
            <col v-for="it in state.tableColumns"  width="130" />
        </colgroup>
        <thead>
            <tr v-if="state.standardTipList.length">
                <th v-for="(headItem, i) in state.tableColumns" :key="headItem.dataIndex">
                    <a-tooltip placement="topLeft">
                        <template #title>
                            <div v-for="(item, index) in state.standardTipList" :key="index">
                                <div style="white-space: pre-line;" v-if="item[headItem.dataIndex]">
                                    {{ handleText(item[headItem.dataIndex]) }}
                                </div>
                            </div>
                        </template>
                        <div class="cellWrap">
                            <div class="contentWrap">
                                <img :src="getIconSrc(headItem)" alt="" />
                                <span class="text" :title="headItem.columnAlias || headItem.columnName">
                                    {{ headItem.columnAlias || headItem.columnName }}
                                </span>
                            </div>
                            <div class="resizerWrap">
                                <span class="resizer"></span>
                            </div>
                        </div>
                    </a-tooltip>
                </th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { getIconSrc } from '@/utils/utils';
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth';
import { fieldTypeList ,brainFieldTypeList } from '@/constants/dataStandard'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { mainStore } from '@/Stores/mainStore'
import { cloneDeep } from 'loadsh'
import { getRuleTextLoop, handleEditDataList } from '@/hooks/dataStandard/useGetRuleText.js'

const useDataStandardStore = dataStandardStore()
const useMainStore = mainStore()
const { indexTableDesc } = storeToRefs(useMainStore)
const { dataCenterImportStandardDetail } = storeToRefs(useDataStandardStore)

const { t } = useI18n();
const emit = defineEmits(['desensitize']);

const state = reactive({
    tableColumns: [], // table的表头值
    standardTipList: [], // 获取提示的值 
});

const tableRef = ref(null);

// Drag column width logic
useChangeColWidth(tableRef);

onMounted(() => {
    initData()
});

const dataTypeMap ={
    'CHARACTER': 'textImg',
    'NUMBER': 'numImg',
    'DATE_TIME': 'timeImg',
}

watch(()=> indexTableDesc.value.standardId,(newVal)=>{
    if(newVal){
        initData()
    }
})
const initData = async()=>{
    await useDataStandardStore.getImportStandardTable(indexTableDesc.value.standardId)
    let dataClone = cloneDeep(dataCenterImportStandardDetail.value)
    dataClone = {
        ...dataClone,
        attrs: handleEditDataList(dataClone.attrs)
    }
    if(!dataClone.attrs)return
    state.tableColumns = dataClone.attrs.map((item)=> {
        item = {
            ...item,
            imgType: dataTypeMap[item.dataType],
            columnAlias: item.name,
            columnName: item.fieldName,
            dataIndex: item.fieldName,
        }
        return item
    })
    state.standardTipList = getStandardTipList(dataClone.attrs)
}


const getStandardTipList = (standardArr)=>{
    let result = {}
    state.tableColumns.forEach(item => {
        if (item.hasOwnProperty('columnName')) {
            let obj = standardArr.find((it)=> it.fieldName === item['columnName'])
            result[item['columnName']] = obj;
        }
    });
    return [result]
}


const handleText = (obj)=>{
    if(obj){
        let fieldType //字段类型
        let checkRule = getRuleTextLoop(t, obj)  //校验规则
        let typeObj = fieldTypeList.find((type)=> type.value === obj.dataType)
        if(typeObj){
            fieldType = t(typeObj['label'])
        }else{
            typeObj =  brainFieldTypeList.find((type)=> type.value === obj.dataType) 
            if(typeObj){
                fieldType =typeObj.value +' '+ t(typeObj['label'])
            }
        }
        return `物理字段名：${obj.fieldName}
        字段类型：${fieldType}
        字段长度：${obj.dataLength}
        备注: ${obj.description ?? ''}
        校验规则：${checkRule.map(it => {
                return `${it.text}${it.showLogic && !it.isLast ? it.logic : ''}`
            }).join('')}`
    } else {
        return  ''
    }
}


</script>
<style lang="less" scoped>
.mytable {
    position: relative;
    table-layout: fixed;
    width: fit-content;
    thead {
        position: sticky;
        top: -1px;
        background: #ECF3FF;
        th {
            height: 30px;
            border: 1px solid rgb(224, 235, 255);
            .cellWrap{
                position: relative;
                .contentWrap {
                    padding: 2px 6px;
                    display: flex;
                    overflow: hidden;
                    justify-content: left;
                    align-items: center;
                    .text {
                        font-size: 12px;
                        color: #0A2040;
                        font-weight: 400;
                        margin-left: 4px;
                        margin-right: 4px;
                        display: inline-block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
                .resizerWrap{
                    position: absolute;
                    width: 4px;
                    height: 30px;
                    right: 0;
                    top: -3px;
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
            img {
                width: 12px;
            }
            .sort-img {
                cursor: pointer;
            }
            .desensitize-img {
                margin: 0 4px;
                cursor: pointer;
            }
        }
    }
    tbody {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        td {
            border: 1px solid rgb(224, 235, 255);
            height: 30px;
            &>div {
                padding: 2px 6px;
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .blue {
            background: #F7FAFF;
        }
    }
}

.missFields{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .inner{
        width: 180px;
        text-align: center;
        .bgTips{
            height: 130px;
            background: url(@/assets/images/img_null.png) center / cover;
        }
        span{
            color: rgba(0, 0, 0, 0.40);
            font-size: 14px;
        }
    }
}   

.dragLine{
    width: 2px;
    background-color: #2B67FF;
    position: fixed;
    z-index: 100;
}
</style>
<style>
.ant-tooltip-inner{
    max-height: unset;
}
</style>
