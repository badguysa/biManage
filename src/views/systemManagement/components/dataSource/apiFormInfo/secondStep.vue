<template>
    <div class="parse-result">
        <span class="head-span-text">
            <span>{{ t('api.dataStructure') }}</span>
            <span v-if="isCrossLevel">{{ t('api.secondStepTip') }}</span>
        </span>
        <div :class="[isCrossLevel ? 're-grid-box' : 'pr-grid-box']">
            <div class="grid-th">{{ t('api.parseField') }}</div>
            <div class="grid-th">{{ t('common.codeName') }}</div>
            <div class="grid-th">{{ t('api.codeType') }}</div>
            <div v-if="isCrossLevel" class="grid-th">关联字段</div>
        </div>
        <div 
            ref="gridBoxRef" 
            @scroll="onScroll" 
            :class="[isCrossLevel ? 're-grid-box' : 'pr-grid-box']" 
            :style="{height: '300px' , overflow: 'scroll', marginTop: '8px'}"
        >
            <div :style="{overflowX: 'scroll', overflowY: 'hidden', height: '100%'}">
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
                <div class="blank"></div>
            </div>
            <template v-if="allowRender">
                <!-- <div style="overflow-x: scroll; overflow-y: hidden">
                    <Menu flag="first" :propsData="requestData" />
                </div> --> 
                <div>
                    <Menu flag="second" :propsData="requestData" />
                </div>
                <div>
                    <Menu flag="third" :propsData="requestData" />
                </div>
                <div v-if="isCrossLevel">
                    <Menu flag="fourth" :propsData="requestData" />
                </div>
            </template>
        </div>
        <div class="table-box" :style="{ paddingTop: apiTableDataList.length === 1 ? '12px' : '' }" v-if="apiTableDataList.length">
            <template v-for="(item, index) in apiTableDataList">
                <div v-if="apiTableDataList.length > 1" class="table-name">{{ tableName + (index + 1) }}</div>    
                <myTable 
                    :tableColumns="createTableData(item).columns"
                    :tableData="createTableData(item).data"
                />
            </template>
        </div>
        <!-- {{ requestData }} -->
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import Menu from './menu.vue';
import { mainStore } from '@/Stores/mainStore';
import myTable from '@/components/table';
import { useI18n } from 'vue-i18n';
import { createTableData } from '@/utils/apiParse'
const { t } = useI18n()
const useMainStore = mainStore()
const { requestData, apiPreviewColumns, apiPreviewData, checkedKeys, settingKeys, isCrossLevel, apiTableDataList } = storeToRefs(useMainStore)
const allowRender = ref(true)
const scrollHeight = ref(430)
const gridBoxRef = ref({})
defineProps({
    tableName: {
        default: ''
    }
})
const onExpand = (keys, node) => {
    allowRender.value = false
    node.node.dataRef.isExpand = !node.node.dataRef.isExpand
    nextTick(() => {
        allowRender.value = true
    })
}
const onScroll = () => {
    // scrollHeight.value = 430 + gridBoxRef.value.scrollTop
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
const onCheck = (keys, checkedNodes) => {
    handleData(checkedNodes.node.dataRef, checkedNodes.checked)
    allowRender.value = false
    nextTick(() => {
        allowRender.value = true
    })
    let tempData = []
    if (checkedNodes.checkedNodes.length) {
        checkedNodes.checkedNodes.forEach(item => {
            if (!item.children) {
                tempData.push(item)
            }
        })
        useMainStore.changeSettingKeys(tempData, 'set')
        // const table = createTableData(settingKeys.value)
        // useMainStore.setApiPreviewColumns(table.columns)
        // useMainStore.setApiPreviewData(table.data)
        let flagNums = tempData.map(i => i.flagNum)
        flagNums = [...new Set(flagNums)]
        if (flagNums.length > 1) {
            isCrossLevel.value = true
        } else {
            isCrossLevel.value = false
        }
    } else {
        useMainStore.changeSettingKeys([], 'set')
        // useMainStore.setApiPreviewColumns([])
        // useMainStore.setApiPreviewData([])
        isCrossLevel.value = false
    }
    useMainStore.setMultiDataList()
}

</script>

<style lang="less" scoped>
.parse-result {
    width: 100%;
    margin-top: 10px;
    margin-right: -25px;
    .head-span-text {
        &>:nth-child(1) {
            font-weight: 500;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
        }
        &>:nth-child(2) {
            font-weight: 400;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            margin-left: 10px;
        }
    }
    .pr-grid-box, .re-grid-box {
        display: grid;

        margin-top: 16px;
        :deep(.ant-tree .ant-tree-treenode) {
            height: 32px;
            margin-top: 4px;
        }
        .grid-th {
            font-weight: 600;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
        }
        .blank {
            
        }
    }
    .pr-grid-box {
        grid-template-columns: 160px 160px auto;
    }
    .re-grid-box {
        grid-template-columns: 120px 120px 116px auto;
    }
    .table-box {
        width: 510px;
        margin-top: 10px;
        overflow-x: scroll;
        border-top: 1px solid #E9E9E9;
        max-height: 210px;
        .table-name {
            margin: 12px 0;
            color: rgba(0, 0, 0, 0.8);
            font-weight: 500;
            font-size: 14px;
        }
    }
    :deep(.ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner::after) {
        height: 2px;
    }
}
</style>