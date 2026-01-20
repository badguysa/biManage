<template>
    <div style="background-color: #F2F4FA;height: 12px;"></div>
    <div class="second-container">
        <div class="parse-field">
            <div class="parse-header">
                <div class="title">{{ t('api.parseField') }}</div>
                <div class="dec" @click="showModal">
                    <img class="img" src="@/assets/icons/suo-blue.png" />
                    <span class="text">{{ t('api.decryption') }}</span>
                </div>
            </div>
            <div class="parse-content">
                <a-tree
                    :tree-data="requestData"
                    default-expand-all
                    checkable
                    :selectable="false"
                    v-model:checkedKeys="checkedKeys"
                    @expand="onExpand"
                    @check="onCheck"
                >
                </a-tree>
            </div>
        </div>
        <div class="space"></div>
        <div class="table-preview">
            <div class="table-title">
                {{ t('api.tablePreview') }}
                <span v-if="isCrossLevel" class="table-tip">{{  t('api.mutipleLevelArrTip')}}</span>
            </div>
            <template v-for="(item,index) in apiTableDataList" :key="index">
                <div v-if="apiTableDataList.length === 1">
                    <EditTable  :tableName="tableName" :dataList="item" @changeFn="changeFn" ></EditTable>
                </div>
                <div v-else>
                    <EditTable  :tableName="`${tableName}(${index+1})`" :listKey="index" :dataList="item" @changeFn="changeFn" ></EditTable>
                </div>
            </template>
        </div>
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { mainStore } from '@/Stores/mainStore';
import { modalStore } from '@/Stores/modalStore';
import { useI18n } from 'vue-i18n';
import EditTable from './myEditTable.vue'
import { createTableData } from '@/utils/apiParse'
import { message } from 'ant-design-vue';

const { t } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { requestData, checkedKeys, settingKeys, isCrossLevel, apiTableDataList } = storeToRefs(useMainStore)

const allowRender = ref(true)
defineProps({
    tableName: {
        default: '',
    }
})

const showModal = ()=>{
    useModalStore.changeDecryptModalVisible()
}

const onExpand = (keys, node) => {
    allowRender.value = false
    node.node.dataRef.isExpand = !node.node.dataRef.isExpand
    nextTick(() => {
        allowRender.value = true
    })
}
const handleData = (data, bool) => {
    data.isSelect = bool
    if (!bool) {
        data.isRelation = bool
    }
    if (data.children && data.children.length) {
        data.children.forEach(item => {
            handleData(item, bool)
        })
    }
}
const onCheck = (keys, e) => {
    handleData(e.node.dataRef, e.checked)
    allowRender.value = false
    nextTick(() => {
        allowRender.value = true
    })
    let tempData = []
    if (e.checkedNodes.length) {
        e.checkedNodes.forEach(item => {
            if (!item.children) {
                tempData.push(item)
            }else if(item.children && item.children.length===0){ 
                // 此时的item数组，数组的单项不是对象，是纯数字数组或其他  该判断可能有问题
                item.isNumArray = true
                tempData.push(item)
            }
        })
        let checkedLength = tempData.length
        const flag =  tempData.some((item)=> item?.isNumArray)
        if(flag && checkedLength!==1){
            // 递归移除当前节点及其父级节点的选中状态
            const removeParentKeys = (node) => {
                const parentKey = node.parent?.key;
                if (parentKey) {
                    keys = keys.filter(item => item !== parentKey);
                    removeParentKeys(node.parent);  // 递归处理父节点
                }
            };
            // 取消当前节点
            keys = keys.filter(item => item !== e.node.key);
            removeParentKeys(e.node);
            useMainStore.setCheckedKeys(keys);
            message.warn('数组列只能单独选择进行导入，无法与其他列多选导入');
            return
        }
        useMainStore.changeSettingKeys(tempData, 'set')
        let flagNums = tempData.map(i => i.flagNum)
        flagNums = [...new Set(flagNums)]
        if (flagNums.length > 1) {
            useMainStore.setIsCrossLevel(true)
        } else {
            useMainStore.setIsCrossLevel(false)
        }
    } else {
        useMainStore.changeSettingKeys([], 'set')
        useMainStore.setIsCrossLevel(false)
    }
    useMainStore.setMultiDataList()
}

const changeFn = (data) => {
    let arr = []
    let dataList =  []
    dataList = apiTableDataList.value.map((item,index)=>{
        if(data.key === index){
            item = data.dataList
            return item
        } else {
            return item
        }
    })
    dataList.forEach((item)=>{
        arr = arr.concat(item)
    })
    const filterArr = uniqueByKey(arr ,"key") ;
    useMainStore.changeSettingKeys(filterArr, 'set')
    useMainStore.setMultiDataList()
}

// 去重
const uniqueByKey = (array, key) => {  
    const seen = {};  
    const result = [];  
    // 遍历原始数组  
    for (let i = 0; i < array.length; i++) {  
        const item = array[i];  
        // 使用key来获取当前对象的唯一标识  
        const identifier = item[key];  
        // 如果这个唯一标识还没有被见过，那么将它添加到结果数组和seen对象中  
        if (!seen[identifier]) {  
            seen[identifier] = true;  
            result.push(item);  
        }  
    }  
    // 返回去重后的数组  
    return result;  
}  
</script>

<style lang="less" scoped>
.second-container{
    height: 100%;
    display: flex;
    .parse-field{
        width: 600px;
        height: 100%;
        padding: 12px;
        .parse-header{
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            background-color: #FAFAFC;
            border: 1px solid #F0F0F0;
            border-radius:  4px 4px 0 0;
            .title{
                font-size: 14px;
                font-weight: 600;
            }
            .dec{
                color: #2B67FF;
                display: flex;
                align-items: center;
                cursor: pointer;
                .img{
                    height: 14px;
                    width: 14px;
                    margin-right: 4px;
                }
                .text{
                    line-height: 20px;
                }
            }
        }
        .parse-content{
            padding: 18px 16px 0 16px;
            height: 100%;
            border: 1px solid #F0F0F0;
            border-top: none;
            height: calc(100% - 60px);
            border-radius: 0 0 4px 4px;
            overflow-y: auto;
            :deep(.ant-tree-treenode) {
                padding: 0 0 8px 0;
            }
        }
    }
    .space{
        width: 12px;
        height: 100%;
        background-color: #F2F4FA;
    }
    .table-preview{
        flex: 1;
        height: 100%;
        padding: 12px;
        min-width: 925px;
        overflow: hidden auto;
        .table-title{
            font-size: 14px;
            font-weight: 600;
            .table-tip{
                color: #BFBFBF;
                margin-left: 10px;
                font-size: 12px;
                font-weight: 500;
            }
        }

    }

}
</style>