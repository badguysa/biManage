<template>
    <div class="switch-container">
        <div class="oper-header">
            <div class="row-code">
                <div class="text">行依据字段</div>
                <div>
                    <a-select 
                        notFoundContent="暂无该数据" 
                        v-model:value="formState.rowCode" 
                        placeholder="请选择字段"
                        style="width: 240px; margin-left: 18px"
                        @select="onSelect(1)"
                    >
                        <a-select-option v-for="item in codeList" :value="item.columnName">
                            <span role="img">
                                <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                            </span>
                            {{ item.columnAlias || item.columnName }}
                        </a-select-option>
                    </a-select>
                </div>
                <div class="text" style="margin-left: 32px">列依据字段</div>
                <div>
                    <a-select 
                        notFoundContent="暂无该数据" 
                        v-model:value="formState.colCode" 
                        placeholder="请选择字段"
                        style="width: 240px; margin-left: 18px"
                        @select="onSelect(1)"
                    >
                        <a-select-option v-for="item in codeList" :value="item.columnName">
                            <span role="img">
                                <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                            </span>
                            {{ item.columnAlias || item.columnName }}
                        </a-select-option>
                    </a-select>
                </div>
            </div>
            <div class="grid-box">
                <div class="text">指标字段</div>
                <div class="second-box">
                    <!-- <template v-for="item in formState.accordList" :key="item.id"> -->
                        <div class="select-item">
                            <a-select 
                                notFoundContent="暂无该数据" 
                                v-model:value="formState.accordCode" 
                                placeholder="请选择字段"
                                style="width: 240px; margin-left: 18px"
                                @select="onSelect(2)"
                            >
                                <a-select-option v-for="item in codeList" :value="item.columnName">
                                    <span role="img">
                                        <img style="width: 16px" :src="getIconSrc(item)" alt="" />
                                    </span>
                                    {{ item.columnAlias || item.columnName }}
                                </a-select-option>
                            </a-select>
                            <!-- <img 
                                class="del" 
                                @click="removeItem(item)" 
                                v-if="formState.accordList.length > 1"
                                src="@/assets/icons/delete.png" 
                                alt="删除图标"
                            /> -->
                        </div>
                    <!-- </template> -->
                    <!-- <div class="plus" @click="onPlus">
                        <img src="@/assets/icons/plus.png" alt="">
                        添加指标
                    </div> -->
                </div>
            </div>
        </div>
        <a-spin :spinning="tableLoading">
            <div class="table-con" v-if="showType === 'rowSwitch'">
                <p>仅预览计算结果的前100条数据</p>
                <div class="tables">
                    <myTable :tableColumns="previewColumns" :tableData="previewData" width="calc(100vw - 470px)" />
                </div>
            </div>
        </a-spin>
    </div>
</template>

<script setup>
import { computed, reactive, toRefs }  from 'vue'
import { storeToRefs } from 'pinia'
import { configStore } from '@/Stores/configStore'
import { mainStore } from '@/Stores/mainStore'
import { getIconSrc } from '@/utils/utils'
import myTable from '@/components/table'
import { message } from 'ant-design-vue'
const useConfigStore = configStore()
const useMainStore = mainStore()
const { indexTableColumns, indexTableDesc, activeTabKey } = storeToRefs(useMainStore)
const { configUniqueData } = storeToRefs(useConfigStore)
const configData = computed(() => {
    return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
})
const { previewColumns, previewData, tableLoading, operActiveId, showType } = toRefs(configData.value)
const codeList = computed(() => {
    return indexTableColumns.value.filter(i => i.isSelect)
})
const formState = reactive({
    rowCode: '',
    colCode: '',
    accordCode: ''
})

const onPlus = () => {
    // if (formState.accordList.length)
    formState.accordList.push({
        id: Date.now(),
        accordCode: ''
    })
}
const removeItem = record => {
    formState.accordList = formState.accordList.filter(i => i.id !== record.id)
}
const onSelect = (type) => {
    if (type === 2) {
        if (!formState.colCode || !formState.rowCode) return message.warn('请先选择行列依据字段')
    } else if (type === 1) {
        if (formState.accordCode) {
            if (!formState.colCode || !formState.rowCode) return message.warn('请先选择行列依据字段')
        } else {
            return
        }
    }
    const params = {
        uuid: operActiveId.value,
        action: 'transfer',
        contents: {
            tableId: indexTableDesc.value.id,//表ID
            colName: formState.colCode, // 列名称
            rowName: formState.rowCode,// 行名称
            valueName: formState.accordCode// 指标名称
        }
    }
    useConfigStore.setSelfConfig(params, 'transfer', activeTabKey.value)
}
</script>

<style lang="less" scoped>
.switch-container {
    height: calc(100vh - 310px);
    width: calc(100vw - 450px);
    font-family: 'PingFang SC';
    font-style: normal;
    .oper-header {
        height: 110px;
        overflow-y: scroll;
        background-color: #fff;
        padding: 12px 16px;
        margin-bottom: 12px;
        .row-code {
            display: flex;
            align-items: center;
            .text {
                color: rgba(0, 0, 0, 0.8);
                font-weight: 400;
                font-size: 14px;
                width: 70px;
            }
        }
        .grid-box {
            display: grid;
            grid-template-columns: 70px auto;
            margin-top: 10px;
            .text {
                color: rgba(0, 0, 0, 0.8);
                font-weight: 400;
                font-size: 14px;
                width: 70px;
            }
            .plus {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 102px;
                height: 32px;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;
                margin-left: 18px;
                img {
                    width: 14px;
                }
            }
            .del {
                width: 16px;
                margin-left: 12px;
                cursor: pointer;
            }
            .second-box {
                display: flex;
                flex-direction: column;
                .select-item {
                    margin-bottom: 10px;
                }
            }
        }
    }
    .table-con {
        width: 100%;
        height: calc(100vh - 430px);
        background-color: #fff;

        p {
            float: right;
            margin-right: 12px;
            margin-top: 12px;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            width: 170px;
        }

        .tables {
            width: 100%;
            height: calc(100vh - 470px);
            padding-left: 12px;
            overflow: scroll;
        }
    }
}
</style>