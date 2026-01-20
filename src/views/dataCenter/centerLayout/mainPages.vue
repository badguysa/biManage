<template>
    <div class="mainPages">
        <tabs />
        <!-- 添加表 -->
        <div v-if="pageId == 'pageTable' || pageId == 'pageExcel'" class="bodyBox"
            :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <tableTree 
                :height="tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`"
            />
            <div>
                <stasticTable />
            </div>
        </div>

        <!-- DB数据库 -->
        <div v-if="pageId == 'pageDB'">
            <DBPage />
        </div>

        <!-- kafka导入 -->
        <div v-if="pageId == 'kafkaPage'">
            <KafkaPage />
        </div>

        <!-- 表单应用 -->
        <div v-if="pageId == 'pageForm'">
            <formPage :height="tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`" />
        </div>

        <!-- SQL导入 -->
        <div v-if="pageId == 'pageSql'"
            :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <SqlPage />
        </div>

        <!-- 自助配置begin -->
        <div v-show="pageId == 'pageConfig'"
            :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <template v-for="item in configUniqueData" :key="item.uniqueId">
                <selfConfig v-show="item.uniqueId === activeTabKey"></selfConfig>
            </template>
        </div>

        <!-- 更新记录 -->
        <div v-if="pageId == 'updateRecord'"
            :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <updateRecord/>
        </div>

        <!-- 编辑表 -->
        <div v-if="pageId === 'PageEditTable'"
            :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <editTablePage />
        </div>

        <!-- 数据字典 -->
        <div v-if="pageId === 'dataDictionary'">
            <dataDictionary  :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}" />
        </div>

        <!-- 回收站 -->
        <div v-if="pageId === 'pageBin'" :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}">
            <recycleBinPage></recycleBinPage>
        </div>

        <!-- 血缘分析 -->
        <div v-if="pageId === 'bloodRelation'">
            <bloodRelation :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}" ></bloodRelation>
        </div>

        <!-- api导入 -->
        <div v-if="pageId === 'ApiPage'">
            <apiImportPage :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}" ></apiImportPage>
        </div>

        <!-- 标准导入 -->
        <div v-if="pageId === 'standardPage'">
            <importStandard :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}" ></importStandard>
        </div>

        <!-- 标准导入 -->
        <div v-if="pageId === 'standardCheck'">
            <standardCheck :style="{height: tabsList.length ? `calc(100vh - 126px)` : `calc(100vh - 91px)`}" ></standardCheck>
        </div>

        <!-- 添加分组 -->
        <groupModal v-if="groupModalVisible" />

        <!-- 菜单图标库 -->
        <iconModal v-if="iconModalVisible" />

        <!-- 添加空表 -->
        <addTableModal v-if="addTableModalVisible" />

        <!-- 移动表 -->
        <moveTableModal v-if="moveTableModalVisible" />

        <!-- excel导入 -->
        <uploadModal v-if="uploadModalVisible"/>

        <!-- 自助配置选择要合并的表弹框 -->
        <mergeModal v-if="mergeModalVisible" />

        <deleteModal v-if="deleteModalVisible" />

        <!-- 数据库更新策略 -->
        <updateModal v-if="updateModalVisible" />

        <!-- 自助配置更新策略 -->
        <selfUpdateModal v-if="selfUpdateModalVisible"/>

        <!-- 添加DB -->
        <DBModal v-if="DBModalVisible" />

        <!-- 自助配置删除步骤 -->
        <delProgressModal v-if="deleteProgressVisible" />

        <!-- API导入 参数设置 -->
        <apiParamsModal v-if="apiParamsModalVisible" />

        <!-- API导入 删除参数 -->
        <apiParamsDelModal v-if="apiParamsDelModalVisible" />

        <!-- api导入更新策略说明弹窗 -->
        <apiDescModal v-if="apiDescModalVisible" />

        <!-- 下载数据格式 -->
        <downloadDoscModal v-if="downloadDoscModalVisible" />

        <!-- 添加列弹窗 -->
        <addColumnModal v-if="addColumnModalVisible" />
        
        <!-- 设置显示行数弹窗 -->
        <setPageSizeModal v-if="setPageSizeModalVisible" />

        <!-- 筛选弹窗 -->
        <filterModal v-if="fileterModalVisible" />
        
        <!-- 添加kafka -->
        <kafkaModal v-if="kafkaModalVisible"/>

        <!-- 自助配置另存为弹窗 -->
        <saveAsModal v-if="saveAsModalVisible"/>
    </div>
</template>

<script setup>
import { watch, computed, nextTick } from 'vue';
import groupModal from './modals/groupModal';
import iconModal from './modals/iconModal';
import addTableModal from './modals/addTableModal';
import moveTableModal from './modals/moveTableModal';
import uploadModal from './modals/uploadModal/index.vue';
import mergeModal from './modals/mergeModal';
import deleteModal from './modals/deleteTableModal';
import addColumnModal from './modals/addColumnModal'
import apiParamsModal from './modals/apiParamsModal'
import updateModal from './modals/updateModal';
import delProgressModal from './modals/delProgressModal';
import DBModal from './modals/databaseModal/index.vue'
import kafkaModal from './modals/addKafkaModal/index.vue'
import saveAsModal from './modals/savaAsModal'
import tabs from './tabs'
import tableTree from './tableTree'
import stasticTable from './mainArea/table/stasticTable'
import selfConfig from './mainArea/selfconfig'
import formPage from '@/views/dataCenter/centerLayout/mainArea/form'
import DBPage from '@/views/dataCenter/centerLayout/mainArea/db'
import SqlPage from '@/views/dataCenter/centerLayout/mainArea/sql'
import apiImportPage from '@/views/dataCenter/centerLayout/mainArea/apiImport/index'
import editTablePage from '@/views/dataCenter/centerLayout/mainArea/editTableInfo'
import KafkaPage from '@/views/dataCenter/centerLayout/mainArea/kafka'
import updateRecord from './mainArea/updateRecord'
import dataDictionary from './mainArea/dataDictionary'
import selfUpdateModal from './modals/selfUpdateModal'
import apiParamsDelModal from './modals/apiParamsDelModal'
import apiDescModal from './modals/apiDescModal'
import downloadDoscModal from './modals/downloadDoscModal'
import setPageSizeModal from './modals/setPageSizemodal'
import recycleBinPage from '@/views/dataCenter/centerLayout/mainArea/recycleBin'
import bloodRelation from './mainArea/bloodRelation'
import filterModal from './modals/filterModal'
import importStandard from '@/views/dataCenter/centerLayout/mainArea/importStandard'
import standardCheck from '@/views/dataCenter/centerLayout/mainArea/standardCheck'

// Store begin
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import { storeToRefs } from 'pinia'
const useModalStore = modalStore()
const useMainStore = mainStore()
const useConfigStore = configStore()
const { tabsList, pageId, activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)
const {
    groupModalVisible,
    iconModalVisible,
    addTableModalVisible,
    moveTableModalVisible,
    uploadModalVisible,
    mergeModalVisible,
    deleteModalVisible,
    addColumnModalVisible,
    updateModalVisible,
    DBModalVisible,
    kafkaModalVisible,
    saveAsModalVisible,
    deleteProgressVisible,
    selfUpdateModalVisible,
    apiImportModalVisible,
    apiParamsModalVisible,
    apiParamsDelModalVisible,
    apiDescModalVisible,
    downloadDoscModalVisible,
    setPageSizeModalVisible,
    fileterModalVisible
} = storeToRefs(useModalStore)
const { configUniqueData } = storeToRefs(useConfigStore)
// Store end
const activeTableId = computed(() => {
    let activeData = {}
    if (indexTableActiveId.value.length) {
        activeData = indexTableActiveId.value.find(i => i.tabId === activeTabKey.value)
    }
    if (activeData) {
        return activeData.id
    } 
    return ''
})
watch(pageId, async (newVal) => {
    await nextTick()
    // 如果该分组下有被选中的表而且是切换到主页面，切换到的时候对表格进行初始化
    if (activeTableId.value && newVal === 'pageTable') {
        useMainStore.getIndexTable({
            id: activeTableId.value
        })
    }
})
</script>

<style lang="less" scoped>
.mainPages {
    width: calc(100vw - 200px);
    height: calc(100vh - 60px);
    border-radius: 0px 4px 4px 4px;
    padding: 12px;
    background: #F2F4FA;
    display: flex;
    flex-direction: column;

    .bodyBox {
        display: flex;
        background: #fff;
    }
}
</style>