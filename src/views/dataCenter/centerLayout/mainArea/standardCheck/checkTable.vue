<template>
    <table ref="tableRef" class="mytable">
        <colgroup>
            <col v-for="it in tableColumns" :key="it.id" width="130" />
        </colgroup>
        <thead>
            <tr v-if="standardTipList.length">
                <th v-for="(headItem, i) in tableColumns" :key="headItem.targetFiled">
                    <a-tooltip placement="topLeft">
                        <template #title>
                            <div>
                                <div style="white-space: pre-line;">
                                    {{ handleText(headItem) }}
                                </div>
                            </div>
                        </template>
                        <div class="cellWrap">
                            <div class="contentWrap">
                                <img :src="getIconSrc(headItem)" alt="" />
                                <span class="text" :title="headItem.columnAlias || headItem.columnName">
                                    {{ headItem.columnAlias || headItem.columnName }}
                                </span>
                                <template v-if="headItem.imgType === 'numImg'">
                                    <img class="sort-img" @click="sortFunc(headItem)"
                                        :src="headItem.itemSort === 1 ? sortup_img : sortdown_img" />
                                </template>
                            </div>
                            <div class="resizerWrap">
                                <span class="resizer"></span>
                            </div>
                        </div>
                    </a-tooltip>
                </th>
            </tr>
            <tr v-if="!standardTipList.length">
                <th v-for="(headItem, i) in tableColumns" :key="headItem.dataIndex">
                    <div class="cellWrap">
                        <div class="contentWrap">
                            <img :src="getIconSrc(headItem)" alt="" />
                            <span class="text" :title="headItem.columnAlias || headItem.columnName">
                                {{ headItem.columnAlias || headItem.columnName }}
                            </span>
                            <template v-if="headItem.imgType === 'numImg'">
                                <img class="sort-img" @click="sortFunc(headItem)"
                                    :src="headItem.itemSort === 1 ? sortup_img : sortdown_img" />
                            </template>
                        </div>
                        <div class="resizerWrap">
                            <span class="resizer"></span>
                        </div>
                    </div>
                </th>
            </tr>
            <tr v-if="standardList.length">
                <th v-for="(headItem, i) in tableColumns" :key="headItem[targetFiled]" class="tipsTh">
                    <a-select 
                        style="width: 100%"
                        v-model:value="state.standardInfo[headItem[targetFiled]]"
                        @select="updateData()"
                        :placeholder="t('dataStandard.counterStandardField')"
                    >
                        <a-select-option 
                            v-for="opItem in standardList" 
                            :key="opItem.value" 
                            :value="opItem.value"
                            :title="opItem.label"
                            :disabled="disabledOption(opItem)"
                        >
                            <div style="display: flex;align-items: center;height: 100%;">
                                <img v-if="opItem.groupType == 1" style="height: 12px;margin-right: 4px" :src="opItem.imgSrc" alt="">
                                <img v-else style="width: 14px;margin-right: 4px" :src="opItem.imgSrc" alt="">
                                <span>{{ opItem.label }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, i) in state.tableInfo" :key="item" :class="{ blue: i % 2 !== 0 }">
                <td v-for="(info, index) in tableColumns" :key="index">
                    <div class="text" @dblclick="copyText(item[info.dataIndex])" :title="item[info.dataIndex]">
                        {{ item[info.dataIndex] }}
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { getIconSrc, isEmptyObject } from '@/utils/utils';
import sortup_img from '@/assets/icons/sort_up.png';
import sortdown_img from '@/assets/icons/sort_down.png';
import safe_img from '@/assets/icons/safety.png';
import notsafe_img from '@/assets/icons/not-safe.png';
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth';
import { fieldTypeList, brainFieldTypeList } from '@/constants/dataStandard'
import { dataStandardStore } from '@/Stores/dataStandardStore';
import { getRuleTextLoop} from '@/hooks/dataStandard/useGetRuleText.js'

const useDataStandardStore = dataStandardStore()
const { dataCenterImportStandardStatus } = storeToRefs(useDataStandardStore)

const props = defineProps({
    tableData: {
        type: Array,
        default: () => []
    },
    tableColumns: {
        type: Array,
        default: () => []
    },
    // 数据标准的校验列
    standardList: {
        type: Array,
        default: () => []
    },
    // 数据标准的提示列
    standardTipList:{
        type: Array,
        default: () => []
    },
    targetFiled: {
        type: String,
        default: 'columnName'
    }
});

const targetName =computed(()=> props.targetFiled == "columnAlias" ?'name' :'fieldName')
const tipsArr = ref([])

const emit = defineEmits(['updateCheckColumn']);

const { t } = useI18n();
const state = reactive({
    tableInfo: [], // table的body值
    standardInfo: {} // 校验列表选择的值 暂未使用默认物理字段名
});

const tableRef = ref(null);

// Drag column width logic
useChangeColWidth(tableRef);

onMounted(() => {
    state.tableInfo = props.tableData;
});

watch(() => props.tableData, (newVal) => {
    state.tableInfo = newVal;
}, { deep: true });

watch(()=>props.standardTipList,async (newVal) =>{
    // 第一次编辑进入进行匹配展示，后续切换标准不匹配
    if(dataCenterImportStandardStatus.value && newVal.length){
        await nextTick()
        getStandardInfo()
    }
},{immediate: true})

const getStandardInfo = ()=>{
    let name = props.targetFiled == "columnAlias" ?'name' :'fieldName'
    const keys = Object.keys(props.standardTipList[0])
    if(isEmptyObject(state.standardInfo)){
        state.standardInfo = keys.reduce((obj, key) => {
            const found = props.standardList.some(item => item[name] === key)
            obj[key] = found ? key : ''
            return obj
        }, {})
    } else {
        state.standardInfo = keys.reduce((obj, key) => {
            obj[key] =  ''
            return obj
        }, {})
    }
    keys.forEach((key)=>{
        tipsArr.value.push(props.standardTipList[0][key])
    })
}

const sortFunc = (record) => {
    if (record.itemSort === 1) {
        state.tableInfo.sort((a, b) => Number(b[record.dataIndex]) - Number(a[record.dataIndex]));
        record.itemSort = 2;
    } else {
        state.tableInfo.sort((a, b) => Number(a[record.dataIndex]) - Number(b[record.dataIndex]));
        record.itemSort = 1;
        props.tableColumns.filter(item => item.dataIndex !== record.dataIndex).forEach(item => {
            item.itemSort = 2;
        });
    }
};

const copyText = (text) => {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    message.success(t('otherConfig.copySuccess'));
};

const updateData = ()=>{
    emit('updateCheckColumn', state.standardInfo);
}

const disabledOption = (item)=>{
    const selectedOption =  Object.values(state.standardInfo)
    return selectedOption.includes(item.fieldName)
}

const handleText = (headItem)=>{
    let obj    
    for(let item of tipsArr.value){
        if(item[targetName.value] == headItem[props.targetFiled]){
            obj = item            
        }
    }
    if(obj){
        let fieldType //字段类型
        let checkRule =  getRuleTextLoop(t, obj) //校验规则
        let typeObj = fieldTypeList.find((type)=> type.value === obj.dataType)
        if(typeObj){
            fieldType = t(typeObj['label'])
        }else{
            typeObj =  brainFieldTypeList.find((type)=> type.value === obj.dataType) 
            if(typeObj){
                fieldType =typeObj.value +' '+ t(typeObj['label'])
            }
        }
        let nameStr = targetName.value == 'name' ? ('字段名：' + obj.name) : ('物理字段名：' + obj.fieldName)
        return `${nameStr}
        字段类型：${fieldType}
        字段长度：${obj.dataLength}
        备注: ${obj.description ?? ''}
        校验规则：${checkRule.map(it => {
                return `${it.text}${it.showLogic && !it.isLast ? it.logic : ''}`
            }).join('')}`
    } else {
        return  '无对应标准字段'
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
        }
        .tipsTh{
            background-color: #ffffff;
            padding: 0px 4px;
            height: 33px;
        }
    }
    tbody {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        td {
            border: 1px solid rgb(224, 235, 255);
            height: 40px;
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
:deep(.ant-select .ant-select-selector){
    height: 23px;
    display: flex;
    align-items: center;
}
:deep(.ant-select-selection-placeholder){
    color: #3E4959;
    font-weight: 400;
    font-size: 11px;
    line-height: 15px;
}
:deep(.ant-select .ant-select-selection-item){
    display: flex;
    font-size: 11px;
    line-height: 19px;
}
</style>