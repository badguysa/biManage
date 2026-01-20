<!-- 分组汇总 -->
<template>
    <div class="group-warpper">
        <fold-container operateType="group" flexDirection="column" ref="foldRef">
            <div class="main-container">
                <div class="left-container">{{ t('selfConfig.groupName') }}</div>
                <div class="right-container">
                    <div class="sort-item" :key="index" v-for="(groupItem, index) in groupItemList">
                        <a-select 
                            :class="{errorField: errorCodeCols.includes(groupItem.column) || !includeCurVal(groupItem.column)}"
                            :notFoundContent="t('common.noData')" 
                            allowClear 
                            v-model:value="groupItem.column" 
                            @change="groupFiledChangeHandle"
                            show-search
                            :filter-option="filterOption"
                        >
                            <a-select-option v-for="item in codeSetList.codeList" :label="item.columnAlias || item.columnName" :value="item.columnName"
                                :disabled="item.groupFiledDisabled">
                                <span role="img">
                                    <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                                </span>
                                <span class="colName">{{ item.columnAlias || item.columnName }}</span>
                            </a-select-option>
                        </a-select>
                        <img v-if="groupItemList.length > 1" src="@/assets/icons/delete.png"
                            @click="removeGroupItem(index)" alt="delete" />
                    </div>

                    <div class="add-item" @click="addGroupFiled">
                        <img src="@/assets/icons/add_relation.png" alt="add" />
                        <span>{{ t('selfConfig.addGroupName') }}</span>
                    </div>
                </div>
            </div>
            <div class="main-container">
                <div class="left-container">{{ t('selfConfig.summaryField') }}</div>
                <div class="right-container">
                    <div class="sort-item" :key="index" v-for="(summaryItem, index) in summaryItemList">
                        <a-select 
                            :class="{errorField: errorCodeCols.includes(summaryItem.column) || !includeCurVal(summaryItem.column)}"
                            :notFoundContent="t('common.noData')" 
                            v-model:value="summaryItem.column"
                            @change="summaryFiledChangeHandle"
                            show-search
                            :filter-option="filterOption"
                        >
                            <a-select-option v-for="item in codeSetList.codeList" :value="item.columnName" :label="item.columnAlias || item.columnName"
                                :disabled="item.summaryFiledDisabled">
                                <span role="img">
                                    <BiIcon :name="getTypeIconSvg(item)" :class="getTypeIconClassName(item)"/>
                                </span>
                                <span class="colName">{{ item.columnAlias || item.columnName }}</span>
                            </a-select-option>
                        </a-select>
                        <a-select :notFoundContent="t('common.noData')"  v-model:value="summaryItem.method" @change="summaryMethodChangeHandle">
                            <a-select-option :title="t(option.label)" v-for="option in numberOption" :value="option.value">
                                {{ t(option.label) }}
                            </a-select-option>
                        </a-select>
                        <img v-if="summaryItemList.length > 1" src="@/assets/icons/delete.png"
                            @click="removeSummaryItem(index)" alt="delete" />
                    </div>

                    <div class="add-item" @click="addSummaryFiled">
                        <img src="@/assets/icons/add_relation.png" alt="add" />
                        <span>{{ t('selfConfig.addSummaryField') }}</span>
                    </div>
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
import { computed, toRefs, watch, ref} from 'vue'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import {  getTypeIconSvg, getTypeIconClassName } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useErrorStep'
import foldContainer from "@/components/selfconfig/foldContainer";
import previewTable from '@/components/selfconfig/previewTable'

const { t } = useI18n()
const useConfigStore = configStore()
const useMainStore = mainStore()

const { activeTabKey } = storeToRefs(useMainStore)

const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { allConfigData, operActiveId, previewData, previewColumns, tableLoading,  selfFlag, tableSource, totalDataCount } = toRefs(configData.value)

const { stepError } = useErrorStep()

// 字段下拉列表
const codeSetList = computed(() => {
    let obj = {
        codeList: [],
        previewColumns: [],
        previewData: [],
    }
    if (allConfigData.value.length > 0) {
        allConfigData.value.forEach((item) => {
            if (item.uuid === operActiveId.value) {
                obj = item
            }
        })
    }
    return obj
})

// 分组数据
const groupItemList = ref([
    {
        column: '',
    },
])

// 汇总数据
const summaryItemList = ref([
    {
        column: '',
        method: '',
    },
])

const foldRef = ref(null)

// 数值汇总方法 MAX-最大值;MIN-最小值;COUNT-计数;AVG-平均值;SUM-求和
const numberOption = [
    {
        label: 'selfConfig.SUM',
        value: 'SUM',
    },
    {
        label: 'selfConfig.AVG',
        value: 'AVG',
    },
    {
        label: 'selfConfig.MAX',
        value: 'MAX',
    },
    {
        label: 'selfConfig.MIN',
        value: 'MIN',
    },
    {
        label: 'selfConfig.COUNT',
        value: 'COUNT',
    },
    {
        label: 'selfConfig.Distinct',
        value: 'DISTINCT_COUNT'
    },
    {
        label: 'selfConfig.stringConcat',
        value: 'GROUP_CONCAT'
    }
]

watch(() => operActiveId.value, (val) => {
    if (selfFlag.value === 'edit') {
        const uuids = tableSource.value.map(i => i.uuid)
        if (uuids.includes(val)) {
            const data = tableSource.value.find(item => item.uuid === val)
            if (data.action === 'group') {
                summaryItemList.value = data.contents.aggregate
                groupItemList.value = []
                if (data.contents.columns) {
                    data.contents.columns.forEach(item => {
                        groupItemList.value.push({
                            column: item 
                        })
                    })
                } else {
                    groupItemList.value = [
                        {
                            column: '',
                        },
                    ]
                }
                const groups = groupItemList.value.map(i => i.column)
                const summarys = summaryItemList.value.map(i => i.column)
                codeSetList.value.codeList.forEach((option) => {
                    if (groups.includes(option.columnName)) {
                        option.groupFiledDisabled = true
                    }
                    if (summarys.includes(option.columnName)) {
                        option.summaryFiledDisabled = true
                    }
                })
            }
        }
    }
}, {
    immediate: true
})

// 添加分组字段
const addGroupFiled = () => {
    groupItemList.value.push({
        column: '',
    })
    // 超出最大高度 滚动滚动条到最底部
    foldRef.value.setScrollTop()
}

// 禁用已经选择的下拉选项
const disabledSelectOption = (type) => {
    codeSetList.value.codeList.forEach((option) => {
        if (type === 'group') {
            option.groupFiledDisabled = false
            groupItemList.value.forEach((item) => {
                if (item.column === option.columnName) {
                    option.groupFiledDisabled = true
                }
            })
        } else if (type === 'summary') {
            option.summaryFiledDisabled = false
            summaryItemList.value.forEach((item) => {
                if (item.column === option.columnName) {
                    option.summaryFiledDisabled = true
                }
            })
        }
    })
}

// 每个字段仅能选一次
const groupFiledChangeHandle = (value) => {
    disabledSelectOption('group')

    updataTableData()
}

// 移除分组字段
const removeGroupItem = (index) => {
    groupItemList.value.splice(index, 1)
    disabledSelectOption('group')
    updataTableData()
}

// 添加汇总字段
const addSummaryFiled = () => {
    summaryItemList.value.push({
        column: '',
        method: '',
    })
    // 超出最大高度 滚动滚动条到最底部
    foldRef.value.setScrollTop()
}

const summaryFiledChangeHandle = (value) => {
    disabledSelectOption('summary')

    updataTableData()
}

const summaryMethodChangeHandle = (index) => {
    updataTableData()
}

// 移除汇总字段
const removeSummaryItem = (index) => {
    // let item = optionList.value.find(it => it.columnName === tempItem.column)
    // if (item) {
    //     item.summaryFiledDisabled = false
    // }
    summaryItemList.value.splice(index, 1)
    disabledSelectOption('summary')

    updataTableData()
}

// 更新数据
const updataTableData = () => {
    // 判断是否每条配置都有数据
    let groupFlag = groupItemList.value.every((item) => item.column)
    let summaryFlag = summaryItemList.value.every((item) => item.column && item.method)

    // {
    // "action":"group",
    // "contents":{
    //     "columns":["name"],//参与分组的列名
    //     "aggregate":[{
    //     "method":"MAX",//汇总方法 可选:MAX-最大值;MIN-最小值;COUNT-计数;AVG-平均值;SUM-求和;(待定)
    //     "column":"age"//统计的列名
    //     }]//汇总字段
    // }
    // }

    if (summaryFlag) {
        let columns = groupItemList.value.map((it) => it.column)
        var contents = {}
        if (groupFlag) {
            contents = {
                columns: columns,
                aggregate: summaryItemList.value,
            }
        } else {
            contents = {
                aggregate: summaryItemList.value,
            }
        }
        let orderConfig = {
            uuid: operActiveId.value,
            action: 'group',
            contents,
        }
        useConfigStore.setTableSource(orderConfig, 'change', activeTabKey.value)
        useConfigStore.setSelfConfig(orderConfig, 'group', activeTabKey.value)
    }
}

// 异常字段列名
const errorCodeCols = computed(() => 
    codeSetList.value.codeList.filter(code => code.errorColumn)
        .map(it => it.columnName)
)

const includeCurVal = (value) => {
    if(!codeSetList.value.codeList?.length) return true
    return !value ||codeSetList.value.codeList.some(item => item.columnName === value)
}

const filterOption = (input, option) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
</script>

<style lang="less" scoped>
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

.group-warpper {
    .main-container {
        border-radius: 4px;
        margin-bottom: 10px;
        display: flex;

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

                    &:nth-of-type(2) {
                        width: 96px;
                        margin: 0 10px;
                    }
                }

                img {
                    width: 16px;
                    height: 16px;
                    margin-left: 12px;
                    cursor: pointer;
                }
                :deep(.ant-select-selection-item){
                    span[role="img"] {
                        svg{
                            width: 16px;
                            height: 16px;
                            position: relative;
                            top: 3px;
                        }
                    }
                    .colName{
                        margin-left: 4px;
                    }
                }
            }

            .add-item {
                cursor: pointer;
                font-size: 14px;
                line-height: 20px;
                color: #3d82f2;
                display: inline-flex;
                align-items: center;

                img {
                    width: 14px;
                    height: 14px;
                    margin-right: 4px;
                }
            }
        }
    }
}
</style>
