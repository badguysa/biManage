<template>
    <div :class="{config: true, apiConfig: apiPageId === 'addApiPage'}">
        <configHead v-if="apiPageId === 'addApiPage'" />
        <!-- <a-spin :spinning="selfImportLoading" style="height: 100%;"> -->
            <div class="rightBlank">
                <selectOper />
                <div style="height: 100%;">
                    <tableCode v-show="showType === 'selectCode'" />
                    <!-- 添加api时显示的筛选 -->
                    <template v-if="filterArray.length > 0 && apiPageId === 'addApiPage'">
                        <div class="configWrap" :style="getWrapStyle(item, 'filterData')" v-for="item in filterArray" :key="item.uuid">
                            <fliterData v-show="showType === 'filterData' && item.uuid === operActiveId" />
                        </div>
                    </template>
                    <!-- 添加推送主题时显示的筛选 -->
                    <template v-if="filterArray.length > 0 && apiPageId === 'addPushThemePage'">
                        <div class="configWrap" :style="getWrapStyle(item, 'filterData')" v-for="item in filterArray" :key="item.uuid">
                            <themeFilterData v-show="showType === 'filterData' && item.uuid === operActiveId" />
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
                </div>
            </div>
        <!-- </a-spin> -->
    </div>
</template>

<script setup>
import { onUnmounted, computed } from 'vue'
import { apiConfigStore } from '@/Stores/apiConfigStore'
import { mainStore } from '@/Stores/mainStore'
import { apiManageStore } from '@/Stores/apiManageStore'
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
import themeFilterData from './theme_filter_data'
const useApiConfigStore = apiConfigStore()
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { apiPageId } = storeToRefs(useApiManageStore)
const { showType, operationList, operActiveId, selfImportLoading } = storeToRefs(useApiConfigStore)
onUnmounted(() => {
    useMainStore.setDynamicNum('over')
})
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

const getWrapStyle = (item, targetType) => {
    return (item.uuid === operActiveId.value && targetType === showType.value) ? {height: '100%'} : {}
}
</script>

<style lang="less" scoped>
.config {
    height: 100%;
    &.apiConfig{
        height: calc(100% - 36px);
        display: flex;
        flex-direction: column;
    }
    .rightBlank {
        height: 100%;
        display: flex;
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
    }
}
</style>