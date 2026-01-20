<template>
    <div class="myEditTable">
        <div class="table-title">{{ tableName }}</div>
        <table ref="tableRef" v-if="tableList.length">
            <thead>
                <tr>
                    <th>{{ t('api.phyFieldName') }}</th>
                    <th>{{ t('common.codeName') }}</th>
                    <th>{{ t('api.codeType') }}</th>
                    <th>{{ t('api.fieldNameVal') }}</th>
                    <th v-if="isCrossLevel">{{ t('api.relationField') }}</th>
                    <th>{{ t('common.operation') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr class="list-group-item" v-for="(element,index) in tableList" :key="element.key">
                    <td :class="{'input-td': true, 'isError': index === repeatIndex || isError(index , 'newOriginalName')}">
                        <div v-if="!element.edit && !element.isAdd" @click="showInput(element)" style="width: 100%">
                            <span >{{ element.newOriginalName }}</span>
                        </div>
                        <input  v-else ref="inputRef1" @blur="updateSettingKey(element, 1, index)" class="ipt" type="text"
                        v-model="element.newOriginalName" placeholder="请输入" />
                    </td>
                    <td :class="{'input-td': true, 'isError':  isError(index , 'originName')}">
                        <input ref="inputRef2" @blur="updateSettingKey(element, 2, index)" class="ipt" type="text"
                            v-model="element.originName" placeholder="请输入" />
                    </td>
                    <td class="select-td">
                        <a-select 
                            style="width: 100%"
                            v-model:value="element.numType"
                            @select="updateSettingKey(element, 3)"
                        >
                            <a-select-option 
                                v-for="opItem in apiImportTypeList" 
                                :key="opItem.value" 
                                :value="opItem.value"
                                :title="t(opItem.label)"
                            >
                                <span role="img">
                                    <img style="width: 16px" :src="opItem.imgSrc" alt="">
                                </span>
                                {{ t(opItem.label) }}
                            </a-select-option>
                        </a-select>
                    </td>
                    <td class="common-td" v-if="element.numType === 0 && element.value && element.value.length > 30">
                        <a-tooltip>
                            <template #title>{{ element.value }}</template>
                            {{ `${element.value.slice(0, 30)}...` }}
                        </a-tooltip>
                    </td>
                    <td class="common-td" v-else>
                        {{ element.value }}
                    </td>
                    <td class="check-td" v-if="isCrossLevel">
                        <a-switch
                            v-if="element.isSelect && !element.notAllowed && isCrossLevel"
                            v-model:checked="element.isRelation"
                            @change="updateSettingKey(element, 4)"
                        />
                    </td>
                    <td class="oper-td">
                        <div>
                            <span @click="setPrimaryKey(element)">{{ element.isPrimaryKey ?  t('common.cancel'): t('api.setPrimaryKey') }}</span>
                            <span @click="deleteElement(element)">{{ t('common.delete') }}</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <noData v-else/>
        <div class="add-params">
            <myButton class="add-btn" @click="addParams">
                <img src="@/assets/icons/plus.png" style="width: 16px;" alt="添加" />{{t('api.addParams') }}
            </myButton>
        </div>
    </div>
</template>
<script setup>
import myButton from '@/components/buttons/myButton'
import noData from '@/components/noData'
import { apiImportTypeList } from '@/constants/dataCenterMenu.js'
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash'

const useMainStore = mainStore()

// 父节点 设置的字段值  第二部解析所需数据  是否跨层级选择
const { requestData, isCrossLevel, apiTableAddList, errorObj  } = storeToRefs(useMainStore)
const { t } = useI18n()
const emits = defineEmits(["changeFn"])
const props = defineProps({
    tableName: {
        type: String,
        default: '',
    },
    dataList: {
        type: Array,
        default: []
    },
    listKey:{
        type: Number,
        default: 0
    }
})
const inputRef1 = ref(null)

const tableList  = computed(()=> {
    if(apiTableAddList.value.length > 0){
        let flagNum = undefined
        flagNum = props.dataList[0].flagNum
        const filterList = apiTableAddList.value.filter((item)=> item.flagNum === flagNum)
        let arr = []
        arr = props.dataList.concat(filterList)
        arr = arr.map((item)=>{
            item.newOriginalName = item.newOriginalName ? item.newOriginalName : item.title
            return item
        })
        return arr
    } else {
        return props.dataList.map((item)=>{
            item.newOriginalName = item.newOriginalName ? item.newOriginalName : item.title
            return item
        })
    }
})
const repeatIndex = ref(-1) // 输入时是否重复

// 是否为空或者重复
const isError = (index, name)=>{
    if(!errorObj.value) return false
    const flagNum = tableList.value[0].flagNum
    if(errorObj.value.key == flagNum && errorObj.value.index === index && errorObj.value.name === name){   
        return true
    }
    return false
}

// 检验字段名是否重复
const validatePhyCode = (elm,index)=>{
    if(!elm.newOriginalName) return true
    let isRepeat = tableList.value.some((it) => it !== elm && it.newOriginalName === elm.newOriginalName)
    // 物理字段名不能重复且不能为空
    if(isRepeat || !elm.newOriginalName) {
        repeatIndex.value = index
    } else {
        repeatIndex.value = -1
    }
    if(isRepeat) {
        message.error('物理字段名重复')
        return true
    } else if(!elm.newOriginalName) {
        message.error('物理字段名不能为空')
        return true
    }
}

// 修改新增的数据列表
const changeAddDataList = (dataList) => {
    const addList = dataList.filter(item => item.isAdd)
    let flagNum = undefined
    flagNum = props.dataList[0].flagNum
    const filterApiAddList = apiTableAddList.value.filter(it => it.flagNum !== flagNum)
    const addDataList  = addList.concat(filterApiAddList)
    useMainStore.setApiTableAddList(addDataList)
    useMainStore.setMultiDataList(true)
}

const showInput = (el) => {
    el.edit = true;
    nextTick(() => {
        const itemToFocus = inputRef1.value.find(item => item.value === el.newOriginalName);
        if (itemToFocus) {
            itemToFocus.focus();
        }
    });
};

// 字段设置输入框失去焦点
// type 1:物理字段名 2：字段名 3:字段类型 4：关联字段
const updateSettingKey = (element , type, elmIndex) => {
    element.edit = false
    if(type === 1){
        if(validatePhyCode(element, elmIndex)) return
    }
    let dataList = []
    dataList = tableList.value.map((item, index) => {   
      if (type === 1 && elmIndex=== index) {  
        return {  
          ...item,
          newOriginalName: element.newOriginalName,
          title: element.isAdd ? element.newOriginalName : item.title,
          key: element.isAdd ? `${element.key}##${element.newOriginalName}` : item.key,
        };
      } else if(type === 2 && elmIndex=== index){
        return {
            ...item,
            originName: element.originName
        }
      } else if(type === 3 && elmIndex=== index){
        return {
            ...item,
            numType: element.numType
        }
      } else if(type === 4 && elmIndex=== index){
        return {
            ...item,
            isRelation: element.isRelation
        }
      }
      return item;
    })
    if(element.isAdd){
        changeAddDataList(dataList)
    } else {
        // 修改原始生成数据
        const notAddDataList = dataList.filter(item => !item.isAdd)
        emits('changeFn',{ key: props.listKey , dataList: notAddDataList})
    }
}

// 设置主键
const setPrimaryKey = (element)=>{
    if(element.numType === 1) {
        return message.warn('主键不能为小数，请将类型设置为整数')
    }
    const isPrimaryKey = element.isPrimaryKey ? 0 : 1
    const dataList  = tableList.value.map((item)=>{
        item.isPrimaryKey = 0
        if(item.key === element.key){
            return {
                ...item,
                isPrimaryKey
            }
        }
        return item
    })
    if(element.isAdd){
        changeAddDataList(dataList)
    } else {
        // 修改原始生成数据
        const notAddDataList = dataList.filter(item => !item.isAdd)
        emits('changeFn',{ key: props.listKey , dataList: notAddDataList})
    }
}

// 删除
const deleteElement = (element) => {
    const dataList  = tableList.value.filter((item)=> item.key !== element.key)
    if(element.isAdd){
        changeAddDataList(dataList)
    } else {
        // 修改原始生成数据
        const notAddDataList = dataList.filter(item => !item.isAdd)
        emits('changeFn',{ key: props.listKey , dataList: notAddDataList})
    }
    
    // 同步更改左侧树形选中
    const newRequestData = updateIsSelectData(requestData.value, element.key)
    const arr = []
    newRequestData.forEach((item)=>{
        if(item.children){
            item.children.forEach((cItem) => {
                if(cItem.isSelect){
                    arr.push(cItem.key)
                }
            })
        } else {
            if(item.isSelect){
                arr.push(item.key)
            }
        }
    })
    useMainStore.setCheckedKeys(arr)
    useMainStore.setRequestData(newRequestData)
}

// 重新获取左侧选中数据
const updateIsSelectData = (dataArray, keyValue )=> {  
    // 递归函数，用于遍历数组和可能的子数组  
    const traverseAndUpdate = (array)=> {  
        for (let i = 0; i < array.length; i++) {  
            const item = array[i];  
            // 检查当前项是否有我们要找的 key  
            if (item.key === keyValue) {  
                // 修改 isSelect 属性为 false  
                item.isSelect = false;  
            }  
            // 如果当前项有 children 数组，则递归遍历  
            if (Array.isArray(item.children)) {  
                traverseAndUpdate(item.children);  
            }  
        }  
    }  
    // 调用递归函数开始遍历  
    traverseAndUpdate(dataArray);  
    // 返回修改后的数组（由于 JavaScript 中数组是引用类型，所以原数组也会被修改）  
    return dataArray;  
} 

const addParams = () => {
    const flagNum = tableList.value[0].flagNum
    let keyList = tableList.value[0].key.split('##')
    keyList.pop()
    let key = keyList.join('##')
    const obj = {
        isAdd: true,
        "children": null,
        "key": key,
        "originName": "",
        "title": "",
        "type": "string",
        "numType": 0,
        "value": '',
        "isSelect": false,
        "isExpand": false,
        "notAllowed": true,
        "flagNum": flagNum,
        newOriginalName: '',
        listKey: props.listKey
    }
    let dataList = cloneDeep(apiTableAddList.value)
    dataList.push(obj)
    useMainStore.setApiTableAddList(dataList)
}
</script>
<style lang="less" scoped>
.myEditTable {
    width: 100%;
    background-color: #fff;
    overflow-y: scroll;
    overflow-x: hidden;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    scrollbar-width: none;
    padding-bottom: 12px;
    .table-title {
        font-size: 12px;
        font-weight: 400;
        color: #0A2040;
        padding: 16px 0;
    }

    table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
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
                font-weight: 500;
            }
        }

        .list-group-item {
            height: 36px;

            td {
                height: 36px;
                padding: 4px 8px;
                border: 1px solid #E0EBFF;
                width: calc(100% / 6);
            }
            .select-td {
                :deep(.ant-select .ant-select-selector){
                    width: 100%;
                    background: #F3F3F3;
                }
            }
            .common-td{
                max-width: calc(100% / 4);
            }
            .oper-td {
                span {
                    color: #3d82f2;
                    cursor: pointer;
                    margin-right: 16px;
                }
            }
            .input-td{
                .ipt{
                    width: 100%;
                }
            }
            .isError{
                .ipt, .ipt:focus{
                    border: 1px solid #ff4d4f;
                    box-shadow: none;
                }
            }
        }
    }
    .add-params{
        .add-btn{
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2px;
            height: 28px;
            margin-top: 16px;
            margin-bottom: 20px;
        }
    }
    
}
</style>