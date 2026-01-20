<!-- 排序 -->
<template>
    <div class="sort-wrapper">
        <fold-container operateType="sort" ref="foldRef">
            <div class="left-container">{{ t('selfConfig.sort') }}</div>
            <div class="right-container">
                <div class="sort-item" :key="index" v-for="(sortItem, index) in sortItemList">
                    <a-select :notFoundContent="t('common.noData')" 
                        :class="{errorField: errorCodeCols.includes(sortItem.column) || !includeCurVal(sortItem.column)}" 
                        v-model:value="sortItem.column" 
                        @change="filedChangeHandle"
                        show-search
                        :filter-option="filterOption"
                    >
                        <a-select-option 
                            v-for="item in codeSetList.codeList"
                            :label="item.columnAlias || item.columnName"
                            :value="item.columnName"
                            :disabled="item.sortDisabled"
                        >
                            <span role="img">
                                <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                            </span>
                            <span class="colName">{{ item.columnAlias || item.columnName }}</span>
                        </a-select-option>
                    </a-select>
                    <a-select :notFoundContent="t('common.noData')" v-model:value="sortItem.rule" @change=ruleChangeHandle>
                        <a-select-option v-for="option in sortOption" :value="option.value">
                            {{ t(option.label) }}
                        </a-select-option>
                    </a-select>
                    <img v-if="sortItemList.length>1" src="@/assets/icons/delete.png" @click="removeRule(index)"
                        alt="delete">
                </div>
                <div class="addBtn" @click="addSortRule">
                    <img src="@/assets/icons/add_relation.png" alt="add">
                    <span>{{ t('selfConfig.addSortCondition') }}</span>
                </div>
            </div>
        </fold-container>
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
import { computed, watch, ref } from "vue";
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import foldContainer from "@/components/selfconfig/foldContainer";
import previewTable from '@/components/selfconfig/previewTable'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useApiErrorStep'
const { t } = useI18n()
const useApiConfigStore = apiConfigStore()

const { allConfigData, operActiveId, previewData,previewColumns, tableLoading, totalDataCount, selfFlag, tableSource } = storeToRefs(useApiConfigStore)

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

const sortOption = [
    {
        label: 'selfConfig.asc',
        value: 'ASC'
    },
    {
        label: 'selfConfig.Desc',
        value: 'DESC'
    }
]


const sortItemList = ref([
    {
        column: '',
        rule: ''
    }
])

const foldRef = ref(null)

watch(() => operActiveId.value, (val) => {
    if (selfFlag.value === 'edit') {
        const uuids = tableSource.value.map(i => i.uuid)
        if (uuids.includes(val)) {
            const data = tableSource.value.find(item => item.uuid === val)
            if (data.action === 'order') {
                sortItemList.value = data.contents
                const columns = sortItemList.value.map(i => i.column)
                codeSetList.value.codeList.forEach((option) => { 
                    if (columns.includes(option.columnName)) {
                        option.sortDisabled = true
                    }
                })
            }
        }
    }
}, {
    immediate: true
})

// 新增排序规则
const addSortRule = () => {
    sortItemList.value.push({
        column: '',
        rule: ''
    })
    // 超出最大高度 滚动滚动条到最底部
    foldRef.value.setScrollTop()
}

const removeRule = (index) => {
    sortItemList.value.splice(index, 1)
    disabledSelectOption()
    updateTableData()
}

const filedChangeHandle = (value) => {
    disabledSelectOption()
    updateTableData()
}

// 禁用已经选择的下拉列表
const disabledSelectOption = () => {
    codeSetList.value.codeList.forEach((option) => {
        option.sortDisabled = false
        sortItemList.value.forEach(item=>{
            if(item.column === option.columnName){
                option.sortDisabled = true
            }
        })
    })
}

// 更新数据
const updateTableData = () => {
    // 判断是否每条规则都有值
    let res = sortItemList.value.every(item => item.column && item.rule)
    if (res) {
        let orderConfig = {
            uuid: operActiveId.value,
            action: "order",
            contents: sortItemList.value
        }
        useApiConfigStore.setTableSource(orderConfig, 'change')
        useApiConfigStore.setSelfConfig(orderConfig, 'order')
    }
}

const ruleChangeHandle = (value) => {
    updateTableData()
}
// 异常字段列名
const errorCodeCols = computed(() => 
    codeSetList.value.codeList.filter(code => code.errorColumn)
        .map(it => it.columnName)
)

// 下拉列表是否含有当前选中值
const includeCurVal = (value) => {
    // 筛选项有值 下拉列表无值
    // if(sortItemList.value.some(it => it.column) && !codeSetList.value.codeList?.length) {
    //     return false
    // }
    if(!codeSetList.value.codeList?.length) return true
    return !value ||codeSetList.value.codeList?.some(item => item.columnName === value)
}

const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

</script>


<style lang='less' scoped>
.errorField{
    :deep(.ant-select-selector) {
        background-color: #FF4E4E14 !important;
        .colName{
            color: #F53F3F;
        }
    }
    :deep(svg){
        fill: #F53F3F;
    }
}
.svgIcon{
    width: 16px;
    height: 16px;
    cursor: pointer;
    position: relative;
    top: 3px;
}
.colName{
    margin-left: 4px;
}
.sort-wrapper {
    .left-container {
        margin-right: 20px;
        padding-top: 6px;
    }

    .right-container {
        .sort-item {
            margin-bottom: 10px;
            .ant-select {
                width: 240px;

                .ant-select-selector {
                    border: none;
                }

                &:last-of-type {
                    width: 96px;
                    margin: 0 10px;
                }
            }
            img {
                width: 16px;
                height: 16px;
                cursor: pointer;
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
}
</style>
