import { defineStore } from 'pinia'
import { stringify, parse } from 'zipson'
import { v4 as uuidv4 } from 'uuid'
import {
    getGroupListApi,
    getTableList,
    getIndexPreviewData,
    getIndexPreviewColumns,
    getIndexTableDetail,
    getUpdateStatus,
    getRecycle,
    getTableTotalNum
} from '@/apis/group'
import { getAccessConfig } from '@/apis/authorityManage'
import { standardRecordTableList } from '@/apis/dataStandard'
import { getimgType, getTableImg, getTableSvg, getCodeType, getUrlParam, getPath } from '@/utils/utils'
import img1 from '@/assets/icons/icon1.png'
import img2 from '@/assets/icons/icon2.png'
import img3 from '@/assets/icons/icon3.png'
import img4 from '@/assets/icons/icon4.png'
import { message } from 'ant-design-vue'


export const mainStore = defineStore('mainStore', {
    state: () => ({
        topMenuList: [{
            path: '/dataBoard',
            title: 'dataBoard.dataBoard',
            isCusTom: false,
            imgUrl: img1
        }, {
            path: '/datacenter',
            title: 'common.dataCenter',
            isCusTom: false,
            imgUrl: img2,
        }, {
            path: '/system',
            title: 'common.dateService',
            isCusTom: true,  //定制
            imgUrl: img4,
        }, {
            path: '/system',
            title: 'common.systemManage',
            isCusTom: false,
            imgUrl: img3,
        }], // 头部功能分区

        leftMenuList: [], // 左侧菜单数据

        menuLoading: false,

        routerPath: '/dataBoard',

        groupObject: {}, // outItem 父级数据 inner 子级数据

        tabsList: [], // tabs的数据

        activeTabKey: '', // 被选中的tabs

        iconPreviewUrl: '', // 图标库选中的icon

        pageId: 'pageTable', // 主页面显示哪一种情况, pageTable 首页面, pageForm, pageExcel, pageDB, pageSql, pageConfig, PageEditTable

        leftTableList: [], // 添加表页面，左侧table表

        updateRecordList: [], // 更新记录列表数据

        updateRecordTabId: '', // 更新记录tab页id

        dataDictionaryTabId: '', // 更新记录tab页id

        indexTableData: [], // 首页的预览表数据

        indexTableColumns: [], // 首页的预览表列

        indexBackTableColumns: [], // 首页的预览表列备份

        indexTableDesc: {}, // 首页预览表的描述

        indexTableStandardCheckTime: '', // 首页预览表的标准校验最新时间

        indexTableActiveId: [], // 首页各tabs下被选中的id

        deleteData: {}, // 要删除的数据

        indexTableLoading: false, // 首页表格加载

        standardTooltipVisible: false, // 数据标准位置气泡显隐

        standardTooltipTimer: null, // 定时器id

        dbTableList: [], // 添加数据库左侧数据

        addDataMode: 'add', // 添加数据方式默认为新增

        dbFormData: {},

        recycleData: {},

        updateId: '',

        updatePolicyData: [], // 更新策略初始化

        updateStatus: {}, 

        editTableType: {}, // 被编辑的表类型

        tableTotal: 0, // 表格总数

        dbPageNumber: 1,

        dbTableCount: 0, // db表总数

        indexPageNumber: 1, // 首页树的分页参数

        systemConfig: {}, 

        accessConfig: {}, // 功能权限配置

        binPageNumer: 1, // 回收站的分页页码

        tablePages: [], // 每个表对应的pageSize

        historyList: [], // 全局搜索的历史记录， 并持久化处理
        
        // API导入弹窗里表格所需的数据 ---- begin
        paramSettingType: '', // basicParamAdd;basicParamEdit;basicParamDel;headParamAdd;headParamEdit;headParamDel;bodyParamAdd;bodyParamEdit;bodyParamDel

        basciParamList: [], // 普通参数表格

        bodyParamList: [], // body参数

        headParamList: [], // 头参数表格

        pageFieldList: [], // 分页参数

        fieldIsEnc: false, // 第一偏移字段是否被作为加密参数

        secondFieldEnc: false, // 第二偏移字段是否被作为加密参数

        requestData: [], // 第二步解析所需数据

        paramsRequestData: [], // 实时参数解析数据 

        paramValue: '', // 参数值

        paramApiKey: '', // 参数实时获取的路径key值

        apiDescType: 1, // 更新策略说明type；值为1、2、3

        suoNum: 0,

        parentKeys: '', // api导入选择 被勾选的节点有相同的直属父级节点

        settingKeys: [], // api导入设置的字段

        apiPreviewColumns: [], // api预览

        apiPreviewData: [], // api预览表格数据

        apiTableAddList: [], //api导入添加参数列表

        apiTableDataList: [],

        checkedKeys: [],

        isCrossLevel: false, // 是否跨层级选择

        multiDataList: [], // 有关层级数据信息

        relationInfo: {}, // 多层级关联字段对象 层级为key 关联字段为数组

        // API导入弹窗里表格所需的数据 ---- end
        dynamicNum: 0,

        fileterTableInfo: {},   // 筛选弹窗表格信息

        loadAccessConfigTimeId: null, // 定时加载配置id

        userInfo: {}, // 用户信息

        uploadInfo: '', // 上传token

        noticeChange: false,    // 通知管理是否修改过

        regularUpdateInfo: {    // 定时更新信息
            uuid: '',
            map:{} // {uuid: {cronStr: '', tips: ''}}
        },
        mirrorInfo: {   // 镜像信息
            fid: '',
            mirror: false,
            unitName: '',
        },
        tableTotalNum: 0, // 列表总数据条数
        modalColumnIndex: 0, // 新增列的索引
        isSelfTable: true, // 是否是自助表, 默认为自助表，禁止级联更新 
        decrypts: [], // 解密列表
        decryptDisabled: true, // 添加解密
        errorObj: undefined, // api导入第二步的错误对象
        crossFormList: [], // 跨表单导入列表
        isEmptyImport: false, //是否跨表单导入
        tableColumnChangeLoading: false, // 表单结构改变加载
        isDataStandardCheck: false, // 设置数据标准校验周期标识
        isApiCallFrequency: false, // api导入设置调用频率
        needTimeOut: false, // 是否需要延迟预览
        dataSourceInfo: null, // 数据集市资源信息
    }),
    actions: {
        setRouterPath (str) {
            this.routerPath = str
        },
        
        setLeftMenuList(list) {
            this.leftMenuList = list
        },

        setPageId(id) {
            this.pageId = id
        },

        setUpdateStatus (obj) {
            this.updateStatus = obj
        },
        setIndexTableStandardCheckTime (obj) {
            this.indexTableStandardCheckTime = obj
        },

        setDeleteData(data) {
            this.deleteData = data
        },
        clearLoginInfo() {
            window.localStorage.removeItem('hasToken')
            window.localStorage.removeItem('TWO_FACTOR_LOGIN')
            this.recycleData = {}
            this.leftMenuList = []
            this.tabsList= [] // tabs的数据
            this.pageId = 'pageTable'
            this.loadAccessConfigTimeId && clearInterval(this.loadAccessConfigTimeId)
            this.accessConfig = {}
            this.systemConfig= {}
        },
        setUserInfo(data){
            this.userInfo = data
        },
        setTopMenu() {
            // 数据集市访客只显示数据看板菜单
            if(this.isDataMarketVisitor) {
                this.topMenuList = [{
                    path: '/dataBoard',
                    title: 'dataBoard.dataBoard',
                    isCusTom: false,
                    imgUrl: img1
                }]
            }
        },
        async loadAccessConfig() {
            try{
                let res = await getAccessConfig()
                if (res.code == 1) {
                    if (!res.data.spManager) {
                        for (let key in res.data) {
                            if (key !== 'spManager') {
                                if (res.data[key]) {
                                    res.data[key] = JSON.parse(res.data[key])
                                }
                            }
                        }
                    }
                    this.accessConfig = res.data || {}
                } 
            }catch(e){
                console.log('accessconfig', e)
            }
        },
        setIntervalLoadAccessConfig () {
            this.loadAccessConfigTimeId = setInterval(() => {
                this.loadAccessConfig()
            }, 180000)
        },
        /**
         * 
         * @param {object} obj 
         * @param {number} type 1、增加，2、更新，3、销毁
         * @returns 
         */
        setUpdatePolicyData (obj, type) {
            if (type === 1 ) {
                const ids = this.updatePolicyData.map(i => i.updateId)
                if (ids.includes(obj.updateId)) return
                this.updatePolicyData.push(obj)
            } else if (type === 2) {
                const index = this.updatePolicyData.findIndex(i => i.updateId === obj.updateId)
                if (index > -1) {
                    this.updatePolicyData[index] = obj
                }
            } else if (type === 3) {
                this.updatePolicyData = []
            }
        },

        setUpdateId (id) {
            this.updateId = id
        },

        setIconPreviewUrl (url) {
            this.iconPreviewUrl = url
        },

        // 加载左侧菜单栏
        loadLeftMenuList(type) {
            this.menuLoading = true

            return new Promise((resolve, reject) => {
                // 编辑分组后 查询列表 新增queryType参数 => 解决接口延迟问题
                getGroupListApi(type === 'update' ? {queryType: 1} : null).then(res => {
                    if (res.code == 1) {
                        res.data.length && res.data.forEach(async item => {
                            // 新增或修改保证展开状态
                            if (this.leftMenuList.length) {
                                this.leftMenuList.forEach(menuItem => {
                                    if (menuItem.id === item.id) {
                                        item.isExpanded = menuItem.isExpanded || false
                                    }
                                })
                            }
                            // 新增或修改tabs的name保证实时更新
                            if (this.tabsList.length) {
                                this.tabsList.forEach(tabItem => {
                                    if (tabItem.id === item.id) {
                                        tabItem.name = item.name
                                        this.pageId = 'pageTable'
                                    }
                                })
                            }
                            item.isHover = false
                            item.isHoverImg = false
                            item.isRename = false
                            item.isModalExpanded = false
                            item.isRevertExpand = false
                            item.isModalRename = false
                            item.title = item.name
                            item.key = item.id
                            item.isLeaf = false
                            if (item.subList.length) {
                                item.subList.forEach(citem => {
                                    citem.isHover = false
                                    citem.isHoverImg = false
                                    citem.isRename = false
                                    citem.isModalChildRename = false
                                    citem.title = citem.name
                                    citem.key = citem.id
                                    citem.isLeaf = false
                                })
                                item.children = item.subList
                            }
                        })
                        this.setLeftMenuList(res.data)
                        resolve()
                    }
                    this.menuLoading = false
                })

            })

        },

        // 加载回收站
        loadRecylceData () {
            return getRecycle().then(res => {
                if (res.code == 1) {
                    this.recycleData = res.data
                } else {
                    message.error(res.message)
                    if (res.code == 401 && getUrlParam('biFid')) {
                        return res
                    }
                }
            })
        },

        selectLeftMenu(groupObject) {
            this.groupObject = groupObject
        },

        setLeftTableList(list, id) {
            this.leftTableList = []
            this.leftTableList = list
            const data = this.leftMenuList.find(item => item.id === id)
            if (data) {
                const subList = data.children?.filter(i => i.subList) || []
                data.children = [...subList, ...list]
            } else {
                this.leftMenuList.forEach(item => {
                    if (item.subList.length) {
                        const tempData = item.subList.find(i => i.id === id)
                        if (tempData) {
                            tempData.children = list
                        }
                    }
                })
            }
        },

        /**
         * 改变tabs的数组
         * @param {object} tab 
         * @param {string} type 1.add 是push 2.close 是关闭
         * @returns 
         */
        changeTabsList(tab, type, changeId, tabInfo) {
            if (type === 'add') {
                const ids = this.tabsList.map(i => i.id)
                if (ids.includes(tab.id)) {
                    const index = this.tabsList.findIndex(item => item.id === tab.id)
                    this.tabsList.splice(index, 1)
                    this.tabsList.unshift(tab)
                    return
                }
                this.tabsList.unshift(tab)
            } else if (type === 'close') {
                const tabIndex = this.tabsList.findIndex(i => i.id === tab.id)
                this.tabsList = this.tabsList.filter(i => i.id !== tab.id)
                if (this.tabsList.length) {
                    const lastTab = this.tabsList[tabIndex] ? this.tabsList[tabIndex] : this.tabsList[this.tabsList.length - 1]
                    this.activeTabKey = lastTab.id
                    if (!lastTab.type) {
                        this.selectTabs({
                            id: this.activeTabKey
                        })
                    }
                } else {
                    this.setLeftTableList([], tab.id)
                }
            } else if (type === 'change') {
                const data = this.tabsList.find(i => i.id === changeId)
                data.type = 'pageConfig'
            } else if (type === 'cancel') {
                const data = this.tabsList.find(i => i.id === changeId)
                data.type = ''
            } else if (type === 'clear') {
                const targetIndex = this.tabsList.findIndex(i => i.id === changeId)
                this.tabsList = this.tabsList.filter(i => i.id !== tab.id)
                this.tabsList.splice(targetIndex, 0, tab)
            } else if(type === 'addInfo') {
                let data = this.tabsList.find(i => i.id === changeId)
                Object.assign(data, tabInfo)
            } else if(type === 'reset') {
                // 重置tab信息
                let targetIndex = this.tabsList.findIndex(i => i.id === changeId)
                if(targetIndex > -1) {
                    this.tabsList[targetIndex] = {
                        id: this.tabsList[targetIndex].id,
                        name: this.tabsList[targetIndex].name
                    }
                }
            }
        },

        selectTabs(tab, type = '') {
            this.activeTabKey = tab.id
            const targetTabTypes = ['updateRecord', 'pageConfig', 'pageBin', 'dataDictionary', 'bloodRelation']
            if(targetTabTypes.includes(tab.type)) {
                return
            }
            this.indexPageNumber = 1
            const params = {
                tableAlias: '',
                groupId: tab.id,
                pageSize: 30,
                pageNum: this.indexPageNumber
            }

            // 新增queryType参数 解决接口延迟问题
            if(['import', 'delete'].includes(type)) {
                params.queryType = 1
            }

            this.indexTableDesc = {}
            this.indexTableColumns = []
            this.indexTableData = []

            return new Promise((resolve, reject) => {
                getTableList(params).then(res => {
                    if (res.code == 1) {
                        this.tableTotal = res.data.total
                        res.data.records.forEach(item => {
                            item.isHover = false
                            item.isImgHover = false
                            item.isRename = false
                            item.iptText = item.tableAlias
                            // 是否有数据标准 并且是空表
                            if(item.standardId && item.tableType.value===0){
                                item.imgSrc = getTableImg({value: 9})
                                item.iconName = getTableSvg({value: 9})
                            } else {
                                item.imgSrc = getTableImg(item.tableType)
                                item.iconName = getTableSvg(item.tableType)
                            }
                            item.key = item.id
                            item.title = item.tableAlias
                            item.isLeaf = true
                        })
                        this.setLeftTableList(res.data.records, tab.id)
                        if (type === 'import' && res.data.records[0]) {
                            this.changeTablePages({
                                id: res.data.records[0].id,
                                pageNum:  1,
                                displaySize: 100
                            }, 'treeClick')
                            this.setIndexTableActiveId(res.data.records[0].id, tab.id)
                            this.getIndexTable({
                                id: res.data.records[0].id
                            })
                        }
                    } else {
                        this.resetMainAreaData()
                    }
                    resolve(res)
                })
            })
        },

        // 重置展示数据
        resetMainAreaData() {
            this.tableTotalNum = 0
            this.tableTotal = 0
            this.leftTableList = []
            this.indexTableDesc = {}
            this.indexTableColumns = []
            this.indexTableData = []
        },

        // 更新选中标签页
        updateActiveTabKey(id){
            this.activeTabKey = id
        },

        setUpdateRecordList(record){

            this.updateRecordList = record
        },

        setUpdateRecordTabId(id){
            this.updateRecordTabId = id
        },
        setDataDictionaryTabId(id){
            this.dataDictionaryTabId = id
        },
        setIndexTableActiveId(id, tabId, type) {
            if (type === 'del') {
                this.indexTableActiveId = this.indexTableActiveId.filter(i => i.tabId !== tabId)
            } else {
                const index = this.indexTableActiveId.findIndex(i => i.tabId === tabId)
                if (index >= 0 ) {
                    this.indexTableActiveId[index].id = id
                } else {
                    this.indexTableActiveId.push({
                        id,
                        tabId
                    })
                }
            }
        },

        async getIndexTable(record) {
            const params = {
                tableId: record.id
            }
            const params1 = {
                id: record.id
            }
            const currentTable = this.tablePages.find(item => item.id === record.id)
            const params2 = {
                tableId: record.id,
                pageNum:  currentTable && currentTable.pageNum,
                pageSize: 100,
                displaySize: currentTable && currentTable.displaySize
            }
            this.indexTableLoading = true
            this.standardTooltipVisible = false
            clearTimeout(this.standardTooltipTimer)


            // 需要延迟加载
            if(this.needTimeOut) {
                message.warning('表结构更新中，请耐心等待，勿重复操作', 3)
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve()
                        this.needTimeOut = false
                    }, 3000)
                })
            }

            const promiseList = [getIndexPreviewData(params2), getIndexPreviewColumns(params), getIndexTableDetail(params1)]
            Promise.all(promiseList).then(res => {
                let desensitized = false
                this.indexTableDesc = {}
                this.indexTableColumns = []
                this.indexTableData = []
                if (res[0].code == 1) {
                    this.setIndexTableData(res[0].data.records)
                }
                if (res[1].code == 1) {
                    res[1].data.length > 0 && res[1].data.forEach(item => {
                        if (item.sensitiveConfig && item.sensitiveConfig.rule !== 'none') {
                            desensitized = true
                        }
                        item.dataIndex = item.columnName
                        item.isSelect = false
                        item.imgType = getimgType(item.columnType)
                        item.type = getCodeType(item.columnType)
                    })
                    this.setIndexTableColumns(res[1].data)
                }
                if (res[2].code == 1) {
                    const v = res[2].data.updatePolicy.value
                    // 2023.11.3 增加v==7， 增量追加类型
                    if (v == 1 || v == 2 || v == 4 || v == 5 || v == 7) {
                        res[2].data.parseUpdateParams = res[2].data.updateParams ? JSON.parse(res[2].data.updateParams) : ''
                    } else {
                        res[2].data.parseUpdateParams = null
                    }
                    res[2].data.desensitized = desensitized
                    this.setIndexTableDesc(res[2].data)
                    this.tableColumnChangeLoading = res[2].data?.tableStatus.value === 8 ? true : false 
                    const flag = res[2].data?.tableType.value === 4 ? true : false
                    this.setIsSelfTable(flag)
                }

                let isEmptyTable = res[2].data?.tableType?.value === 0

                res.forEach((item, index) => {
                    if(item.code != 1) {
                        // 空表预览接口报错不进行提示
                        index === 0 && !isEmptyTable && message.error(item.message)
                    }
                })
                this.indexTableLoading = false
                this.standardTooltipVisible = true
                this.standardTooltipTimer = setTimeout(() => {
                    this.standardTooltipVisible = false
                }, 3000)
            }).catch(e => {
                console.log('表预览详情相关接口异常', e)
            })

            // 表数量单独统计
            getTableTotalNum(params).then(res => {
                if(res.code == 1){
                    this.setTableTotalNum(res.data)
                }
            })

            // 更新记录数据量过大时 获取表更新状态接口时间会很长 所以单独调用  
            getUpdateStatus(record.id).then(res => {
                if (res.code == 1) {
                    this.setUpdateStatus(res.data)
                }
            })
            this.getIndexTableStandardCheckTime()
        },
        // 获取最新的标准校验时间
        getIndexTableStandardCheckTime(){
            // 获取最新的标准校验时间
            let activeTableId = ''
            let activeData = {}
            if (this.indexTableActiveId.length) {
                activeData = this.indexTableActiveId.find(i => i.tabId === this?.activeTabKey)
            }
            if (activeData) {
                activeTableId =  activeData.id
            }
            if(activeTableId.length > 0){
                let listData = {
                    id: activeTableId,
                    pageSize: 1,
                    pageNum: 1
                }
                standardRecordTableList(listData).then(res => {
                    if(res.code == 1){
                        let time = ''
                        if(res?.data?.records?.length > 0){
                            time = res.data.records[0].taskEndTime
                        }
                        this.setIndexTableStandardCheckTime(time)
                    }
                })
            }else{
                this.setIndexTableStandardCheckTime('')
            }
        },

        onlyGetPreviewData (record) {
            this.indexTableLoading = true
            const currentTable = this.tablePages.find(item => item.id === record.id)
            const params2 = {
                tableId: record.id,
                pageNum:  currentTable && currentTable.pageNum,
                pageSize: 100,
                displaySize: currentTable && currentTable.displaySize
            }
            getIndexPreviewData(params2).then(res => {
                if (res.code === 1) {
                    this.setIndexTableData(res.data.records)
                }
                this.indexTableLoading = false
            })
        },

        changeTablePages (data, type) {
            if (type === 'treeClick') {
                const findItem = this.tablePages.find(item => item.id === data.id)
                if (!findItem) {
                    this.tablePages.push(data)
                }
            } else if (type === 'set') {
                const findIndex = this.tablePages.findIndex(item => item.id === data.id)
                this.tablePages[findIndex] = data
            }
        },

        changeHistoryList (data, type) {
            if (type === 'add') {
                if (this.historyList.includes(data)) {
                    this.historyList = this.historyList.filter(item => item !== data)
                    this.historyList.unshift(data)
                    return
                }
                this.historyList.unshift(data)
                this.historyList = this.historyList.length > 10 ? this.historyList.splice(0, 10) : this.historyList
            } else if (type === 'del') {
                this.historyList = this.historyList.filter(item => item !== data)
            }
        },

        setIndexTableData(list) {
            this.indexTableData = list
        },

        setIndexTableColumns(list) {
            this.indexTableColumns = list
            this.indexBackTableColumns = this.indexTableColumns
        },

        setIndexTableDesc(obj) {
            this.indexTableDesc = obj
        },

        setDbTableList(list) {
            list.forEach(item => {
                if (!item.isSelect) {
                    item.isSelect = false
                }
            })
            this.dbTableList = list
        },

        setDbTableCount (count) {
            this.dbTableCount = count
        },

        setIndexPageNumber (num) {
            this.indexPageNumber = num
        },

        setDbFormData(obj) {
            this.dbFormData = obj
        },

        updateAddDataMode(type) {
            this.addDataMode = type
        },

        setDynamicNum (type = 'add', num) {
            if (type === 'over') {
                this.dynamicNum = 0
            } else if (type === 'change') {
                this.dynamicNum = num
            } else {
                this.dynamicNum++
            }
        },

        setSystemConfig (config) {
            // if (config.hiddenDataVisualization) {
            //     this.topMenuList = this.topMenuList.filter(item => item.path !== '/visual')
            // }
            this.systemConfig = config 
        },

        setEditTableType (obj) {
            this.editTableType = obj
        },

        setBinPageNumer (type, num) {
            if (type === 'add') {
                this.binPageNumer++
            } else if (type === 'minus') {
                this.binPageNumer--
            } else if (type === 'set') {
                this.binPageNumer = num
            }
        },
        
        // API 导入所需数据 ----begin
        setParamSettingType(type) {
            this.paramSettingType = type
        },

        setPageFieldList (list) {
            this.pageFieldList = list
        },

        setBasciParamList(data, type) {
            if (type === 'del') {
                this.basciParamList = this.basciParamList.filter(i => i.uuid !== data.uuid)
            } else if (type === 'edit') {
                const index = this.basciParamList.findIndex(i => i.uuid === data.uuid)
                this.basciParamList[index] = data
            } else if (type === 'add') {
                this.basciParamList.push(data)
            } else if (type === 'clear') {
                this.basciParamList = []
            } else if (type === 'echo') {
                this.basciParamList = data
            }
        },

        setBodyParamList(data, type) {
            if (type === 'del') {
                this.bodyParamList = this.bodyParamList.filter(i => i.uuid !== data.uuid)
            } else if (type === 'edit') {
                const index = this.bodyParamList.findIndex(i => i.uuid === data.uuid)
                this.bodyParamList[index] = data
            } else if (type === 'add') {
                this.bodyParamList.push(data)
            } else if (type === 'clear') {
                this.bodyParamList = []
            } else if (type === 'echo') {
                this.bodyParamList = data
            }
        },

        setHeadParamList(data, type) {
            if (type === 'del') {
                this.headParamList = this.headParamList.filter(i => i.uuid !== data.uuid)
            } else if (type === 'edit') {
                const index = this.headParamList.findIndex(i => i.uuid === data.uuid)
                this.headParamList[index] = data
            } else if (type === 'add') {
                this.headParamList.push(data)
            } else if (type === 'clear') {
                this.headParamList = []
            } else if (type === 'echo') {
                this.headParamList = data
            }
        },

        setRequestData (data) {
            this.requestData = data
        },

        setCheckedKeys (data){
            this.checkedKeys = data
        },

        setParamsRequestData (data) {
            this.paramsRequestData = data
        },

        setParamValue (value) {
            this.paramValue = value
        },

        setParamApiKey (key) {
            this.paramApiKey = key
        },

        setApiDescType (type) {
            this.apiDescType = type
        },

        /**
         * type: (add: 添加; del: 删除;)
         * @param {object} data // 操作的数据 
         * @param {string} type 
         */
        changeSettingKeys (data, type) {
            if (type === 'add') {
                this.settingKeys.push(data)
            } else if (type === 'del') {
                this.settingKeys = this.settingKeys.filter(i => i.key !== data.key)
            } else if (type === 'clear') {
                this.settingKeys = []
            } else if (type === 'set') {
                this.settingKeys = data
            }
        },

        setParentKeys (key) {
            this.parentKeys = key
        },

        setApiPreviewColumns (data) {
            this.apiPreviewColumns = data
        },

        setApiPreviewData (data) {
            this.apiPreviewData = data
        },

        setRelationInfo (data) {
            this.relationInfo = data
        },

        setApiTableDataList (list) {
            this.apiTableDataList = list
        },

        // flag  默认为false 只更新multiData时为true
        setMultiDataList (flag) {
            let filterArr = []
            if (this.apiTableAddList.length > 0) {
                filterArr = this.settingKeys.concat(this.apiTableAddList)
            } else {
                filterArr = this.settingKeys
            }
            const { tableDataList } = this.getMultiData(this.settingKeys)
            const { multiDataList } = this.getMultiData(filterArr)
            if (!flag) {
                this.apiTableDataList = tableDataList
            }
            this.multiDataList = multiDataList
        },
        getMultiData(filterArr){
            const filterObj = filterArr.reduce((result, item) => {
                const key = item.flagNum
                if (!result[key]) {
                    result[key] = []
                }
                result[key].push(item)
                return result
            }, {})
            let multiDataList = []
            let tableDataList = []
            this.relationInfo = {}
            for (let key in filterObj) {
                if (filterObj[key].length) {
                    this.relationInfo[key] = filterObj[key].filter(i => i.isRelation)
                }
            }
            for (let key in filterObj) {
                if (filterObj[key].length) {
                    let bindObj = {}
                    let tableBindObj = []
                    const rkeys = Object.keys(this.relationInfo).map(item => Number(item)).filter(item => item < key).sort((a,b) => a-b)
                    let minusNum = 1
                    let maxNum = rkeys[rkeys.length - minusNum]
                    for (let rKey in this.relationInfo) {
                        if (maxNum < key && this.relationInfo[maxNum].length) {
                            bindObj = {
                                bind: {
                                    path: getPath(this.relationInfo[maxNum][0].key),
                                    fields: this.relationInfo[maxNum].map(item => ({
                                        "originalName": item.title,
                                        "curName": item.originName,
                                        "newOriginalName": item.newOriginalName ? item.newOriginalName : item.title,
                                        "classType": item.numType
                                    }))
                                }
                            }
                            tableBindObj = this.relationInfo[maxNum]
                            break
                        } else {
                            minusNum++
                            maxNum = rkeys[rkeys.length - minusNum]
                        }
                    }
                    let tempObj = {
                        ...bindObj,
                        path: getPath(filterObj[key][0].key),
                        fields: filterObj[key].map(item => ({
                            'isNumArray': item?.isNumArray ? true : false,
                            "originalName": item.title,
                            "curName": item.originName,
                            "newOriginalName": item.newOriginalName ? item.newOriginalName : item.title,
                            "classType": item.numType,
                            "isPrimaryKey": item.isPrimaryKey,
                        }))
                    }
                    tableDataList = [...tableDataList, [...tableBindObj, ...filterObj[key]]]
                    multiDataList = [...multiDataList, tempObj]
                }
            }
            return { tableDataList, multiDataList }
        },
        // API 导入所需数据 ----end
        setFileterTableInfo(info) {
            this.fileterTableInfo = info
        },

        switchNoticeChange(flag){
            this.noticeChange = flag
        },

        setUploadInfo(info) {
            this.uploadInfo = info
        },
        setRegularUpdateInfo(info,id=false) {
            //set的时候会更新uuid但是保留之前的数据
            let uuid = id || uuidv4()
            this.regularUpdateInfo.uuid = uuid
            this.regularUpdateInfo.map[uuid] = info
        },
        resetRegularUpdateInfo() {
            let uuid = this.regularUpdateInfo.uuid
            let initData = {
                tips: '每隔 1 天，从 0 点 0 分 开始更新',
                cronStr: '0 0 0 0/1 * ?'
            }
            if(uuid){
                this.setRegularUpdateInfo(initData,uuid)
            }else{
                this.setRegularUpdateInfo(initData)
            }
        },
        getRegularUpdateInfo(id = false) {
            let uuid = id || this.getRegularUpdateUuid()
            let result
            if(!uuid){
                this.resetRegularUpdateInfo()
                result = this.getRegularUpdateInfo()
            }
            else if(uuid && this.regularUpdateInfo.map[uuid]){
                result = this.regularUpdateInfo.map[uuid]
            }
            return result
        },
        getRegularUpdateUuid() {
            let result = ''
            if(this.regularUpdateInfo.uuid){
                result = this.regularUpdateInfo.uuid
            }else{
                this.resetRegularUpdateInfo()
                result = this.getRegularUpdateUuid()
            }
            return result
        },
        setMirrorInfo(info) {
            this.mirrorInfo = info
        },
        setTableTotalNum(data){
            this.tableTotalNum = data
        },
        setModalCloumnIndex(index){
            this.modalColumnIndex = index
        },
        setIsSelfTable(val) {
            this.isSelfTable = val
        },
        setDecrypts(data) {
            this.decrypts = data
        },
        setDecryptDisabled(val) {
            this.decryptDisabled = val
        },
        setIsCrossLevel(val) {
            this.isCrossLevel = val
        },
        setApiTableAddList(data){
            this.apiTableAddList = data
        },
        setErrorObj (data) {
            this.errorObj = data
        },
        setCrossFormList(data) {
            this.crossFormList = data
        },
        setIsEmptyImport(val){
            this.isEmptyImport = val
        },
        setIsDataStandardCheck(flag) {
            this.isDataStandardCheck = flag
        },
        setIsApiCallFrequency(flag) {
            this.isApiCallFrequency = flag
        },
        setNeedTimeOut(flag) {
            this.needTimeOut = flag
        },
        setDataSourceInfo(info) {
            this.dataSourceInfo = info
        }
    },
    getters: {
        currentTab(){
            return this.tabsList.find(it => it.id === this.activeTabKey)
        },
        isSuperManager() {
            return this.userInfo?.roles?.includes('超级管理员')
        },
        isDataMarketVisitor() {
            return this.userInfo?.roles?.length === 1 && this.userInfo.roles[0] === '数据集市游客'
        }
    },
    persist: {
        key: "historyList",
        paths: ['historyList'],
        storage: localStorage,
        serializer: {
            deserialize: parse,
            serialize: stringify
        }
    }
})