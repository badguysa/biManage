<!-- 多表合并 -->
<template>
    <div class="merge" ref="mergeWrapRef">
        <foldContainer operateType="merge" ref="foldRef">
            <a-form :model="modelData">
                <div class="gridBox">
                    <div class="col1">{{ t('selfConfig.willMergeTable') }}</div>
                    <div class="col2">
                        <span class="mr12">{{ t('selfConfig.leftTable') }}</span>
                        <div class="mr50">
                            <div :class="{leftTable: true, errorTable: leftErrorCols.length}">
                                <BiIcon :name="leftMergetTableIcon" :class="tableSvgClass(leftMergeTable, 'left')"/>
                                <a-tooltip :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                                    <template #title>
                                        {{ leftMergeTable.tableAlias }}
                                    </template>
                                    <span class="text">{{ leftMergeTable.tableAlias }}</span>
                                </a-tooltip>
                            </div>
                        </div>
                        <span class="mr12">{{ t('selfConfig.rightTable') }}</span>
                        <div @click="selectRightTable" :class="{rightTable: true, errorTable: rightErrorCols.length}">
                            <template v-for="item in rightMergeTable" :key="item.uuid">
                                <div v-if="item.uuid === operActiveId" class="text-box">
                                    <BiIcon :name="item.iconName" :class="tableSvgClass(item, 'right')"/>
                                    <a-tooltip :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                                        <template #title>
                                            {{ item.tableAlias }}
                                        </template>
                                        <span class="text">{{ item.tableAlias }}</span>
                                    </a-tooltip>
                                </div>
                            </template>
                            <img class="right" src="@/assets/icons/arrows-right.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="gridBox">
                    <div class="col1">{{ t('selfConfig.mergeType') }}</div>
                    <div class="col2">
                        <div :class="{center_box: true, active: state.activeKey == item.id}" v-for="item in state.mergeStyle" :key="item.id"
                            @click="selectStyle(item)">
                            <a-tooltip>
                                <template #title>
                                    {{ t(item.desc) }}
                                </template>
                                <img :src="state.activeKey == item.id ? item.src : item.src1" alt="">
                            </a-tooltip>
                            {{ t(item.text) }}
                        </div>
                    </div>
                </div>
                <div class="gridBox" style="align-items: flex-start">
                    <div class="col1">{{ t('selfConfig.mergeBasis') }}</div>
                    <div class="col2 col32">
                        <div class="col23" v-for="(item, index) in modelData.basis" :key="item.id">
                            <div class="mr12">
                                <a-form-item>
                                    <a-select 
                                        :class="{errorField: leftErrorCols.includes(item.leftCode) || !includeCurVal(item.leftCode)}" 
                                        :notFoundContent="t('common.noData')"
                                        v-model:value="item.leftCode"
                                        @select="selectLeftCode(item)" 
                                        style="width: 200px"
                                        show-search
                                        :filter-option="filterOption"
                                    >
                                        <a-select-option 
                                            v-for="filedItem in leftData.codeList" 
                                            :value="filedItem.columnName" 
                                            @click="filedSelect(filedItem, 1)"
                                            :disabled="filedItem.mergeDisabled"
                                            :label="filedItem.columnAlias || filedItem.columnName"
                                        >
                                            <span role="img">
                                                <BiIcon :name="getTypeIconSvg(filedItem)" :class="getTypeIconClassName(filedItem)"/>
                                            </span>
                                            <span class="colName">
                                                {{ filedItem.columnAlias || filedItem.columnName }}
                                            </span>
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                            </div>
                            <div class="mr12">{{ t('selfConfig.correspond') }}</div>
                            <a-form-item>
                                <a-select
                                    :class="{errorField: rightErrorCols.includes(item.rightCode)}" 
                                    :notFoundContent="t('common.noData')"
                                    v-model:value="item.rightCode"
                                    @select="selectRightCode(item)"
                                    style="width: 200px"
                                    show-search
                                    :filter-option="filterOption"
                                >
                                    <template v-for="codeItem in rightCodeArray" :key="codeItem.uuid">
                                        <template v-if="codeItem.uuid === operActiveId">
                                            <a-select-option 
                                                v-for="filedItem in getTargetList(codeItem.codeBackList)"
                                                :value="filedItem.columnName"
                                                @click="filedSelect(filedItem, 2)"
                                                :disabled="filedItem.mergeDisabled"
                                                :label="filedItem.columnAlias || filedItem.columnName"
                                            >
                                                <span role="img">
                                                    <BiIcon :name="getTypeIconSvg(filedItem)" :class="getTypeIconClassName(filedItem)"/>
                                                </span>
                                                <span class="colName">
                                                    {{ filedItem.columnAlias || filedItem.columnName }}
                                                </span>
                                            </a-select-option>
                                        </template>
                                    </template>
                                </a-select>
                            </a-form-item>
                            <img class="del" @click="removeItem(item)" v-if="modelData.basis.length > 1"
                                src="@/assets/icons/delete.png" alt="delete">
                        </div>
                        <div class="plus" @click="onPlus">
                            <img src="@/assets/icons/add_relation.png" alt="">
                            {{ t('selfConfig.addMergeBasis') }}
                        </div>
                    </div>
                </div>
            </a-form>
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
import { Form, message } from 'ant-design-vue'
import { reactive, toRaw, computed, onMounted, toRefs, watch } from 'vue'
import { configStore } from '@/Stores/configStore'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { storeToRefs } from 'pinia'
import { getTableSvg, getTypeIconSvg, getTypeIconClassName } from '@/utils/utils';
import { getIndexTableDetail } from '@/apis/group';
import previewTable from '@/components/selfconfig/previewTable'
import foldContainer from "@/components/selfconfig/foldContainer";
import { v4 as uuidv4 } from 'uuid';
import Frame from '@/assets/mergeIcon/Frame.png'
import Frame1 from '@/assets/mergeIcon/Frame-1.png'
import Frame2 from '@/assets/mergeIcon/Frame-2.png'
import Frame3 from '@/assets/mergeIcon/Frame-3.png'
import Frame4 from '@/assets/mergeIcon/Frame-4.png'
import Frame5 from '@/assets/mergeIcon/Frame-5.png'
import Frame6 from '@/assets/mergeIcon/Frame-6.png'
import Frame7 from '@/assets/mergeIcon/Frame-7.png'
import Frame8 from '@/assets/mergeIcon/Frame-8.png'
import Frame9 from '@/assets/mergeIcon/Frame-9.png'
import { useI18n } from 'vue-i18n'
import { useErrorStep } from '@/hooks/selfConfig/useErrorStep'

const { t } = useI18n()
const useConfigStore = configStore()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { activeTabKey } = storeToRefs(useMainStore)
const { mergeModalVisible } = storeToRefs(useModalStore)

const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { 
    leftMergeTable,
    rightMergeTable,
    operActiveId,
    rightCodeArray,
    rightErrorCodeList,
    previewColumns,
    previewData,
    allConfigData,
    tableLoading,
    selfConfig,
    selfFlag,
    tableSource,
    totalDataCount
 } = toRefs(configData.value)

 const { stepError } = useErrorStep()

 const mergeWrapRef = ref()

watch(mergeModalVisible, () => {
    if(!mergeModalVisible.value) {
        // console.log('run watch merge modal visible')
        parseData(toRaw(modelData))
    }
})

const leftData = computed(() => {
    let data = {}
    if (allConfigData.value.length > 0) {
        allConfigData.value.forEach(item => {
            if (item.uuid === operActiveId.value) {
                data = item
            }
        })
    }
    return data
})

const rightTableId = computed(() => 
    rightMergeTable.value.find(i => i.uuid === operActiveId.value)?.id || ''
)

const getTargetList = (list) => {
    let arr = []

    if(!list || !list.length) return arr

    if (list && list.length > 0) {
        arr = list.filter(item => item.isSelect)
    }

    // 关联右表是否包含异常字段
    // if(rightErrorCodeList?.value[rightTableId.value]) {
    //     arr.unshift(...rightErrorCodeList.value[rightTableId.value])
    // }
    return arr
}

const modelData = reactive({
    basis: [{
        id: uuidv4().split('-')[0],
        leftCode: '',
        rightCode: ''
    }],
})
const state = reactive({
    mergeStyle: [{
        id: 'left',
        text: 'selfConfig.leftMerge',
        src: Frame6,
        src1: Frame7,
        desc: 'selfConfig.leftMergeTip'
    }, {
        id: 'right',
        text: 'selfConfig.rightMerge',
        src: Frame5,
        src1: Frame4,
        desc: 'selfConfig.rightMergeTip'
    }, {
        id: 'full',
        text: 'selfConfig.fullMerge',
        src: Frame3,
        src1: Frame2,
        desc: 'selfConfig.fullMergeTip'
    }, {
        id: 'inner',
        text: 'selfConfig.innerMerge',
        src: Frame1,
        src1: Frame,
        desc: 'selfConfig.innerMergeTip'
    }, {
        id: 'union all',
        text: 'selfConfig.unionAllMerge',
        src: Frame9,
        src1: Frame8,
        desc: 'selfConfig.unionAllMergeTip'
    }],
    activeKey: 'left'
})

const foldRef = ref(null)

watch(() => operActiveId.value, (val) => {
    if (selfFlag.value === 'edit') {
        const uuids = tableSource.value.map(i => i.uuid)
        if (uuids.includes(val)) {
            const data = tableSource.value.find(item => item.uuid === val)
            if (data.action === 'join') {
                const tableId = data.contents.tableId
                const columns = data.contents.columns.map(i => i.targetColumn)
                state.activeKey = data.contents.type
                const config = {
                    action: "select",
                    contents: {
                        tableId: tableId, //表ID
                        columns
                    }
                }
                useConfigStore.getRightCodeList({ id: tableId },  activeTabKey.value, 'edit', columns)
                useConfigStore.getRightPreviewData(config, activeTabKey.value)
                useConfigStore.setExpandedKeys([tableId], 2, activeTabKey.value)
                if (data.contents.onColumns.length) {
                    const formBasic = data.contents.onColumns.map(item => ({
                        leftCode: item.originColumn,
                        rightCode: item.targetColumn,
                        id: uuidv4().split('-')[0],
                    }))
                    modelData.basis = formBasic
                }
                getIndexTableDetail({ id: tableId }).then(res => {
                    if (res.code === 1) {
                        // 设置svg图标
                        res.data.iconName = getTableSvg(res.data.tableType)
                        useConfigStore.setExpandedKeys([res.data.groupId], 1, activeTabKey.value)
                        useConfigStore.setRightMergeTable(res.data, activeTabKey.value)
                    }
                })
            }
        }
    }
}, {
    immediate: true
})

const filedSelect = (filedItem, type) => {
    filedItem.mergeDisabled = true
    if (type === 1) {
        const leftCodes =  modelData.basis.map(i => i.leftCode)
        leftData.value.codeList.forEach(i => {
            if (!leftCodes.includes(i.columnName)) {
                i.mergeDisabled = false
            }
        })
    } else {
        const rightCodes = modelData.basis.map(i => i.rightCode)
        rightCodeArray.value.find(i => i.uuid === operActiveId.value).codeList.filter(i => i.isSelect).forEach(i => {
            if (!rightCodes.includes(i.columnName)) {
                i.mergeDisabled = false
            }
        })
    }
}

const selectRightCode = (item) => {
    if (!item.leftCode || !item.rightCode) {
        message.warning(t('selfConfig.checkLeftCode'))
        return
    }
    parseData(toRaw(modelData))
}
const selectLeftCode = item => {
    if (item.rightCode) {
        parseData(toRaw(modelData))
    }
}

const parseData = (formData) => {
    // 获取选中的字段 begin
    let columnsData = {}
    rightCodeArray.value.forEach(i => {
        if (i.uuid === operActiveId.value) {
            columnsData = i
        }
    })
    if (!columnsData.codeList) return
    let columns = []
    columnsData.codeList.forEach(i => {
        if (i.isSelect) {
            columns.push({
                targetColumn: i.columnName,
                columnName: i.columnName + '_' + uuidv4().split('-')[0] + '_' + parseInt(Math.random() * 10),
                columnAlias: i.columnAlias
            })
        }
    })
    // 获取选中的字段 end
    let onColumns = formData.basis.map(item => {
        let obj = {
            originColumn: item.leftCode,
            targetColumn: item.rightCode
        }
        return obj
    })
    onColumns = onColumns.filter(i => {
        if (i.originColumn && i.targetColumn) return i
    })
    const rightTable = rightMergeTable.value.filter(i => i.uuid === operActiveId.value)
    const params = {
        uuid: operActiveId.value,
        action: "join",
        contents: {
            tableId: rightTable[0].id,
            columns,
            type: state.activeKey,
            onColumns
        }
    }
    if (!onColumns.length) {
        const findIndex = selfConfig.value.findIndex(i => i.uuid === operActiveId.value)
        if(findIndex<0) return
        useConfigStore.getPreviewData(selfConfig.value[findIndex - 1].config, '', '', activeTabKey.value)
        useConfigStore.setSelfConfig(params, 'delete', activeTabKey.value)
        return
    }
    useConfigStore.setTableSource(params, 'change', activeTabKey.value)
    useConfigStore.setSelfConfig(params, 'join', activeTabKey.value)
}

const removeItem = item => {
    leftData.value.codeList.forEach(i => {
        if (i.columnName === item.leftCode) {
            i.mergeDisabled = false
        }
    })
    rightCodeArray.value.find(i => i.uuid === operActiveId.value).codeList.filter(i => i.isSelect).forEach(i => {
        if (i.columnName === item.rightCode) {
            i.mergeDisabled = false
        }
    })
    modelData.basis = modelData.basis.filter(i => i.id !== item.id)
    parseData(modelData)
}

const onPlus = () => {
    const obj = {
        id: uuidv4().split('-')[0],
        leftCode: '',
        rightCode: '',
    }
    const lastItem = modelData.basis[modelData.basis.length - 1]
    if (!lastItem.leftCode || !lastItem.rightCode) {
        return message.warn(t('selfConfig.checkTip'))
    }
    modelData.basis.push(obj)
    // 超出最大高度 滚动滚动条到最底部
    foldRef.value.setScrollTop()
}
const selectStyle = (record) => {
    state.activeKey = record.id
    if (modelData.basis.length > 0 && modelData.basis[0].leftCode && modelData.basis[0].rightCode) {
        parseData(modelData)
    }
}
const selectRightTable = () => {
    useModalStore.changeMergeModalVisible()
}

// svg图标类名
const tableSvgClass = (item, type) => {
    return [
        (item.iconName ?? 'selfConfig') + 'Icon', 
        type === 'left' ? 
            leftErrorCols.value.length ? 'errorStatus' : '' :
            rightErrorCols.value.length ? 'errorStatus' : ''
    ]
}

const leftMergetTableIcon = computed(() => {
    return leftMergeTable.value?.iconName ?? 'selfConfig'
})


// 基础表 左表异常字段列名
const leftErrorCols = computed(() => {
    if(!leftData.value.codeList) return []
    return leftData.value.codeList.filter(code => code.errorColumn)
        .map(it => it.columnName)
})

// 关联表 右表异常字段列名
const rightErrorCols = computed(() => {
    if(!rightErrorCodeList.value || !rightTableId.value || !rightErrorCodeList.value[rightTableId.value])
        return []
    return rightErrorCodeList.value[rightTableId.value].map(code => code.columnName)
})

// 当前多表合并步骤是否展示
const currentMergeShow = computed(() => 
    mergeWrapRef.value?.style.display !== 'none'
)

// 基础表 下拉列表是否含有当前选中值
const includeCurVal = (value) => {
    if(!leftData.value.codeList?.length) return true
    return !value || leftData.value.codeList?.some(item => item.columnName === value)
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
.merge {
    .gridBox {
        display: flex;
        min-height: 32px;
        margin-bottom: 16px;
        align-items: center;

        .col1 {
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            height: 100%;
            display: flex;
            align-items: center;
            margin-right: 20px;
        }

        .col32 {
            display: block !important;
        }

        .col2 {
            height: 100%;
            display: flex;
            align-items: center;
            flex-wrap: wrap;

            .leftTable {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0px 12px;
                gap: 8px;
                width: 200px;
                height: 32px;
                background: #F5F5F5;
                border-radius: 4px;
                color: rgba(0, 0, 0, 0.4);
                svg{
                    position: static;
                }

                img {
                    width: 20px;
                }

                .text {
                    width: 145px;
                    display: inline-block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .rightTable {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0px 12px;
                gap: 8px;
                width: 200px;
                height: 32px;
                background: #F3F3F3;
                position: relative;
                color: rgba(0, 0, 0, 0.8);
                cursor: pointer;
                .text-box {
                    height: 32px;
                    display: flex;
                    align-items: center;
                    svg{
                        position: static;
                        margin-right: 4px;
                    }
                }
                .right {
                    width: 16px;
                    position: absolute;
                    right: 1px;
                }
                .text {
                    width: 145px;
                    display: inline-block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                img {
                    width: 20px;
                    margin-right: 8px;
                }
            }

            .errorTable{
                background-color: #FF4E4E14;
                .text{
                    color: #F53F3F;
                }
            }
            .center_box {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding: 0px;
                gap: 4px;
                width: 96px;
                height: 32px;
                color: rgba(0, 0, 0, 0.8);
                background: #F3F3F3;
                border-radius: 4px;
                margin-right: 10px;
                line-height: 1;
                cursor: pointer;

                img {
                    width: 20px;
                }

                &.active{
                    background-color: #E8F2FF;
                    color: #2B67FF;
                    border: 1px solid #2B67FF;
                }
            }

            .ant-form-item {
                margin-bottom: 0px !important;
            }

            .mr12 {
                margin-right: 12px;
            }

            .mr50 {
                margin-right: 50px;
            }

            .ant-select-arrow {
                right: 18px;
                top: 50%;
                width: 9px;
                height: 5px;
                background-size: contain;
                background-image: url(../../../../../../assets/icons/arrows-down.png);
            }

            .ant-select-arrow>* {
                display: none !important;
            }

            .col23 {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                margin-bottom: 10px;
            }

            .plus {
                display: inline-flex;
                flex-direction: row;
                align-items: center;
                padding: 0px;
                gap: 4px;
                height: 32px;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;

                img {
                    width: 14px;
                }
            }
        }

        .del {
            width: 16px;
            margin-left: 12px;
            cursor: pointer;
        }
    }
}
</style>