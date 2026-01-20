import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid'
import { getimgType, getCodeType } from '@/utils/utils'
import { getCodeList, getPreviewData } from '@/apis/config';
import selectImg from '@/assets/icons/selectcode.png'
import selectedImg from '@/assets/icons/active_one.png'
import { selfConfigError } from '@/utils/bloodAnalysis'

export const apiConfigStore = defineStore('apiConfigStore', {
    state: () => ({
        selfConfig: [], // 所有自助配置项的大数组
        headerInfo: {
            apiName: '', // 接口名称
            apiDesc: '', // 接口描述
            apiType: 0, // 接口类型
            resTemplateId: '', // 模板id
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
        tableSource: [],
        selfEditData: {},
        selfFlag: 'add',
        operActiveId: '', // 记录每次操作的具体步骤的uuid
        showType: 'selectCode', // filterData, sortData, addColumns, groupData, codeSetting, mergeData
        tableLoading: false, // 表格加载
        rightTableLoading: false,
        codeList: [], // 选择字段列表
        codeBackList: [], // 选择字段back列表
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
        updateInfo: {
            updatePolicy: 'NONE', // 更新策略 
            updateParams: {}, // 更新参数
        },
        addColumnsData: [], // 存放添加的数据
        editThemeStep: 1,    // 推送管理编辑主题步骤
        errorConfigInfo: {
            isError: false,
            colInfo: []
        },
        rightErrorCodeList: {},
        selfconfigErrorSteps: [],  // 字段未选中 异常步骤
        bloodErrorSteps: [], // 字段丢失 异常步骤
        firstChangeConfig: true,
        filterConfig: [],
        totalDataCount: 0,
        phyFieldFlag: 'normal',    // 字段设置物理字段名是否合法 normal|blank|repeat
    }),
    actions: {

        setShowType(type) {
            this.showType = type
        },

        setHeaderInfo (headData) {
            this.headerInfo = headData
        },

        goBack() {
            this.$reset()
        },

        changeUpdateInfo (info) {
            this.updateInfo.updateParams = info.updateParams
        },

        setAddColumnsData (data, operId) {
            const operIds = this.addColumnsData.map(i => i.uuid)
            if (operIds.includes(operId)) {
                const targetIndex = this.addColumnsData.findIndex(i => i.uuid === operId)
                this.addColumnsData[targetIndex] = data
            } else {
                this.addColumnsData.push(data)
            }
        },

        changeOperationList(arr) {
            this.operationList = arr
        },

        setOperationList(list) {
            list = { ...list, uuid: list.uuid || uuidv4() }
            this.operationList.push(list)
            this.changeOperationList(this.operationList)
            this.setOperActiveId(list.uuid, 1)
            const data = this.selfConfig[this.selfConfig.length - 1]
            if (data) {
                const configData =  this.selfConfig[this.selfConfig.length - 1].config
                this.getPreviewData(configData, 2, list)
            }
        },
        // 步骤中间插入步骤
        insertOperationList(list, index) {
            list = { ...list, uuid: list.uuid || uuidv4() }
            this.operationList.splice(index+1, 0, list)
            this.changeOperationList(this.operationList)
            this.setOperActiveId(list.uuid, 1)

            const data = this.selfConfig[index]
            if (data) {
                const configData =  data.config
                this.getPreviewData(configData, 2, list)
            }
        },
        async editClickOperActiveId () {
            if (this.operationList.length > 1) {
                let targetIndex = this.selfConfig.findIndex(item => item.uuid === this.operActiveId)
                if (targetIndex >= 0) {
                    // 获取当前步 与 上一步的自助配置预览结果
                    // 当前步的字段种类   和上一步的预览结果保持一致
                    // 当前步的字段信息(字段类型、字段别称)   和当前步的预览结果保持保持一致

                    // 使用Promise.all来并发执行getPreviewData调用
                    const fetchPreviewData = async (config, step, options, showError) => {
                        return this.getPreviewData(config, step, options, showError);
                    };
                    const [res2, res1] = await Promise.all([
                        fetchPreviewData(this.selfConfig[targetIndex - 1].config, 3, { uuid: this.selfConfig[targetIndex - 1].uuid }, false),
                        fetchPreviewData(this.selfConfig[targetIndex].config, 4, { uuid: this.selfConfig[targetIndex].uuid }, false)
                    ]);
                    if (res2.codeList.length) {
                        const currentData = this.selfConfig[targetIndex]?.config.filter((item)=> item.uuid === this.operActiveId)[0]
                        // const columnNames = res1.codeList.map(i => i.columnName)
                        // 字段名可能被修改 改为通过id判断
                        const columnIds = res1.codeList.map(i => i.id)
                        res2.codeList.forEach(item => {
                            // 解决新增字段不存在 id 的情况，修改的名称不显示问题
                            if(!item.id){
                                let currentDataObj = currentData?.contents.find((cont)=> item.columnName === cont.column)
                                if(currentDataObj){
                                    item.newColumnName = currentDataObj.newColumnName
                                }
                            }
                            let target = res1.codeList.find(it => it.id && (it.id === item.id))
                            if(target) {
                                // 字段类型回显
                                item.type = target.type
                                item.imgType = target.imgType
                                item.columnType = target.columnType
                                // 字段名称回显
                                item.columnAlias = target.columnAlias
                                item.newColumnName = target.columnName
                            }
                            if (columnIds.includes(item.id)) {
                                item.isSelect = true
                            } else {
                                item.isSelect = false
                            }
                        })
                        // 字段顺序以后一步为准
                        let tempCodeList = []
                        columnIds?.forEach(id => {
                            let temp = res2.codeList.find(item => id && (item.id === id))
                            temp && tempCodeList.push(temp)
                        })

                        // 判断上一步结果字段是否都包含
                        res2.codeList.forEach(it => {
                            if(!tempCodeList.find(item => item.columnName === it.columnName)) {
                                tempCodeList.push(it)
                            }
                        })
                        res2.codeList = tempCodeList
                    }
                    const obj = {
                        codeList: res2.codeList,
                        previewColumns: res1.previewColumns,
                        previewData: res1.previewData,
                        uuid: res1.uuid,
                    }
                    // 备份codeList
                    if(this.selfConfig[targetIndex].config?.length) {
                        let targetConfig = this.selfConfig[targetIndex].config.find(c => c.uuid === this.operActiveId)
                        obj.codeBackList = obj.codeList.map(item => {
                            if(targetConfig?.contents?.length) {
                                let target = targetConfig.contents.find(it => it.column == item.columnName)
                                if(target && target.targetFormat) {
                                    item.codeSetting = target
                                }
                            }
                            return item
                        })
                    }
                    let index = this.allConfigData.findIndex(item => item.uuid === obj.uuid)
                    if (index > -1) {
                        this.allConfigData[index] = obj
                    } else {
                        this.allConfigData.push(obj)
                    }
                }
            } else {
                this.setOperActiveId(this.operationList[0].uuid, 2)
            }
        },

        setOperActiveId(id, type) {
            this.operActiveId = id
            if (type === 1) return
            let targetIndex = this.selfConfig.findIndex(item => item.uuid === this.operActiveId)
            if (targetIndex >= 0) {
                let data = cloneDeep(this.selfConfig[targetIndex].config)
                this.getPreviewData(data, '', '', false)
            } else {
                const data = this.selfConfig[this.selfConfig.length - 1]
                if (data) {
                    const configData = cloneDeep(this.selfConfig[this.selfConfig.length - 1].config)
                    this.getPreviewData(configData, '', '', false)
                }
            }
        },

        // 首页的字段列
        // flag 默认false  true:不为编辑前的表
        async getCodeList(record, flag) {
            const params = {
                tableId: record.id
            }
            let res = await getCodeList(params)
            if (res.code == 1) {
                if(!flag){
                    let columns = []
                    if (this.selfFlag === 'edit' && this.tableSource.length) {
                        columns = this.tableSource[0].contents.columns
                    }
                    res.data.length && res.data.forEach(item => {
                        if (!columns || columns.includes(item.columnName)) {
                            item.isSelect = true
                        } else {
                            item.isSelect = false
                        }
                    })
                }
                // 添加类型转换
                res.data.length && res.data.forEach(item => {
                    item.imgType = getimgType(item.columnType)
                    item.type = getCodeType(item.columnType)
                })
                this.selectedCodeList = res.data.filter(item => item.isSelect)
                this.setCodeList(res.data)
            }
        },

        setCodeList(list) {
            this.codeList = list
            this.codeBackList = this.codeList
        },

        setSelectedCodeList(list) {
            list.length && list.forEach(item => {
                item.isRename = false
            })
            this.selectedCodeList = list
        },

        // 多表合并选择右表的字段列
        // 仅在编辑时type为edit，array有值
        getRightCodeList(record, type, array) {
            const params = {
                tableId: record.id
            }
            this.rightCodeLoading = true
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
                        item.type = getCodeType(item.columnType)
                    })
                    this.setRightCodeList(res.data)
                } else {
                    message.error(res.message)
                }
                this.rightCodeLoading = false
            })
        },

        setRightCodeList(list) {
            this.rightCodeList = list
            const obj = { codeList: list, uuid: this.operActiveId }
            obj.codeBackList = obj.codeList
            if (this.rightCodeArray.length > 0) {
                const index = this.rightCodeArray.findIndex(item => item.uuid === this.operActiveId)
                if (index >= 0) {
                    this.rightCodeArray[index] = { ...this.rightCodeArray[index], ...obj }
                } else {
                    this.rightCodeArray.push(obj)
                }
            } else {
                this.rightCodeArray.push(obj)
            }
        },

        setExpandedKeys (keys, type) {
            let obj = {}
            if ( type === 1) {
                obj = { defaultExpandedKeys: keys, uuid: this.operActiveId }
            } else if( type === 2) {
                obj = { defaultSelectedKeys: keys, uuid: this.operActiveId }
            }
            if (this.rightCodeArray.length > 0) {
                const index = this.rightCodeArray.findIndex(item => item.uuid === this.operActiveId)
                if (index >= 0) {
                    this.rightCodeArray[index] = { ...this.rightCodeArray[index], ...obj }
                } else {
                    this.rightCodeArray.push(obj)
                }
            } else {
                this.rightCodeArray.push(obj)
            }
        },

        changeSelfConfig (data) {
            this.selfConfig = data
        },

        async setSelfConfig(record, type, insertIndex = -1) {
            const length = this.selfConfig.length - 1
            let previewInfo = null
            if (type == 'select') {
                const obj = {
                    uuid: this.operActiveId,
                    config: [record]
                }
                let targetIndex = this.selfConfig.findIndex(item => item.uuid === this.operActiveId)
                if (targetIndex >= 0) {
                    this.selfConfig[targetIndex].config = [record]
                } else {
                    this.selfConfig.push(obj)
                }
                previewInfo = await this.getPreviewData(this.selfConfig[0].config, '', '')
            } else if (type === 'delete') {
                // 删除中间步骤 更新后续步骤
                let deleteIndex = record.deleteIndex
                if(deleteIndex > -1) {
                    for(let i = deleteIndex+1; i <= length; i++) {
                        this.selfConfig[i].config.splice(deleteIndex, 1)
                    }
                }
                const tempList = this.selfConfig.filter(item => item.uuid !== record.uuid)
                this.selfConfig = tempList
            } else {
                const obj = {
                    uuid: this.operActiveId,
                    config: [...this.selfConfig[length].config, record]
                }

                // 步骤中间插入步骤 更新后续步骤
                if(insertIndex > -1) {
                    obj.config = [...this.selfConfig[insertIndex].config, record]
                    for(let i = insertIndex+1; i <= length; i++) {
                        this.selfConfig[i].config.splice(insertIndex+1, 0, record)
                    }
                }
                let targetIndex = this.selfConfig.findIndex(item => item.uuid === this.operActiveId)
                if (targetIndex >= 0) {
                    let index = this.selfConfig[targetIndex].config.findIndex(item => item.uuid === record.uuid)
                    this.selfConfig[targetIndex].config[index] = record
                    previewInfo = await this.getPreviewData(this.selfConfig[targetIndex].config, '', '')
                } else {
                    let configData = null
                    // 指定索引位置插入新步骤
                    if(insertIndex > -1) {
                        this.selfConfig.splice(insertIndex+1, 0, obj)
                        configData = cloneDeep(this.selfConfig[insertIndex+1].config)
                    } else {
                        this.selfConfig.push(obj)
                        configData = cloneDeep(this.selfConfig[this.selfConfig.length - 1].config)
                    }
                    previewInfo = await this.getPreviewData(configData, '', '')
                }
            }

            // 插入步骤 不用判断异常步骤
            if(insertIndex === -1) {
                this.updateErrorOperate(record, previewInfo)
            }
            this.updateSelfConfig()
            
        },
        // 更新自助配置 后面步骤与前面步骤保持一致
        updateSelfConfig(){
            for(let i = 1; i < this.selfConfig.length; i++) {
                let configInfo = this.selfConfig[i].config
                let preConfingInfo = this.selfConfig[i - 1].config
                preConfingInfo.forEach((preConfig, i) => {
                    configInfo[i] = preConfig
                })
            }
        },
        // 移除错误步骤
        deleteErrorOperate(record){
            let index = this.operationList.findIndex(it => it.uuid === record.uuid)
            if(this.selfconfigErrorSteps.includes(index)){
                this.selfconfigErrorSteps = []
            }
        },
        // 更新错误步骤
        async updateErrorOperate(record, previewInfo){
            let configArr = this.selfConfig[this.selfConfig.length - 1].config

            let targetIndex = configArr?.findIndex(it => it.uuid === record.uuid)

            if(targetIndex < 0) return

            let flag = false, selectColumns = []
            

            // 判断当前步骤是否为异常步骤
            if(this.selfconfigErrorSteps.includes(targetIndex)) {

                selectColumns = this.allConfigData.find(it => it.uuid === record.uuid)?.codeList?.map(it => it.columnName) || []

                flag = selfConfigError(record, selectColumns)
                // 当前步骤恢复正常
                if(!flag) {
                    this.selfconfigErrorSteps = []
                }
                
            } else {     // 判断后续步骤是否异常
                let nextConfig = configArr[++targetIndex]
                selectColumns = previewInfo?.codeList?.map(it => it.columnName)

                while(nextConfig) {
                    // 上一个配置为多表合并或新增列 更新selectColumns
                    if(['join', 'add'].includes(configArr[targetIndex-1]?.action)) {
                        let uuid = configArr[targetIndex-1].uuid
                        let configData = this.selfConfig.find(it => it.uuid === uuid)?.config
                        previewInfo = await this.getPreviewData(configData, 3, '')
                        selectColumns = previewInfo?.codeList?.map(it => it.columnName)
                    } else if(configArr[targetIndex-1]?.action === 'setting') {
                        // 上一步操作为字段设置时 可能会修改字段名 保持字段名一致
                        configArr[targetIndex-1].contents.forEach(info => {
                            let targetIndex = selectColumns.findIndex(col => col === info.column)
                            if(targetIndex>-1 && info.newColumnName) {
                                selectColumns[targetIndex] = info.newColumnName
                            }
                        })
                    }

                    flag = selfConfigError(nextConfig, selectColumns)

                    if(flag) {  // 下一步异常
                        // 通过操作步骤id 获取异常步骤索引
                        let operateIndex = this.operationList.findIndex(it => it.uuid === nextConfig.uuid)
                        this.selfconfigErrorSteps = [operateIndex]
                        break
                    } else {    // 下一步正常
                        this.selfconfigErrorSteps = []
                    }

                    nextConfig = configArr[++targetIndex]
                }
            }
        },

        // 更新codeList 切换步骤时 当前codeList取上一步结果 TODO: 不依赖 default:true selfConfig
        async updateAllConfigData(id) {
            let targetIndex = this.selfConfig.findIndex(item => item.uuid === id)

            if(targetIndex < 1) return
            
            // 目标步骤是否为字段设置
            let isCodeSet = this.operationList.find(i => i.uuid === id)?.id === 'codeSetting'
            let res = await this.getPreviewData(this.selfConfig[targetIndex - 1].config, 3, { uuid: this.selfConfig[targetIndex - 1].uuid}, false)

            let obj = {
                codeList: cloneDeep(res.previewColumns),
                previewColumns: res.previewColumns,
                previewData: res.previewData,
                uuid: id,
                codeBackList: []
            }

            obj.codeBackList = obj.codeList

            obj.uuid = id

            let index = this.allConfigData.findIndex(item => item.uuid === obj.uuid)

            if (index < 0) return

            // 字段设置字段单独处理
            if(isCodeSet) {
                this.handleCodeSetColumns(this.allConfigData[index].codeList, obj)
            }
            this.allConfigData[index] = obj
            
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

        deleteAllConfigData(record) {
            this.allConfigData = this.allConfigData.filter(item => item.uuid !== record.uuid)
        },

        changeAllConfigData (list) {
            this.allConfigData = list
        },

        /**
         * 获取预览表， type, list 仅新增情况有
         * @param {*} record 
         * @param {*} type 为3时，仅是获取数据并涉及页面数据
         * @param {*} list 
         */
        getPreviewData(record, type, list = [], showError=true) {
            if (type !== 3) {
                this.tableLoading = true
            }
            record = record.filter(it => !it.default)
            return getPreviewData(record).then(res => {
                let previewColumns = []
                let previewData = []
                if (res.code == 1) {
                    if (type !== 3) {
                        this.previewColumns = []
                        this.previewData = []
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
                        this.totalDataCount = res.extendData?.totalDataCount || 0
                        this.previewColumns = previewColumns
                        this.previewData = previewData
                    }
                    this.tableLoading = false
                } else {
                    if (type !== 3) {
                        this.previewColumns = []
                        this.previewData = []
                    }
                    this.totalDataCount = 0
                    this.tableLoading = false
                    showError && message.error(res.message)
                }
                // 2新增 3编辑点击 操作步骤
                if (type === 2 || type === 3 || type === 4 || type === '') {
                    if (type === 2) {
                        this.previewColumns.length && this.previewColumns.forEach(item => {
                            item.isSelect = true
                        })
                    }
                    const obj = {
                        uuid: list.uuid,
                        codeList: cloneDeep(previewColumns),
                        previewColumns: previewColumns,
                        previewData: previewData,
                        totalDataCount: this.totalDataCount
                    }
                    obj.codeBackList = obj.codeList
                    if (type === 2) {
                        const uuids = this.allConfigData.map(item => item.uuid)
                        if (uuids.includes(obj.uuid)) return
                        this.allConfigData.push(obj)
                    } else if (type === 3 || type === 4 || type === '') {
                        this.updateSelfConfig()
                        return new Promise(res => {
                            res(obj)
                        })
                    }
                }
            })
        },

        setPreviewData(list) {
            this.previewData = list
        },

        setPreviewColumns(list) {
            this.previewColumns = list
        },

        // 获取多表合并右侧预览表
        getRightPreviewData(selfConfig) {
            this.rightTableLoading = true
            getPreviewData([selfConfig]).then(res => {
                const index = this.rightCodeArray.findIndex(item => item.uuid === this.operActiveId)
                if (res.code == 1) {
                    this.previewRightColumns = []
                    this.previewRightData = []
                    const columns = res.data.targetTableColumns
                    for (let key in columns) {
                        columns[key].dataIndex = key
                        columns[key].imgType = getimgType(columns[key].columnType)
                        this.previewRightColumns.push(columns[key])
                    }
                    this.previewRightData = res.data.queryResult || []
                    if (index >= 0) {
                        this.rightCodeArray[index].tableColumns = this.previewRightColumns
                        this.rightCodeArray[index].tableData = this.previewRightData
                    }
                    this.rightTableLoading = false
                } else {
                    if (index >= 0) {
                        this.rightCodeArray[index].tableColumns = []
                        this.rightCodeArray[index].tableData = []
                    }
                    message.error(res.message)
                    this.rightTableLoading = false
                }
            })
        },

        // 多表合并的左表
        setLeftMergeTable(table) {
            this.leftMergeTable = table
        },

        // 多表合并的右表
        setRightMergeTable(table) {
            const obj = {...table, uuid: this.operActiveId}
            if (this.rightMergeTable.length > 0) {
                const index = this.rightMergeTable.findIndex(item => item.uuid === this.operActiveId)
                if (index >= 0) {
                    this.rightMergeTable[index] = obj
                } else {
                    this.rightMergeTable.push(obj)
                }
            } else {
                this.rightMergeTable.push(obj)
            }
        },

        /**
         * 自助配置生成的操作
         * @param {*} source 
         * @param {*} type init初始化， change各个步骤更改是同时改tableSource
         */
        setTableSource (source, type = 'init') {
            if (type === 'init') {
                if (source) {
                    this.tableSource = JSON.parse(source)
                } else {
                    this.tableSource = []
                }
            }
            if (type === 'equal') {
                this.tableSource = source
            }
            if (type === 'change') {
                const uuids = this.tableSource.map(item => item.uuid)
                if (uuids.includes(source.uuid)) {
                    const findIndex = this.tableSource.findIndex(item => item.uuid === source.uuid)
                    this.tableSource[findIndex] = source
                } else {
                    this.tableSource.push(source)
                }
            }
            if (type === 'delete') {
                this.tableSource = this.tableSource.filter(item => item.uuid !== source.uuid)
            }
        },

        // 自助配置操作
        setSelfFlag (flag) {
            this.selfFlag = flag
        },

        setSelfEditData (data) {
            this.selfEditData = data
        },

        setEditThemeStep(num) {
            this.editThemeStep = num
        },

        setFilterConfig(info) {
            this.filterConfig = info
        },
        
        setPhyCodeFlag(flag) {
            this.phyFieldFlag = flag
        }
    }
})