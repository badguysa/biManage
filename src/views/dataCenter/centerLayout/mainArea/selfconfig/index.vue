<template>
    <a-spin :spinning="selfImportLoading">
    <div class="config">
        <configHead/>
            <div 
                class="rightBlank" 
                v-show="showType !== 'desensitization'"
            >
                <selectOper />
                <div class="operateWrap">
                    <tableCode v-show="showType === 'selectCode'" />
                    <template v-if="filterArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'filterData')" v-for="item in filterArray" :key="item.uuid">
                            <fliterData v-show="showType === 'filterData' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="sortArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'sortData')" v-for="item in sortArray" :key="item.uuid">
                            <sortTable v-show="showType === 'sortData' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="addColumnsArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'addColumns')" v-for="item in addColumnsArray" :key="item.uuid">
                            <addColumn v-show="showType === 'addColumns' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="groupDataArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'groupData')" v-for="item in groupDataArray" :key="item.uuid">
                            <groupSummary v-show="showType === 'groupData' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="codeSetArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'codeSetting')" v-for="item in codeSetArray" :key="item.uuid">
                            <codeSet v-show="showType === 'codeSetting' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="mergeDataArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'mergeData')" v-for="item in mergeDataArray" :key="item.uuid">
                            <mergeTable v-show="showType === 'mergeData' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <template v-if="deweightDataArray.length > 0">
                        <div class="configWrap" :style="getWrapStyle(item, 'distinct')" v-for="item in deweightDataArray" :key="item.uuid">
                            <deweight v-show="showType === 'distinct' && item.uuid === operActiveId" />
                        </div>
                    </template>
                </div>
            </div>
            <!-- 字段脱敏 -->
            <fieldDesensitization v-if="selfFlag === 'edit'" v-show="showType === 'desensitization'" />
        </div>
    </a-spin>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import configHead from './head_add'
import selectOper from './progress_left'
import tableCode from './table_code'
import fliterData from './fliter_data'
import codeSet from './code_set'
import mergeTable from './merge_tables'
import sortTable from './table_sort'
import groupSummary from './group_summary'
import addColumn from './add_column'
import deweight from './deweight'
import fieldDesensitization from './field_desensitize'

const useConfigStore = configStore()
const useMainStore = mainStore()
const { activeTabKey } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { showType, operationList, operActiveId, selfImportLoading, selfFlag } = toRefs(configData.value)
const filterArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "filterData")
    if (arr.length > 0) return arr
    return []
})
const sortArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "sortData")
    if (arr.length > 0) return arr
    return []
})
const addColumnsArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "addColumns")
    if (arr.length > 0) return arr
    return []
})
const groupDataArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "groupData")
    if (arr.length > 0) return arr
    return []
})
const codeSetArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "codeSetting")
    if (arr.length > 0) return arr
    return []
})
const mergeDataArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "mergeData")
    if (arr.length > 0) return arr
    return []
})

const deweightDataArray = computed(() => {
    const arr = operationList.value.filter(i => i.id === "distinct")
    if (arr.length > 0) return arr
    return []
})

const getWrapStyle = (item, targetType) => {
    return (item.uuid === operActiveId.value && targetType === showType.value) ? {height: '100%'} : {}
}
</script>

<style lang="less" scoped>
:deep(.ant-spin-container) {
    height: calc(-126px + 100vh);
}
.config {
    font-style: normal;
    height: 100%;
    display: flex;
    flex-direction: column;
    .rightBlank {
        display: flex;
        flex-grow: 1;
        gap: 12px;
        overflow: hidden;
        .configWrap{
            &>div{
                width: calc(100vw - 396px);
                height: 100%;
                display: flex;
                gap: 12px;
                &:not(.codeSet){
                    flex-direction: column;
                }
            }
        }
        .operateWrap{
            height: 100%;
            flex-grow: 1;
        }
    }
}
</style>