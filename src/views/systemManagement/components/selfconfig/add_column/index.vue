<template>
    <div class="wrapper">
        <foldContainer operateType="add" style="align-items: center;">
            <div class="left-container">{{ t('selfConfig.newColumn') }}</div>
            <div class="right-container">
                <div class="add-item">
                    <input type="text" :class="{'input-item': true, errorCol: paramsWhetherLost()}" :value="columnsConfig.ruleInfo" @click="showAddColumnModal(index)" :placeholder="t('selfConfig.inputCondition')">
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
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { modalStore } from '@/Stores/modalStore'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useApiErrorStep'
import foldContainer from "@/components/selfconfig/foldContainer";
import previewTable from '@/components/selfconfig/previewTable'
import { isEmptyObject } from '@/utils/utils'

const { t } = useI18n()
const useApiConfigStore = apiConfigStore()

const useModalStore = modalStore()

const { allConfigData, previewData, previewColumns, tableLoading, addColumnsData, operActiveId, selfFlag, tableSource, totalDataCount } = storeToRefs(useApiConfigStore)

const { stepError } = useErrorStep()

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

watch(() => operActiveId.value, (val) => {
    if (selfFlag.value === 'edit') {
        const uuids = tableSource.value.map(i => i.uuid)
        if (uuids.includes(val)) {
            const data = tableSource.value.find(item => item.uuid === val)
            if (data.action === 'add' && data.contents.length) {
                // const reg = /\${p\w}/g
                useApiConfigStore.setAddColumnsData({ 
                    ...data,
                    ruleInfo: data.contents[0].columnAlias + '=' + data.placeholder, 
                    columnAlias: data.contents[0].columnAlias, 
                    placeholder: data.placeholder
                }, operActiveId.value)
            }
        }
    }
}, {
    immediate: true
})

const showAddColumnModal = () => {
    useModalStore.changeApiAddColumnModalVisible()
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
