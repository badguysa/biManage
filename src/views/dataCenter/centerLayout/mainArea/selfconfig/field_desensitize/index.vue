<script setup>
import { onMounted, ref, reactive, computed, toRefs } from 'vue';
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import * as _ from 'lodash'
import { previewSensitive } from '@/apis/group'
import previewTable from '@/components/selfconfig/previewTable'
import desensitizationModal from './desensitizationModal'
import { getPreviewData } from '@/apis/config'
import { getimgType } from '@/utils/utils'

const { t } = useI18n()

const useMainStore = mainStore()
const useConfigStore = configStore()

const { indexTableColumns, indexTableDesc, activeTabKey} = storeToRefs(useMainStore)


const { configUniqueData } = storeToRefs(useConfigStore)

const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})

const { selfFlag } = toRefs(configData.value)


const setItem = ref({})

const state = reactive({
    editCodeList: [],
    previewColumns: [],
    previewData: [],
    paramsOptions: [], // 获取预览数据参数
    modalVisible: false,
})


onMounted(() => {
    if(selfFlag.value !== 'edit') return

    state.editCodeList = _.cloneDeep(indexTableColumns.value)

    setParamsOptions('init')
})

const setParamsOptions = (type) => {
    let columns = []
    state.editCodeList.forEach(item => {
        columns.push(item.columnName)
    })
    state.paramsOptions = [{
        action: "select",
        contents: {
            tableId: indexTableDesc.value.id,
            columns
        }
    }]

    getPreviewData(state.paramsOptions).then(res => {
        if (res.code == 1) {
            state.previewColumns = []
            state.previewData = []
            const columns = res.data.targetTableColumns
            const sortArr = res.data.columnNames
            for (let val in sortArr) {
                for (let key in columns) {
                    if (sortArr[val] == columns[key].columnName) {
                        columns[key].dataIndex = key
                        columns[key].imgType = getimgType(columns[key].columnType)
                        state.previewColumns.push(columns[key])
                    }
                }
            }
            state.previewData = res.data.queryResult || []
        } else {
            state.previewColumns = []
            state.previewData = []
            // message.error(t('otherConfig.getPreivewDataError'))
            message.error(res.message)
        }
        
        getPreviewSensitive(type)
    })
}


const showModal = (record) => {
    setItem.value = record
    state.modalVisible = true
}

const modalCancel = () => {
    state.modalVisible = false
}

const modalConfirm = (data) => {
    const findIndex = state.previewColumns.findIndex(item => item.id === setItem.value.id)
    state.previewColumns[findIndex].sensitiveConfig = data.rule === 'none' ? { rule: 'none' } : data
    state.modalVisible = false
    getPreviewSensitive('update')
}

const getPreviewSensitive = (type) => {
    const columnInfo = state.previewColumns.map(item => ({
        columnName: item.columnName,
        columnAlias: item.columnAlias,
        sensitiveConfig: item.sensitiveConfig || null
    }))

    // 存储设置了脱敏的字段
    type === 'update' && useConfigStore.setDesensitizeInfo(
        columnInfo.filter(it => it.sensitiveConfig)
    )

    const jsonData = {
        columns: columnInfo,
        table: {
            id: indexTableDesc.value.id
        }
    }
    previewSensitive(jsonData).then(res => {
        if (res.code === 1) {
            state.previewData = res.data || []
        }
    })
}

</script>

<template>
  <div class="desensitizeWrap">
    <preview-table
        flag="desensitize" 
        @desensitize="showModal"
        :tableColumns="state.previewColumns" 
        :tableData="state.previewData" 
    />
    <desensitizationModal 
      v-if="state.modalVisible" 
      :setItem="setItem" 
      @modalCancel="modalCancel"
      @modalConfirm="modalConfirm">
    </desensitizationModal>
  </div>
</template>

<style lang="less" scoped>
.desensitizeWrap{
  width: 100%;
  background-color: #fff;
  flex-grow: 1;
  display: flex;
  overflow: auto;
}
</style>
