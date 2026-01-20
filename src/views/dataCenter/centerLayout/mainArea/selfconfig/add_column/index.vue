<template>
    <div class="wrapper">
        <foldContainer operateType="add" style="align-items: start;" ref="foldRef">
            <div class="left-container">{{ t('selfConfig.newColumn') }}</div>
            <div class="right-container">
                <div class="add-item" v-for="(addItem,index) in addItemList" :key="index" >
                    <input type="text" :class="{'input-item': true, errorCol: paramsWhetherLost()}" :value="addItem.rule" @click="showAddColumnModal(index)" :placeholder="t('selfConfig.inputCondition')">
                    <img v-if="addItemList.length > 1" src="@/assets/icons/delete.png" @click="removeRule(index)" alt="delete">
                </div>
                <div class="addBtn" @click="addColumnRule">
                    <img src="@/assets/icons/add_relation.png" alt="add">
                    <span>{{ t('selfConfig.add') }}</span>
                </div>
            </div>
        </foldContainer>
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
import { storeToRefs } from 'pinia'
import { computed, toRefs, watch } from 'vue'
import { configStore } from '@/Stores/configStore'
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useErrorStep'
import foldContainer from "@/components/selfconfig/foldContainer";
import previewTable from '@/components/selfconfig/previewTable'
import { isEmptyObject } from '@/utils/utils'
import { cloneDeep } from 'lodash'

const { t } = useI18n()
const useConfigStore = configStore()

const useModalStore = modalStore()

const useMainStore = mainStore()

const { activeTabKey } = storeToRefs(useMainStore)

const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})

const { allConfigData, operActiveId, previewData, previewColumns, tableLoading, addColumnsData, selfFlag, tableSource, totalDataCount } = toRefs(configData.value)

const { stepError } = useErrorStep()
const foldRef = ref(null)

// 字段列表
const codeSetList = computed(() => {
    let obj = {
        codeList: []
    }
    if (allConfigData.value.length > 0) {
        allConfigData.value.forEach(item => {
            if (item.uuid === operActiveId.value) {
                obj = item
            }
        })
    }
    return obj
})

const columnsConfig = computed(() => {
    let obj = {}
    if (addColumnsData.value.length > 0) {
        addColumnsData.value.forEach((item) => {
            if (item.uuid === operActiveId.value) {
                obj = item
            }
        })
    }
    return obj
})

const addItemList = computed(()=>{
    let addArr = [{
        rule: '',
        params: [],
    }]
    if(!isEmptyObject(columnsConfig.value) && columnsConfig.value.contents && columnsConfig.value.contents.length){
        addArr = columnsConfig.value.contents.map((item)=>{
            if(item.columnAlias && item.placeholder){
                item.rule = `${item.columnAlias} = ${item.placeholder}`
            }
            return item
        })
    }
    return addArr
})

watch(() => operActiveId.value, (val) => {
    if (selfFlag.value === 'edit') {
        const uuids = tableSource.value.map(i => i.uuid)
        if (uuids.includes(val)) {
            const data = tableSource.value.find(item => item.uuid === val)
            if (data.action === 'add' && data.contents.length) {
                // 兼容以前的单个添加列判断 start
                if(data.contents.length === 1 && data.placeholder){
                    data.contents[0].rule = data.placeholder
                }
                // const reg = /\${p\w}/g
                useConfigStore.setAddColumnsData({ 
                    ...data,
                }, operActiveId.value, activeTabKey.value)
            }
        }
    }
}, {
    immediate: true
})


const showAddColumnModal = (index) => {
    useMainStore.setModalCloumnIndex(index)
    useModalStore.changeAddColumnModalVisible()
}

// 异常字段列名
const errorCodeCols = computed(() => 
    codeSetList.value.codeList.filter(code => code.errorColumn)
        .map(it => it.columnName)
)

// 添加列参数是否丢失
const paramsWhetherLost = () => {
    let lost = false
    let contents = []
    if(!isEmptyObject(columnsConfig.value) &&  columnsConfig.value.contents && columnsConfig.value.contents.length){
        contents = columnsConfig.value.contents
    }
    if(contents.length > 0){
        // 遍历新增列字段是否含有丢失字段
        for(let i = 0; i < contents.length; i++) {
            // 新增列依赖字段丢失
            let res = contents[i].params.some(p => errorCodeCols.value.includes(p.content))
            // 新增列依赖字段未选中
            let res1 = codeSetList.value.codeList?.length ?
                contents[i].params.every(p => codeSetList.value.codeList.some(it => it.columnName === p.content)) : 
                true
    
            if(res || !res1) {
                lost = true
                break
            }
        }
    }
    return lost
}

// 新增排序规则
const addColumnRule = () => {
    let addArr = cloneDeep(addItemList.value)
    addArr.push({
        rule: '',
        params: [],
    })
    const addDataObj = cloneDeep(columnsConfig.value)
    addDataObj.contents = addArr
    useConfigStore.setAddColumnsData({ 
        ...addDataObj
    }, operActiveId.value, activeTabKey.value)
    // 超出最大高度 滚动滚动条到最底部
    foldRef.value.setScrollTop()
}

const removeRule = (index) => {
    let addArr = cloneDeep(addItemList.value)
    addArr.splice(index, 1)
    const selfDataObj = cloneDeep(columnsConfig.value)
    const addDataObj = cloneDeep(columnsConfig.value)
    selfDataObj.contents = addArr.filter((item) => item.rule)
    addDataObj.contents = addArr
    useConfigStore.setSelfConfig(selfDataObj, '', activeTabKey.value)
    useConfigStore.setTableSource(addDataObj, 'change', activeTabKey.value)
    useConfigStore.setAddColumnsData({
        ...addDataObj
    }, operActiveId.value, activeTabKey.value)
}

</script>

<style lang="less" scoped>
.wrapper {
    .left-container {
        padding: 6px 0;
        margin-right: 20px;
    }
    .right-container {
        display: flex;
        flex-direction: column;
        .add-item {
            margin-bottom: 10px;
            .input-item {
                width: 200px;
            }
            img {
                margin-left: 10px;
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            &.errorCol{
                color: #F53F3F;
            }
        }
        .addBtn {
            cursor: pointer;
            font-size: 14px;
            line-height: 20px;
            color: #3D82F2;
            display: inline-flex;
            align-items: center;
            img {
                width: 14px;
                height: 14px;
                margin-right: 4px;
            }
            span{
                line-height: 32px;
            }
        }
    }
    .edit {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
}
</style>
