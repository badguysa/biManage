<template>
    <div class="wrapper">
        <back @backFn="backFn"/>
        <div class="main-wrapper">
            <div class="title-wrapper">
                <div class="title">{{ t('indexPage.dataDictionary') }}</div>
                <myButton class="download-btn" style="margin-left: 24px;" @click="exportData">{{ t('common.download') }}</myButton>
            </div>
            <div class="tableWrapper">
                <a-spin :spinning="loading">
                    <table class="tableContainer" v-if="dataDictionaryList.length">
                        <tr>
                            <th>{{ t('common.tableName') }}</th>
                            <th>{{ t('common.pyhFieldName') }}
                                <a-tooltip>
                                    <template #title>
                                        {{ t('indexPage.codeNameTips') }}
                                    </template>
                                    <img style="width: 12px; margin-top: -4px;" src="@/assets/icons/tips-small-icon.png" alt="">
                                </a-tooltip>
                            </th>
                            <th>{{ t('indexPage.fieldAlias') }} </th>
                            <th>{{ t('indexPage.fieldDescription') }} </th>
                            <th>{{ t('indexPage.fieldType') }}</th>
                            <th>{{ t('indexPage.fieldLength') }}</th>
                            <th>{{ t('indexPage.decimalPrecision') }}</th>
                            <th>{{ t('indexPage.isPrimaryKey') }}</th>
                        </tr>
                        <tr v-for="(item, index) in dataDictionaryList">
                            <td>{{ indexTableDesc.tableName }}</td>
                            <td>{{ item.columnName }}</td>
                            <td>{{ item.columnAlias }}</td>
                            <td>
                                <div v-if="currentId == item.id" class="input_desc">
                                    <input type="text" v-model.trim="currentDesc" class="input" maxlength="100">
                                    <img src="@/assets/icons/sureEdit.png" alt="" @click="updateDesc">
                                    <img src="@/assets/icons/cancelEdit.png" alt="" @click="cancelEdit">
                                </div>
                                <div v-else class="edit_desc">
                                    <a-tooltip>
                                        <template v-if="item.columnDesc" #title>{{ item.columnDesc }}</template>
                                        <div class="desc_text">{{ item.columnDesc || '' }}</div>
                                    </a-tooltip>
                                    <img src="@/assets/icons/edit1.png" alt="" @click="editDesc(item)">
                                </div>
    
                            </td>
                            <td>{{ item.columnType }}</td>
                            <td>{{ item.columnLength }}</td>
                            <td>{{ item.columnPrecision }}</td>
                            <td>
                                {{ item.isPrimaryKey ? t('indexPage.yes') : t('indexPage.no') }}
                            </td>
                        </tr>
    
                    </table>
                    <div class='noData' v-else>
                        <div class='box'>
                            <img src="@/assets/images/img_null.png" alt="" />
                            <div class='text'>{{ t('common.noData') }}</div>
                        </div>
                    </div>
                </a-spin>
            </div>
            <v-md-preview :text="markDownCode" id="export-node" style="opacity: 0; width: fit-content;"></v-md-preview>
        </div>
    </div>
</template>

<script setup>
import { mainStore } from '@/Stores/mainStore'
import { getCodeList, updateColumnsDesc, getDictionaryDoc } from '@/apis/config'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import myButton from '@/components/buttons/myButton.vue'
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import back from '@/components/back'
import useBackHome from '@/hooks/dataCenter/useBackHome'

const { t } = useI18n()
const useMainStore = mainStore()
const loading = ref(true)
const currentId = ref('')
const currentDesc = ref('')
const markDownCode = ref('')

// 记录列表
let dataDictionaryList = ref([])

onMounted(() => {
    requestDictionaryData()
})

const indexTableDesc = computed(() => {
    return useMainStore.currentTab.indexTableDesc
})

const backFn = useBackHome()

const editDesc = (item) => {
    currentDesc.value = item.columnDesc || ''
    currentId.value = item.id
}

// 导出pdf
const exportData = () => {
    getDictionaryDoc({
        id: indexTableDesc.value.id
    }).then(res => {
        if (res.code == 0) {
            message.error(res.message)
        } else {
            markDownCode.value = res
            nextTick(() => {
                exportPDF(indexTableDesc.value.tableAlias + '_数据字典')
            })
        }
    })
}

const updateDesc = () => {
    let row = dataDictionaryList.value.find(i => i.id == currentId.value)
    if (currentDesc.value.trim() == row?.columnDesc) return
    let params = { ...row, columnDesc: currentDesc.value.trim() }
    updateColumnsDesc(params).then(res => {
        if (res.code === 1) {
            row.columnDesc = currentDesc.value.trim()
            row.version = res.data.version
            cancelEdit()
            message.success(res.message)
        } else {
            message.warn(res.message)
        }
    })
}

// 生成pdf并导出
const exportPDF = (name) => {
    const htmlString = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
    </head>
    <body>
      ${document.querySelector(".github-markdown-body").outerHTML}
    </body>
    </html>`
    asBlob(htmlString).then((data) => {
        saveAs(data, `${name}.docx`);
    });
}

const cancelEdit = () => {
    currentId.value = ''
    currentDesc.value = ''
}

const requestDictionaryData = () => {
    loading.value = true
    getCodeList({
        tableId: indexTableDesc.value?.id
    }).then((res) => {
        if (res.code === 1) {
            dataDictionaryList.value = res.data
        }
        loading.value = false
    })
}

// 监听tab页id变化
watch(
    () => indexTableDesc.value?.id,
    () => {
        requestDictionaryData()
    }
)

</script>

<style lang="less" scoped>
.wrapper {
    background-color: #fff;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    .main-wrapper{
        flex-grow: 1;
        padding: 20px 30px;
        height: calc(100% - 36px);
    }

    .title-wrapper{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }
    .title {
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        color: rgba(0, 0, 0, 0.8);
    }

    .download-btn {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 2px;
        height: 32px;
    }

    .tableWrapper {
        position: relative;
        overflow-y: auto;
        height: calc(100% - 43px);

        .tableContainer {
            width: 100%;

            th,
            td {
                border: 1px solid #e0ebff;
                padding: 10px 16px;
                width: 268px;
                white-space: nowrap;
            }

            th {
                color: rgba(0, 0, 0, 0.6);
                font-size: 14px;
                text-align: left;
            }

            td {
                color: rgba(0, 0, 0, 0.8);
                font-size: 13px;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }

            tr {
                &:nth-of-type(odd) {
                    background-color: #f7faff;
                }

                &:first-of-type {
                    background-color: #ecf3ff;
                }
            }

            .input_desc {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .input {
                    width: 100%;
                    margin-right: 10px
                }

                img {
                    cursor: pointer;
                    width: 26px;
                    height: 26px;
                }
            }

            .edit_desc {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .desc_text {
                    width: calc(100% - 20px);
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 3;
                    overflow: hidden;
                    white-space: normal;
                }

                img {
                    cursor: pointer;
                    width: 14px;
                    height: 14px;
                }
            }
        }

        .page {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .noData {
            height: 55vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;

            .box {
                text-align: center;
            }

            img {
                width: 180px;
                height: 130px;

            }

            .text {
                font-family: 'PingFang SC';
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                color: rgba(0, 0, 0, 0.4);
            }
        }
    }
}
</style>
