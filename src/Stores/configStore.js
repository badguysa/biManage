import { defineStore, storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash'
import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid'
import { getimgType, getCodeType, sortByArr2  } from '@/utils/utils'
import { selfConfigError, bloodAnalysisError } from '@/utils/bloodAnalysis'
import { getCodeList, getPreviewData, importFlie, editSelfConfig } from '@/apis/config';
import { getIndexTableDetail } from '@/apis/group'
import { getTargetRelctionCol } from '@/apis/bloodRelation'
import { mainStore } from './mainStore';
import { apiManageStore } from './apiManageStore';
import selectImg from '@/assets/icons/selectcode.png'
import selectedImg from '@/assets/icons/active_one.png'
import { modalStore } from './modalStore';
import { getBloodRelation } from '@/apis/bloodRelation'
import createDialog from '@/utils/dialog'

/**
 * readme
 * 因要支持多tabs下同时进行自助配置，所以里面的数据全部都抽出来单独进行初始化，
 * 因此调用此文件的func时，都要在原基础上携带分组id，也就是activeTabKey
 */
const useMainStore = mainStore()
const useApiManageStore = apiManageStore()
const { activeTabKey, tabsList, indexTableDesc } = storeToRefs(useMainStore)

export const configStore = defineStore('configStore', {
    state: () => ({
        configUniqueData: [],
        desensitizeInfo: null,    // 脱敏信息
    }),
    actions: {
        updateConfigUniqueData (tabId, type, name = '') {
            const initData = {
                uniqueId: tabId,
                tableSource: [],
                selfEditData: {},
                selfFlag: 'add',
                selfConfigPolicy: 'NONE',   // 当前自主配置表更新策略 更改高度使用
                groupName: name,
                selfConfig: [], // 所有自助配置项的大数组
                headerInfo: {
                    tableName: '',
                    desc: ''
                }, // 自助配置头部信息
                operationList: [{
                    id: 'selectCode',
                    uuid: uuidv4(),
                    src: selectImg,
                    activeSrc: selectedImg,
                    iconName: 'select',
                    text: 'selfConfig.selectTableAndCode'
                }], // 操作步骤数组
                allConfigData: [], // 所有的配置信息汇总
                operActiveId: '', // 记录每次操作的具体步骤的uuid
                showType: 'selectCode', // filterData, sortData, addColumns, groupData, codeSetting, mergeData, desensitization
                tableLoading: false, // 表格加载
                rightTableLoading: false,
                codeList: [], // 选择字段列表
                codeBackList: [],
                rightCodeArray: [], // 右表总体字段数组
                rightCodeList: [], // 多表合并选择右表的字段列表
                rightMergeTable: [], // 多表合并选择的右表
                leftMergeTable: {}, // 多表合并选择的左表
                previewData: [], // 预览表格
                previewColumns: [], // 预览表的列头
                previewRightData: [], // 多表合并选择的右表预览表格
                previewRightColumns: [], // 多表合并选择的右表预览表的列头
                selectedCodeList: [], // 被选中的字段
                selfImportLoading: false,
                rightCodeLoading: false, // 多表合并弹窗选字段loading
                addColumnsData: [], // 存放添加的数据
                updateInfo: {
                    updatePolicy: 'NONE', // 更新策略 
                    updateParams: {
                        updateRate: 1,
                        updateUnit: 1
                    }, // 更新参数
                },
                errorConfigInfo: {
                    isError: false,
                    colInfo: []
                },
                rightErrorCodeList: {},
                // TODO: 使用步骤ID存储
                selfconfigErrorSteps: [],  // 字段未选中 异常步骤
                bloodErrorSteps: [], // 字段丢失 异常步骤
                firstChangeConfig: true,
                totalDataCount: 0,
                distinctDataLoaded: false, // 去重数据加载完毕
            }
            if (type === 'push') {
                const ids = this.configUniqueData.map(i => i.uniqueId)
                if (ids.includes(tabId)) return
                this.configUniqueData.push(initData)
            } else if (type === 'delete') {
                this.configUniqueData = this.configUniqueData.filter(i => i.uniqueId !== tabId)
            }
        },
        getEditTableSource (id, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            getIndexTableDetail({ id }).then(res => {
                if (res.code === 1) {
                    if (res.data.tableSource) {
                        editData.tableSource = JSON.parse(res.data.tableSource)['config']
                    }
                }
            })
        },

        changeOperationType (type, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.operationType = type
        },

        setShowType(type, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.showType = type
        },

        setHeaderInfo (headData, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.headerInfo = headData
        },

        setAddColumnsData (data, operId, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const operIds = editData.addColumnsData.map(i => i.uuid)
            if (operIds.includes(operId)) {
                const targetIndex = editData.addColumnsData.findIndex(i => i.uuid === operId)
                editData.addColumnsData[targetIndex] = data
            } else {
                editData.addColumnsData.push(data)
            }
        },

        goBack(tabId) {
            this.updateConfigUniqueData(tabId, 'delete')
            const data = tabsList.value.find(i => i.id === tabId)
            const tab = {
                id: data.id,
                name: data.name
            }
            useMainStore.changeTabsList(tab, 'clear', tabId)
        },

        changeUpdateInfo (info, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.updateInfo.updatePolicy = info.updatePolicy
            editData.updateInfo.updateParams = info.updateParams
        },

        // 导入自助配置文件
        importConfigFlie(type, id, uniqueId, saveAsInfo) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const tableProperties = {
                description: editData.headerInfo.desc,
                groupId: activeTabKey.value,
                tableAlias: editData.headerInfo.tableName,
                updatePolicy: editData.updateInfo.updatePolicy || 'NONE',
                // updateParams: JSON.stringify(editData.updateInfo.updateParams || {})
            }
            if(type === 'import'){
                tableProperties.id = id
            }

            // 另存为
            if(type === 'saveAs') {
                tableProperties.tableAlias = saveAsInfo.tableName
                tableProperties.groupId = saveAsInfo.tableLocation
            }

            let queryConfigInfo = editData.selfConfig[editData.selfConfig.length - 1].config.filter(it => !it.default)

            const data = {
                tableProperties,
                selfConfig: queryConfigInfo
            }

            let updateParams = editData.updateInfo.updateParams || {}
            // 自助配置表全量更新设置定时更新参数
            if(editData.updateInfo.updatePolicy === 'FULL_UPDATE') {
                // tableProperties.updateParams = 
                let regularUpdateInfo = useMainStore.getRegularUpdateInfo()
                updateParams.timeExpression = regularUpdateInfo.cronStr
            }

            tableProperties.updateParams = JSON.stringify(updateParams)

            editData.selfImportLoading = true
            importFlie(data).then(res => {
                if (res.code == 1) {
                    useMainStore.setIndexTableActiveId('', activeTabKey.value, 'del')
                    const tabs = {
                        id: activeTabKey.value
                    }
                    useMainStore.setPageId('pageTable')
                    useMainStore.selectTabs(tabs, 'import')
                    message.success(res.message)
                    this.goBack(uniqueId)
                    useApiManageStore.initRedDot()
                } else {
                    message.error(res.message)
                }
                editData.selfImportLoading = false
            })
        },
        validateFilterSymbol(item)  {
            if(item.nesting?.length) {
                item.nesting = item.nesting.filter(it => {
                    it.symbol && validateFilterSymbol(it)
                    return it.symbol
                })
            }
        },
        // 过滤筛选为空的筛选选项
        // cleanFilterConfig(slefConfigParams) {
        //     slefConfigParams = slefConfigParams.filter(it => {
        //         if(it.action === 'where') return it.contents?.length
        //         return true
        //     })

        //     slefConfigParams.forEach(it => {
        //         if(it.action === 'where') {
        //             it.contents = it.contents.filter(item => {
        //                 item.symbol && this.validateFilterSymbol(item)
        //                 return item.symbol
        //             })
        //         }
        //     })
        // },
        // 编辑自助配置
        async editConfig(uniqueId){
            const indexTableInfo = indexTableDesc.value

            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            
            editData.selfImportLoading = true

            const tableProperties = {
                description: editData.headerInfo.desc,
                groupId: activeTabKey.value,
                exportDst: editData.headerInfo.exportDst,
                tableAlias: editData.headerInfo.tableName,
                updatePolicy: editData.updateInfo.updatePolicy || 'NONE',
                // updateParams: JSON.stringify(editData.updateInfo.updateParams || {})
            }

            let updateParams = editData.updateInfo.updateParams || {}
            // 自助配置表全量更新设置定时更新参数
            if(editData.updateInfo.updatePolicy === 'FULL_UPDATE') {
                // tableProperties.updateParams = 
                let regularUpdateInfo = useMainStore.getRegularUpdateInfo()
                updateParams.timeExpression = regularUpdateInfo.cronStr
            }

            tableProperties.updateParams = JSON.stringify(updateParams)

            // 自助配置发生变化时 传递
            let slefConfigParams = editData.firstChangeConfig ? [] : editData.selfConfig[editData.selfConfig.length - 1].config

            // this.cleanFilterConfig(slefConfigParams)


            slefConfigParams = slefConfigParams.filter(it => {
                if(it.action === 'where') return it.contents?.length
                return true
            })

            slefConfigParams.forEach(it => {
                if(it.action === 'where') {
                    it.contents = it.contents.filter(item => {
                        item.symbol && this.validateFilterSymbol(item)
                        return item.symbol
                    })
                }
            })

            return new Promise((resolve) => {
                editSelfConfig({
                    tableId: indexTableInfo.id,
                    selfConfig: slefConfigParams,
                    tableProperties,
                    columnProperties: this.desensitizeInfo,
                }).then((res) => {
                    if (res.code == 1) {
                        const tabs = {
                            id: activeTabKey.value
                        }
                        useMainStore.selectTabs(tabs)
                    } else {
                        message.error(res.message)
                    }
                    useMainStore.setPageId('pageTable')
                    editData.selfImportLoading = false
                    resolve()
                })
            })
        },

        changeOperationList(arr, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.operationList = arr
        },

        setOperationList(list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            list = { ...list, uuid: list.uuid || uuidv4() }
            editData.operationList.push(list)
            this.setOperActiveId(list.uuid, 1, uniqueId)
            const data = editData.selfConfig[editData.selfConfig.length - 1]
            if (data) {
                const configData =  editData.selfConfig[editData.selfConfig.length - 1].config
                this.getPreviewData(configData, 2, list, uniqueId)
            }
        },
        // 步骤中间插入步骤
        insertOperationList(list, uniqueId, index) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            list = { ...list, uuid: list.uuid || uuidv4() }
            editData.operationList.splice(index+1, 0, list)
            this.setOperActiveId(list.uuid, 1, uniqueId)

            const data = editData.selfConfig[index]
            if (data) {
                const configData =  data.config
                this.getPreviewData(configData, 2, list, uniqueId)
            }
        },

        async editClickOperActiveId (uniqueId) {
            return new Promise(async (resolve) => {
                const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
                if (editData.operationList.length > 1) {
                    let targetIndex = editData.selfConfig.findIndex(item => item.uuid === editData.operActiveId)
                    if (targetIndex > 0) {
                        // 使用Promise.all来并发执行getPreviewData调用
                        const fetchPreviewData = async (config, step, options, uniqueId, showError) => {
                            return this.getPreviewData(config, step, options, uniqueId, showError);
                        };
                        const [res2, res1] = await Promise.all([
                            fetchPreviewData(editData.selfConfig[targetIndex - 1].config, 3, { uuid: editData.selfConfig[targetIndex - 1].uuid}, uniqueId, false),
                            fetchPreviewData(editData.selfConfig[targetIndex].config, 4, { uuid: editData.selfConfig[targetIndex].uuid}, uniqueId, false)
                        ]);
                        if (res2.codeList.length) {
                            const columnNames = res1.codeList.map(i => i.columnName)
                            res2.codeList.forEach(item => {
                                if (columnNames.includes(item.columnName)) {
                                    item.isSelect = true
                                } else {
                                    item.isSelect = false
                                }
                            })

                            // 字段类型与当前步骤字段类型 字段名称保持同步
                            res2.codeList.forEach(preStepItem => {
                                res1.codeList.forEach(curStepItem => {
                                    if(preStepItem.columnName === curStepItem.columnName) {
                                        preStepItem.columnAlias = curStepItem.columnAlias
                                        preStepItem.type = curStepItem.type
                                        preStepItem.imgType = curStepItem.imgType
                                    }
                                })
                            })
                            // 修改res2的排序
                            res2.codeList = sortByArr2(res2.codeList, res1.previewColumns, 'dataIndex')
                        }
                        const obj = {
                            codeList: res2.codeList.length ? res2.codeList : editData.codeList,
                            previewColumns: res1.previewColumns,
                            previewData: res1.previewData,
                            uuid: res1.uuid
                        }
                        obj.codeBackList = obj.codeList
                        // const uuids = editData.allConfigData.map(item => item.uuid)
                        // if (uuids.includes(obj.uuid)) return
                        let index = editData.allConfigData.findIndex(item => item.uuid === obj.uuid)
                        if (index > -1) {
                            editData.allConfigData[index] = obj
                        } else {
                            editData.allConfigData.push(obj)
                        }

                    }
                } else {
                    this.setOperActiveId(editData.operationList[0].uuid, 2, activeTabKey.value)
                }
                resolve()
            })
            
        },
        setOperActiveId(id, type, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.operActiveId = id
            if (type === 1) return

            let targetIndex = editData.selfConfig.findIndex(item => item.uuid === editData.operActiveId)
            if (targetIndex >= 0) {
                let data = cloneDeep(editData.selfConfig[targetIndex].config)
                this.getPreviewData(data, '', '', uniqueId, false)
            } else {
                const data = editData.selfConfig[editData.selfConfig.length - 1]
                if (data) {
                    const configData = cloneDeep(editData.selfConfig[editData.selfConfig.length - 1].config)
                    this.getPreviewData(configData, '', '', uniqueId, false)
                }
            }
        },
        updateCodeList(uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.codeList = this.getErrorCodeList(editData.errorConfigInfo.colInfo)
            editData.codeBackList = editData.codeList
        },
        async updateErrorConfigData(uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            let tableDetail = indexTableDesc.value
            let statusVal = tableDetail.tableStatus.value
            if(statusVal === 4) { // 异常
                let res = await getTargetRelctionCol(tableDetail.id)
                if(res.code === 1) {
                    editData.errorConfigInfo.isError = true
                    editData.errorConfigInfo.colInfo = res.data
                } else {
                    message.error(res.message)
                }
            }
        },
        // 获取异常字段
        getErrorCodeList(colInfo){
            let tempCodeList = []
            for(let i = 0; i < colInfo.length; i++){
                let info = colInfo[i], columnInfo = JSON.parse(info.sourceColumnInfo)
                if(!columnInfo) continue
                if(tempCodeList.some(it => it.id === columnInfo.id)) continue
                tempCodeList.push({
                    ...columnInfo,
                    imgType: getimgType(info.columnType),
                    type: getCodeType(info.columnType),
                    isSelect: true,
                    errorColumn: true   // 异常字段
                })
            }
            return tempCodeList
        },

        // 首页的字段列
        async getCodeList(record, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const params = {
                tableId: record.id
            }
            let res = await getCodeList(params)
            
            if (res.code == 1) {
                // 先处理字段的展示类型
                res.data.length && res.data.forEach(item => {
                    item.imgType = getimgType(item.columnType)
                    item.type = getCodeType(item.columnType)
                })
                let columns = []
                let sourceTableId = editData.tableSource[0]?.contents.tableId
                if(editData.selfFlag === 'edit' && record.id === sourceTableId){
                    if (editData.selfFlag === 'edit') {
                        columns = editData.tableSource[0].contents.columns
                    }
                    res.data.length && res.data.forEach(item => {
                        if (!columns || columns.includes(item.columnName)) {
                            item.isSelect = true
                        } else {
                            item.isSelect = false
                        }
                    })
                }
                // 来源表字段丢失 手动填充丢失字段
                if(editData.selfFlag === 'edit' && editData.errorConfigInfo.isError && record.id === sourceTableId) {
                    let errorCodeList = this.getErrorCodeList(editData.errorConfigInfo.colInfo)
                    let errorCodeLeft = [], rightErrorCodeList = editData.rightErrorCodeList
                    
                    // 遍历异常字段 根据realTableId进行分组
                    errorCodeList.forEach(code => {
                        let realTableId = code.realTableId
                        if(realTableId === sourceTableId) { // 来源表字段异常
                            errorCodeLeft.push(code)
                        } else if(rightErrorCodeList[realTableId]) { // 多表合并 右表字段异常
                            rightErrorCodeList[realTableId].every(item => item.id !== code.id) &&
                            rightErrorCodeList[realTableId].push(code)
                        } else {   // 多表合并 右表字段异常
                            rightErrorCodeList[realTableId] = [code]
                        }
                    })
                    
                    res.data.unshift(...errorCodeLeft)
                }

                editData.selectedCodeList = res.data.filter(item => item.isSelect)
                this.setCodeList(res.data, uniqueId)
                this.updateRightCodeList(uniqueId)
                this.updateBloodErrorSteps(uniqueId)
            }
        },
        // 更新数据血缘异常步骤
        updateBloodErrorSteps(uniqueId){
            
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)

            if(!editData.errorConfigInfo.isError) return

            let errorCodeList = this.getErrorCodeList(editData.errorConfigInfo.colInfo)

            if(!errorCodeList.length) return

            // console.log('errorCodeList', errorCodeList)

            const errorColumns = errorCodeList.map(item => item.columnName) || []

            let configArr = editData.selfConfig[editData.selfConfig.length-1].config
            let targetIndex = 0, configInfo = configArr[targetIndex], flag = false

            while(configInfo) {
                flag = bloodAnalysisError(configInfo, errorColumns)
                if(flag) {
                    let operateIndex = editData.operationList.findIndex(it => it.uuid === configInfo.uuid)
                    editData.bloodErrorSteps = [operateIndex]
                    break
                }
                configInfo = configArr[++targetIndex]
            }

            if(!flag) {
                editData.bloodErrorSteps = []
            }
            // console.log('bloodErrorSteps', editData.bloodErrorSteps)
        },
        // 更新右表字段
        updateRightCodeList(uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.rightCodeArray.forEach(it => {
                let targetRightErrorCodeList = editData.rightErrorCodeList[it.tableId]
                if(targetRightErrorCodeList) {
                    if(it.codeList) {
                        // 多次调用 可能含有重复字段 过滤已有字段
                        let tempCodeList = targetRightErrorCodeList.filter(code => it.codeList.every(c => c.id !== code.id))
                        it.codeList.unshift(...tempCodeList)
                    }
                    else {
                        it.codeList = targetRightErrorCodeList
                    }
                    it.codeBackList = it.codeList
                }
            })
        },

        setCodeList(list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.codeList = list
            editData.codeBackList = editData.codeList
        },

        setSelectedCodeList(list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            list.length && list.forEach(item => {
                item.isRename = false
            })
            editData.selectedCodeList = list
        },

        // 多表合并选择右表的字段列
        // 仅在编辑时type为edit，array有值
        getRightCodeList(record, uniqueId, type, array) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const params = {
                tableId: record.id
            }
            editData.rightCodeLoading = true
            getCodeList(params).then(res => {
                if (res.code == 1) {
                    res.data.length && res.data.forEach(item => {
                        if (type === 'edit') {
                            if (array.includes(item.columnName)) {
                                item.isSelect = true
                            } else {
                                item.isSelect = false
                            }
                        } else {
                            item.isSelect = false
                        }
                        item.imgType = getimgType(item.columnType)
                    })
                    this.setRightCodeList(res.data, uniqueId, record.id)
                } else {
                    message.error(res.message)
                }
                this.updateRightCodeList(uniqueId)
                editData.rightCodeLoading = false
            })
        },

        setRightCodeList(list, uniqueId, tableId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.rightCodeList = list
            const obj = { codeList: list, uuid: editData.operActiveId, tableId }
            obj.codeBackList = obj.codeList
            if (editData.rightCodeArray.length > 0) {
                const index = editData.rightCodeArray.findIndex(item => item.uuid === editData.operActiveId)
                if (index >= 0) {
                    editData.rightCodeArray[index] = { ...editData.rightCodeArray[index], ...obj }
                } else {
                    editData.rightCodeArray.push(obj)
                }
            } else {
                editData.rightCodeArray.push(obj)
            }
        },

        setExpandedKeys (keys, type, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            let obj = {}
            if ( type === 1) {
                obj = { defaultExpandedKeys: keys, uuid: editData.operActiveId }
            } else if( type === 2) {
                obj = { defaultSelectedKeys: keys, uuid: editData.operActiveId }
            }
            if (editData.rightCodeArray.length > 0) {
                const index = editData.rightCodeArray.findIndex(item => item.uuid === editData.operActiveId)
                if (index >= 0) {
                    editData.rightCodeArray[index] = { ...editData.rightCodeArray[index], ...obj }
                } else {
                    editData.rightCodeArray.push(obj)
                }
            } else {
                editData.rightCodeArray.push(obj)
            }
        },

        changeSelfConfig (list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.selfConfig = list
        },

        async setSelfConfig(record, type, uniqueId, insertIndex = -1) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const length = editData.selfConfig.length - 1
            let previewInfo = null
            if (type == 'select') {
                const obj = {
                    uuid: editData.operActiveId,
                    config: [record]
                }
                let targetIndex = editData.selfConfig.findIndex(item => item.uuid === editData.operActiveId)
                if (targetIndex >= 0) {
                    editData.selfConfig[targetIndex].config = [record]
                } else {
                    editData.selfConfig.push(obj)
                }
                previewInfo = await this.getPreviewData(editData.selfConfig[0].config, '', '', uniqueId)
            } else if (type === 'delete') {
                // 删除中间步骤 更新后续步骤
                let deleteIndex = record.deleteIndex

                if(deleteIndex > -1) {
                    for(let i = deleteIndex+1; i <= length; i++) {
                        editData.selfConfig[i].config.splice(deleteIndex, 1)
                    }
                }

                const tempList = editData.selfConfig.filter(item => item.uuid !== record.uuid)
                editData.selfConfig = tempList
            } else {
                const obj = {
                    uuid: editData.operActiveId,
                    config: [...editData.selfConfig[length].config, record]
                }

                // 步骤中间插入步骤 更新后续步骤
                if(insertIndex > -1) {
                    obj.config = [...editData.selfConfig[insertIndex].config, record]
                    for(let i = insertIndex+1; i <= length; i++) {
                        editData.selfConfig[i].config.splice(insertIndex+1, 0, record)
                    }
                }

                let targetIndex = editData.selfConfig.findIndex(item => item.uuid === editData.operActiveId)
                if (targetIndex >= 0) { // selfConfig存在 更新
                    let index = editData.selfConfig[targetIndex].config.findIndex(item => item.uuid === record.uuid)
                    editData.selfConfig[targetIndex].config[index] = record
                    previewInfo = await this.getPreviewData(editData.selfConfig[targetIndex].config, '', '', uniqueId)
                } else {    // selfConfig不存在 新增
                    let configData = null
                    // 指定索引位置插入新步骤
                    if(insertIndex > -1) {
                        editData.selfConfig.splice(insertIndex+1, 0, obj)
                        configData = cloneDeep(editData.selfConfig[insertIndex+1].config)
                    } else {
                        editData.selfConfig.push(obj)
                        configData = cloneDeep(editData.selfConfig[editData.selfConfig.length - 1].config)
                    }
                    
                    previewInfo = await this.getPreviewData(configData, '', '', uniqueId)
                }
            }

            // 插入步骤 不用判断异常步骤
            if(insertIndex === -1) {
                this.updateErrorOperate(uniqueId, record, previewInfo)
                this.updateBloodErrorSteps(uniqueId)
            }
            
            this.updateSelfConfig(activeTabKey.value)

            // 首次编辑自助配置判断
            if(editData.firstChangeConfig && editData.selfFlag === 'edit') {
                editData.firstChangeConfig = false
                // 判断当前自助配置表是否含有目标表
                let relationRes = await getBloodRelation(indexTableDesc.value.id, 0)
                if (relationRes.code === 1) {
                    relationRes.data.targetRelations.length &&
                    createDialog(
                        {
                            title: '提示',
                            content: '当前数据表已有内容，编辑可能导致表结构和数据变化，相关API接口和推送服务会跟随编辑后结构和数据变化。确认继续编辑？',
                            okText: '编辑',
                            cancelText: '取消',
                        }
                    ).catch(()=>{})
                }
            }
            
        },
        // 更新自助配置 后面步骤与前面步骤保持一致
        updateSelfConfig(uniqueId){
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)

            if(editData.selfConfig.length <= 1) return

            for(let i = 1; i < editData.selfConfig.length; i++) {
                let configInfo = editData.selfConfig[i].config
                let preConfingInfo = editData.selfConfig[i - 1].config
                preConfingInfo.forEach((preConfig, i) => {
                    configInfo[i] = preConfig
                })
            }
        },
        // 移除错误步骤
        deleteErrorOperate(record, uniqueId){
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            let index = editData.operationList.findIndex(it => it.uuid === record.uuid)
            if(editData.selfconfigErrorSteps.includes(index)){
                editData.selfconfigErrorSteps = []
            }
        },
        // 更新错误步骤
        async updateErrorOperate(uniqueId, record, previewInfo){
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)

            let configArr = editData.selfConfig[editData.selfConfig.length - 1].config

            let targetIndex = configArr?.findIndex(it => it.uuid === record.uuid)

            if(targetIndex < 0) return

            let flag = false, selectColumns = []
            

            // 判断当前步骤是否为异常步骤
            if(editData.selfconfigErrorSteps.includes(targetIndex)) {

                selectColumns = editData.allConfigData.find(it => it.uuid === record.uuid)?.codeList?.map(it => it.columnName) || []

                flag = selfConfigError(record, selectColumns)
                // 当前步骤恢复正常
                if(!flag) {
                    editData.selfconfigErrorSteps = []
                }
                
            } else {     // 判断后续步骤是否异常
                let nextConfig = configArr[++targetIndex]
                selectColumns = previewInfo?.codeList?.map(it => it.columnName)

                while(nextConfig) {
                    // 上一个配置为多表合并或新增列 更新selectColumns
                    if(['join', 'add'].includes(configArr[targetIndex-1]?.action)) {
                        let uuid = configArr[targetIndex-1].uuid
                        let configData = editData.selfConfig.find(it => it.uuid === uuid)?.config
                        previewInfo = await this.getPreviewData(configData, 3, '', uniqueId)
                        selectColumns = previewInfo?.codeList?.map(it => it.columnName)
                    }

                    flag = selfConfigError(nextConfig, selectColumns)

                    if(flag) {  // 下一步异常
                        // 通过操作步骤id 获取异常步骤索引
                        let operateIndex = editData.operationList.findIndex(it => it.uuid === nextConfig.uuid)
                        editData.selfconfigErrorSteps = [operateIndex]
                        break
                    } else {    // 下一步正常
                        editData.selfconfigErrorSteps = []
                    }

                    nextConfig = configArr[++targetIndex]
                }
            }
        },

        // 更新codeList 切换步骤时 当前codeList取上一步结果 TODO: 不依赖 default:true selfConfig
        async updateAllConfigData(id, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            
            let targetIndex = editData.selfConfig.findIndex(item => item.uuid === id)

            if(targetIndex < 1) return
            
            // 目标步骤是否为字段设置
            let isCodeSet = editData.operationList.find(i => i.uuid === id)?.id === 'codeSetting'

            let res = await this.getPreviewData(editData.selfConfig[targetIndex - 1].config, 3, { uuid: editData.selfConfig[targetIndex - 1].uuid}, uniqueId, false)

            let obj = {
                codeList: cloneDeep(res.previewColumns),
                previewColumns: res.previewColumns,
                previewData: res.previewData,
                uuid: id,
                codeBackList: []
            }

            obj.codeBackList = obj.codeList

            obj.uuid = id

            let index = editData.allConfigData.findIndex(item => item.uuid === obj.uuid)

            if (index < 0) return

            // 字段设置字段单独处理
            if(isCodeSet) {
                this.handleCodeSetColumns(editData.allConfigData[index].codeList, obj)
            }
            
            editData.allConfigData[index] = obj
            
        },
        // 处理字段设置步骤 选择的字段
        handleCodeSetColumns(oldCodeSetColumns, newCodeSetColumns){
            let oldColumns = cloneDeep(oldCodeSetColumns)
            let newColumns = newCodeSetColumns.codeList

            // 字段个数增加 默认全选
            if(newColumns.length > oldColumns.length) {
                newColumns.forEach(it => {
                    let target = oldColumns.find(item => item.id === it.id)
                    if(!target) {
                        it.isSelect = true
                        oldColumns.push(it)
                    }
                })
            } else {
                for(let i = 0; i < oldColumns.length; i++) {
                    if(!newColumns.some(item => item.id === oldColumns[i].id)) {
                        oldColumns.splice(i, 1)
                        i -= 1
                    }
                }
            }
            
            newCodeSetColumns.codeList = oldColumns
            newCodeSetColumns.codeBackList = oldColumns
        },

        deleteAllConfigData(record, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.allConfigData = editData.allConfigData.filter(item => item.uuid !== record.uuid)
        },

        /**
         * 获取预览表， type, list 仅新增情况有，uniqueId分组id
         * @param {*} record 
         * @param {*} type 
         * @param {*} list 
         * @param {*} uniqueId 
         */
        getPreviewData(record, type, list = [], uniqueId, showError = true) {  
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            if (type !== 3) {
                editData.tableLoading = true
            }

            record = record.filter(it => !it.default)

            return getPreviewData(record).then(res => {
                let previewColumns = []
                let previewData = []
                if (res.code == 1) {
                    if (type !== 3) {
                        editData.previewColumns = []
                        editData.previewData = []
                    }
                    const columns = res.data.targetTableColumns
                    const sortArr = res.data.columnNames
                    for (let val in sortArr) {
                        for (let key in columns) {
                            if (sortArr[val] == columns[key].columnName) {
                                columns[key].dataIndex = key
                                columns[key].imgType = getimgType(columns[key].columnType)
                                columns[key].type = getCodeType(columns[key].columnType)
                                previewColumns.push(columns[key])
                            }
                        }
                    }
                    previewData = res.data.queryResult || []
                    if (type !== 3) {
                        editData.totalDataCount = res.extendData?.totalDataCount || 0
                        editData.previewColumns = previewColumns
                        editData.previewData = previewData
                    }
                    editData.tableLoading = false
                } else {
                    if (type !== 3) {
                        editData.previewColumns = []
                        editData.previewData = []
                    }
                    editData.totalDataCount = 0
                    editData.tableLoading = false
                    // showError && message.error(res.message)
                }
                // 2新增 3编辑点击 操作步骤
                if (type === 2 || type === 3 || type === 4 || type === '') {
                    if (type === 2) {
                        editData.previewColumns.length && editData.previewColumns.forEach(item => {
                            item.isSelect = true
                        })
                    }
                    const obj = {
                        uuid: list.uuid,
                        codeList: cloneDeep(previewColumns),
                        previewColumns: previewColumns,
                        previewColumns: previewColumns,
                        previewData: previewData,
                        totalDataCount: editData.totalDataCount
                    }
                    obj.codeBackList = obj.codeList
                    if (type === 2) {
                        const uuids = editData.allConfigData.map(item => item.uuid)
                        if (uuids.includes(obj.uuid)) return
                        editData.allConfigData.push(obj)
                        this.updateDistinctLoaded(editData, uniqueId, list.uuid)
                    } else if (type === 3 || type === 4 || type === '') {
                        return new Promise(res => {
                            res(obj)
                        })
                    }
                }
            })
        },
        // 新增去重步骤时 更新去重数据加载状态
        updateDistinctLoaded(editData, uniqueId, uuid) {
            let targetOperate = editData.operationList.find(it => it.uuid === uuid)
            if(targetOperate?.action === 'distinct' && editData.operActiveId === uuid){
                this.setDistinctConfigDataLoaded(true, uniqueId)
            }
        },

        setPreviewData(list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.previewData = list
        },

        setPreviewColumns(list, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.previewColumns = list
        },

        // 获取多表合并右侧预览表
        getRightPreviewData(selfConfig, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.rightTableLoading = true
            getPreviewData([selfConfig]).then(res => {
                const index = editData.rightCodeArray.findIndex(item => item.uuid === editData.operActiveId)
                if (res.code == 1) {
                    editData.previewRightColumns = []
                    editData.previewRightData = []
                    const columns = res.data.targetTableColumns
                    for (let key in columns) {
                        columns[key].dataIndex = key
                        columns[key].imgType = getimgType(columns[key].columnType)
                        editData.previewRightColumns.push(columns[key])
                    }
                    editData.previewRightData = res.data.queryResult || []
                    if (index >= 0) {
                        editData.rightCodeArray[index].tableColumns = editData.previewRightColumns
                        editData.rightCodeArray[index].tableData = editData.previewRightData
                    }
                    editData.rightTableLoading = false
                } else {
                    if (index >= 0) {
                        editData.rightCodeArray[index].tableColumns = []
                        editData.rightCodeArray[index].tableData = []
                    }
                    message.error(res.message)
                    editData.rightTableLoading = false
                }
            })
        },

        // 多表合并的左表
        setLeftMergeTable(table, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.leftMergeTable = table
        },

        // 多表合并的右表
        setRightMergeTable(table, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            const obj = {...table, uuid: editData.operActiveId}
            if (editData.rightMergeTable.length > 0) {
                const index = editData.rightMergeTable.findIndex(item => item.uuid === editData.operActiveId)
                if (index >= 0) {
                    editData.rightMergeTable[index] = obj
                } else {
                    editData.rightMergeTable.push(obj)
                }
            } else {
                editData.rightMergeTable.push(obj)
            }
        },
        /**
         * 自助配置生成的操作
         * @param {*} source 
         * @param {*} type init初始化， change各个步骤更改是同时改tableSource
         */
         setTableSource (source, type = 'init', uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            if (!editData) return
            if (type === 'init') {
                if (source) {
                    editData.tableSource = JSON.parse(source)
                } else {
                    editData.tableSource = []
                }
            }
            if (type === 'equal') {
                editData.tableSource = source
            }
            if (type === 'change') {
                const uuids = editData.tableSource.map(item => item.uuid)
                if (uuids.includes(source.uuid)) {
                    const findIndex = editData.tableSource.findIndex(item => item.uuid === source.uuid)
                    editData.tableSource[findIndex] = source
                } else {
                    editData.tableSource.push(source)
                }
            }
            if (type === 'delete') {
                editData.tableSource = editData.tableSource.filter(item => item.uuid !== source.uuid)
            }
        },

        // 自助配置操作
        setSelfFlag (flag, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.selfFlag = flag
        },

        setSelfEditData (data, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.selfEditData = data
        },

        setDesensitizeInfo(info) {
            this.desensitizeInfo = info
        },

        setDistinctConfigDataLoaded(flag, uniqueId) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.distinctDataLoaded = flag
        },

        // 更新自助配置异常步骤
        updateConfigErrorSteps(uniqueId, type, targetIndex) {
            const editData = this.configUniqueData.find(i => i.uniqueId === uniqueId)
            editData.selfconfigErrorSteps = editData.selfconfigErrorSteps.map(it => {
                if(type === 'insert') {
                    return ++it
                } else if(type === 'delete' && targetIndex < it) {
                    return --it
                }
            })
        }
    }
})