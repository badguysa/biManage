<template>
    <div class="dbStyle">
        <a-spin :spinning="state.importLoading">
            <div class="formHead">
                <div class="back">
                    <div class="backbox" @click="goBack"><img src="@/assets/icons/return.png" alt="">{{ t('common.back') }}</div>
                </div>
                <div class="headBox">
                    <div class="add">
                        <div class="text">{{ t(sqlTitle) }}</div>
                        <div class="iptGroup">
                            <div>
                                <span class="textColor text1">{{ t('common.tableName') }}</span>
                                <input v-if="addDataMode === 'add'" v-model="state.name" class="ipt1" type="text" :placeholder="t('common.enterTableName')">
                                <input v-else :value="indexTableDesc.tableAlias" class="ipt1" type="text" disabled />
                            </div>
                            <div>
                                <span class="textColor text2">{{ t('common.desc') }}</span>
                                <input v-if="addDataMode === 'add'" v-model="state.desc" class="ipt2" type="text" :placeholder="t('common.tableDesc')">
                                <input v-else :value="indexTableDesc.description" class="ipt2" type="text" disabled />
                            </div>
                        </div>
                    </div>
                    <div class="leftConfig">
                        <div>
                            <myButton type="primary" @click="importFile">{{ t('common.import') }}</myButton>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sqlBody">
                <div class="left-area">
                    <div class="sql-area">
                        <div class="sql-head">
                            <div>
                                <span class="text">{{ t('sql.sqlText') }}</span>
                                <span class="text-tip">{{ t('sql.sqlTextTip') }}</span>
                            </div>
                            <myButton @click="preview" class="btn" :disabled="preBtnDisable">{{ t('sql.preview') }}</myButton>
                        </div>
                        <div class="input-area">
                            <div class="text-area" id="codeEditBox"></div>
                            <div class="bottom-area">
                                <div class="tip-text">{{ t('sql.sqlTip') }}</div>
                                <myButton @click="showUpload" class="btn">{{ t('sql.importSqlFile') }}</myButton>
                            </div>
                            <input type="file" style="display: none;" ref="uploadIpt" @change="onUpload" />
                        </div>
                    </div>
                </div>
                <div class="data-preview" v-if="state.code == 1">
                    <div class="text">{{ t('sql.dataPreview') }}</div>
                    <div class="blank" v-if="!state.tableColumns.length">
                        <a-spin :spinning="state.loading">
                            <div class="box">
                                <img src="@/assets/images/img_null.png" alt="">
                                <div class="text">{{ t('sql.clickLeft') }}<span @click="preview" class="blue-text">{{ t('sql.preview') }}</span>{{ t('sql.checkData') }}</div>
                            </div>
                        </a-spin>
                    </div>
                    <div class="tables" v-else>
                        <a-spin :spinning="state.loading">
                            <sqlTable :tableColumns="state.tableColumns" :tableData="state.tableData" height="100%" />
                        </a-spin>
                    </div>
                </div>
                <div class="data-preview" v-if="state.code == 0">
                    <div class="err-text">
                        {{ state.errorMsg }}
                    </div>
                </div>
            </div>
        </a-spin>
    </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, toRaw, watch } from 'vue'
import { getSqlPreviewData, sqlDataImport } from '@/apis/sql'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import * as monaco from 'monaco-editor'
import { getimgType, simpleEncrypt } from '@/utils/utils'
import sqlTable from '@/components/table'
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql.js'
import myButton from '@/components/buttons/myButton.vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const useMainStore = mainStore()
const { activeTabKey, addDataMode, indexTableDesc, indexTableColumns } = storeToRefs(useMainStore)
const uploadIpt = ref()
const state = reactive({
    name: '',
    desc: '',
    sqlText: '',
    dbs: [],
    tableColumns: [],
    tableData: [],
    loading: false,
    importLoading: false,
    code: 1,
    errorMsg: ''
})
const sqlTitle = computed(() => {
    if (addDataMode.value === 'sqlCoverData') {
        return 'indexPage.replaceData'
    } else if (addDataMode.value === 'sqlAddData') {
        return 'indexPage.addData'
    }
    return 'common.sqlImport'
})
const btnDisabled = computed(() => {
    if (state.sqlText.trim() && addDataMode.value === 'import') return false
    if (state.sqlText.trim() && state.name) return false
    return true
})
const preBtnDisable = computed(() => {
    if (state.sqlText.trim()) return false
    return true
})
watch(() => state.sqlText, (val) => {
    if (!val.trim()) {
        state.tableColumns = []
        state.tableData = []
        state.code = 1
    }
})
const editor = ref(null)
onMounted(() => {
    initEditor()
    if (addDataMode.value === 'sqlCoverData' || addDataMode.value === 'sqlAddData') {
        state.tableColumns = indexTableColumns.value
    }
    if (addDataMode.value !== 'add') {
        state.name = indexTableDesc.value.tableAlias
        state.desc = indexTableDesc.value.description || ''
    }
})
const initEditor = () => {
    // 初始化编辑器，确保dom已经渲染
    editor.value = monaco.editor.create(document.getElementById('codeEditBox'), {
        value: '', //编辑器初始显示文字
        language: 'sql',
        theme: 'vs', //官方自带三种主题vs, hc-black, or vs-dark
        selectOnLineNumbers: false,//显示行号
        roundedSelection: false,
        readOnly: false, // 只读
        cursorStyle: 'line', //光标样式
        automaticLayout: true, //自动布局
        // glyphMargin: true, //字形边缘
        useTabStops: false,
        fontSize: 15, //字体大小
        autoIndent: true, //自动布局
        quickSuggestionsDelay: 100, //代码提示延时
        overviewRulerBorder: false,
        minimap: {
            enabled: false, // 不要小地图
        }
    });
    // 监听值的变化
    editor.value.onDidChangeModelContent((val) => {
        state.sqlText = toRaw(editor.value).getValue().trim()
    })
    monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: function () {
            let suggestions = [];
            sqlLanguage.keywords.forEach(item => {
                suggestions.push({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: item
                });
            })
            sqlLanguage.operators.forEach(item => {
                suggestions.push({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Operator,
                    insertText: item
                });
            })
            sqlLanguage.builtinFunctions.forEach(item => {
                suggestions.push({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: item
                });
            })
            sqlLanguage.builtinVariables.forEach(item => {
                suggestions.push({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    insertText: item
                });
            })
            return {
                suggestions: suggestions
            };
        },
    });
}

const preview = () => {
    if (preBtnDisable.value) return message.warn(t('sql.pleaseEnterSql'))
    let url = ''
    const jsonData = {}
    const key = 'chaoxingSJZTKEY'
    const suffix = 'enc_'
    const encryptedSql = `${suffix}${simpleEncrypt(state.sqlText, key)}`
    if (addDataMode.value === 'sqlCoverData' || addDataMode.value === 'sqlAddData') {
        jsonData.realTableId = indexTableDesc.value.id
        jsonData.insertStr = encryptedSql
        url = '/biapi/sqlImport/previewAppend'
    } else {
        jsonData.sqlStr = encryptedSql
        url = '/biapi/sqlImport/previewInsertResult'
    }
    state.loading = true
    getSqlPreviewData({
        data: jsonData,
        url
    }).then(res => {
        if (res.code == 1) {
            state.code = 1
            res.data = JSON.parse(res.message)
            if (res.data.columns.length > 0) {
                res.data.columns.forEach((item, i) => {
                    item.dataIndex = 'value' + i
                    item.imgType = getimgType(item.colDataType.dataType)
                    item.columnAlias = item.columnName
                })
                state.tableColumns = res.data.columns
                if (res.data.itemsList.length > 0) {
                    state.tableData = res.data.itemsList.map(item => {
                        let obj = {}
                        if (item.expressions.length > 0) {
                            item.expressions.forEach((citem, i) => {
                                obj = { ...obj, ['value' + i]: citem.value }
                            })
                        }
                        return obj
                    })
                }
            }
        } else {
            state.code = 0
            state.errorMsg = res.message
        }
        state.loading = false
    })
}

const importFile = () => {
    if (!state.name) {
        return message.warn(t('common.pleaseEnterName'))
    }
    if (!state.sqlText.trim()) {
        return message.warn(t('sql.enterSqlText'))
    }
    let url = ''
    const jsonData = {
        comment: state.name,
        desc: state.desc,
        groupId: activeTabKey.value,
    }

    // sql导入数据至空表 需传递空表id 
    if(addDataMode.value === 'import') {
        jsonData.comment = indexTableDesc.value.tableAlias
        jsonData.desc = indexTableDesc.value.description
        jsonData.groupId = indexTableDesc.value.groupId
        jsonData.emptyTableId = indexTableDesc.value.id
    }

    // 如果是追加替换时
    const key = 'chaoxingSJZTKEY'
    const suffix = 'enc_'
    const encryptedSql = `${suffix}${simpleEncrypt(state.sqlText, key)}`
    if (addDataMode.value === 'sqlCoverData' || addDataMode.value === 'sqlAddData') {
        jsonData.realTableId = indexTableDesc.value.id
        jsonData.insertStr = encryptedSql
        jsonData.isCover = addDataMode.value === 'sqlCoverData' ? 1 : 0
        url = '/biapi/sqlImport/appendOrCoverData'
    } else { // 正常的导入sql
        jsonData.sqlStr = encryptedSql,
        url = '/biapi/sqlImport/addInsert'
    }

    state.importLoading = true
    sqlDataImport({
        data: jsonData,
        url
    }).then(res => {
        if (res.code == 1) {
            message.success(res.message)
            useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
            useMainStore.setPageId('pageTable')
            useMainStore.selectTabs({
                id: activeTabKey.value
            }, 'import')
        } else {
            message.error(res.message)
        }
        state.importLoading = false
    })
}
const showUpload = () => {
    uploadIpt.value.click()
}
const onUpload = () => {
    let file = uploadIpt.value.files[0]
    if(!file) return
    if(file?.size > 1024 * 1024 * 100) {
        return message.warn('SQL文件最大不超过100M')
    }
    const arr = file.name.split('.')
    if (arr[arr.length - 1] == 'txt' || arr[arr.length - 1] == 'sql') {
        const reader = new FileReader()
        reader.readAsText(file, 'utf8')
        reader.onload = function (evt) {
            toRaw(editor.value).setValue(evt.target.result)
        }
    } else {
        message.warn(t('sql.importTip'))
    }
}
const goBack = () => {
    useMainStore.setPageId('pageTable')
}
</script>

<style lang="less" scoped>
.dbStyle {
    font-family: 'PingFang SC';
    font-style: normal;
    height: 100%;

    :deep(.decorationsOverviewRuler) {
        display: none;
    }

    .formHead {
        width: 100%;
        height: 141px;
        background-color: #fff;
        margin-bottom: 12px;

        .back {
            height: 36px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
            .backbox {
                width: 60px;
                height: 20px;
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 14px;
                color: #3D82F2;
                cursor: pointer;
                span{
                    display: flex;
                    align-items: center;
                }
    
                img {
                    width: 16px;
                    margin-right: 4px;
                }
            }
        }

        .headBox {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .add {
                height: 105px;
                padding: 16px;

                .text {
                    height: 25px;
                    font-weight: 600;
                    font-size: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    margin-bottom: 16px;
                }

                .iptGroup {
                    display: flex;

                    .textColor {
                        font-weight: 400;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                    }

                    .text1 {
                        margin-right: 26px;
                    }

                    .text2 {
                        margin: 0px 14px 0px 30px;
                    }

                    .ipt1 {
                        width: 15.7vw;
                    }

                    .ipt2 {
                        width: 26.1vw;
                    }
                }
            }

            .leftConfig {
                margin-top: 16px;
                margin-right: 16px;

                .update {
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-top: 16px;

                    .text3 {
                        margin-left: 4px;
                    }
                }
            }
        }
    }

    .sqlBody {
        height: calc(100vh - 280px);
        width: 100%;
        display: flex;

        .left-area {
            width: 600px;
            height: 100%;
            padding: 12px;
            border-radius: 4px;
            background-color: #fff;
            margin-right: 12px;

            .sql-area {
                width: 576px;
                height: 100%;
                border: 1px solid rgba(0, 0, 0, 0.07);
                border-radius: 4px;

                .sql-head {
                    padding: 12px 16px;
                    height: 52px;
                    background: #FAFAFC;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .btn {
                        height: 28px;
                        line-height: 28px;
                    }

                    .text {
                        color: rgba(0, 0, 0, 0.8);
                        font-weight: 500;
                        font-size: 15px;
                    }
                    .text-tip{
                        margin-left: 10px;
                        font-size: 11px;
                        color: rgba(0, 0, 0, 0.6);
                    }
                }

                .input-area {
                    width: 576px;
                    height: calc(100% - 70px);
                    padding: 16px;
                    padding-left: 0px;
                    position: relative;

                    .text-area {
                        height: calc(100% - 40px);
                    }

                    .text-area:hover {
                        background-color: #fff !important;
                    }

                    .bottom-area {
                        width: 544px;
                        position: absolute;
                        bottom: 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-left: 16px;

                        .tip-text {
                            font-weight: 400;
                            font-size: 12px;
                            color: rgba(0, 0, 0, 0.6);
                        }

                        .btn {
                            height: 28px;
                            line-height: 28px;
                        }
                    }
                }
            }
        }

        .data-preview {
            width: calc(100% - 612px);
            height: 100%;
            background-color: #fff;
            padding: 12px;
            .err-text {
                color: red;
                width: 100%;
                height: 100%;
                font-size: 14px;
                word-wrap: break-word;
                overflow: scroll;
            }
            .text {
                font-weight: 500;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
            }

            .tables {
                height: calc(100% - 20px);
                width: 100%;
                overflow: scroll;
            }

            .blank {
                height: 100%;
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

                    .blue-text {
                        color: #3D82F2;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
</style>