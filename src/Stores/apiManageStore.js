import { defineStore } from 'pinia'
import { getApiList, getApiDetail, getApiAuthList, getApiHistory } from '@/apis/apiManage'
import { getTemplateList, getTmplGroup } from '@/apis/templateManage'
import { getAuthorityList, getRoleList } from '@/apis/authorityManage'
import { getCollectionList, getPushPlatform, getPushTopic, getPushMethod, getPushRecordList } from '@/apis/push'
import { getTaskList, getTaskCount, removeHistoryDot, removeIndexDot } from '@/apis/task'
import { message } from 'ant-design-vue'
import { isCustomizedMenuFid } from '@/utils/utils';
import { SYSTEM_MENU_MAP, customSystemMenus } from '@/constants/systemManage'

export const apiManageStore = defineStore('apiManageStore', {
    state: () => ({
        apiTabList: [
            {
                name: 'apiManage.apiManage',
                id: SYSTEM_MENU_MAP.API_MANAGE,
                path: '/system/apiManage',
            },
        ],
        activeMenuName: SYSTEM_MENU_MAP.API_MANAGE,
        _systemActiveMenuName: SYSTEM_MENU_MAP.TEMPLATE_MANAGE, //只针对定制菜单 系统管理num
        _dataServiceActiveMenuName: SYSTEM_MENU_MAP.API_MANAGE, //只针对定制菜单 数据服务num
        apiPageId: 'apiManagePage', // apiManagePage, addApiPage, addPushThemePage
        goPath: {}, // 切换路由时，记录要跳往的路由
        // api详情页markdown源码
        apiMarkDownCode: '',
        indexTableData: [], // 首页表格数据
        apiSearchValue: '', // api管理搜索内容
        authManageList: [], // 授权管理用户列表
        templateList: [], // 模板列表
        authorityList: [], // 权限列表
        authPageNumber: 1, // 用户管理分页页码
        authStatuses: [{
            value: 0,
            label: 'authManage.enabled',
            isSelect: true
        }, {
            value: 1,
            label: 'authManage.disabled',
            isSelect: true
        }], // 用户管理按状态筛选
        authSearchValue: '', // 用户管理
        authLoading: false,
        authDataTotal: 0, // 用户管理列表数据总数，供分页使用
        roleList: [], // 角色列表
        rolePageNumber: 1, // 角色分页页码
        roleDateTotal: 0, // 角色列表总数
        apiPageNumber: 1, // API管理分页页码
        apiDataTotal: 0, // API管理列表数据总数，供分页使用
        templatePageNumber: 1, // 模板管理分页页码 
        templateDataTotal: 0, // 模板管理列表数据总数，供分页使用
        apiHistoryList: [], // api历史记录
        apiHistoryPageNumber: 1, // api历史记录分页页码,
        apiHistoryDataTotal: 0, // api历史记录总数
        collectionList: [], // 推送管理列表
        collectionPageNumber: 1,
        collectionDataTotal: 0,
        pushPlatform: [], // 推送平台
        pushTopicList: [], // 推送主题列表
        pushTopicSearchValue: '', //推送主题搜索内容
        pushListLoading: false,  // 推送管理loading
        pushTopicPageNumber: 1,
        pushTopicTotal: 0,
        pushMehtodList: [], // 推送方式
        pushRecordList: [], // 推送记录列表
        pushRecordPageNumber: 1,
        pushRecordTotal: 0,
        themeEditData: {},
        themeOperFlag: 'add',
        taskCountObj: {
            redDot: 0,
            historyCount: 0
        },
        taskList: [], // 任务中心请求的列表
        currentTaskList:[],//本地缓存的当前任务列表
        historyTaskList:[],//本地缓存的历史任务列表
        taskCenterLoading: false,
        taskPageNumber: 1,
        taskDataTotal: 0,
        taskSearchType: 0, // 0查个人当前任务 1查历史任务
        taskCenterSearchKw: '',   // 任务中心搜索关键字
        searchTaskType: '', // 任务中心搜索任务类型
        taskSetInterval: '', // 获取任务数量的定时器
        taskListInterval: '', // 获取当前任务列表的定时器
        taskHistoryDiff: 0, // 查看历史任务区分， 0 看自己的 1 看全部
        tmplGroupList: [], // 模板分组
        tmplGroupId: '', // 模板管理分组id
        tmpListLoading: false,  // 模板管理loading
        tmpGroupPageNum: 1, // 模板分组页码
        tmpGroupLoadEnd: false, //  模板分组数据是否加载完毕
        tmpListLoadEnd: false,  //  模板数据是否加载完毕
        tmpPageLoading: false, // 分页加载loading
        resetTempWrapperScroll: false,
        pushRecordMethod: -1, // 推送记录-推送方式
        pushDataMode: -1, // 推送模式
        pushRecordLoading: false,
        relationNodeName: '', // 血缘关系节点
    }),
    actions: {
        setApiPageId (id) {
            this.apiPageId = id
        },
        addApiTab(tab) {
            const ids = this.apiTabList.map(i => i.id)
            if (ids.includes(tab.id)) {
                const index = this.apiTabList.findIndex(item => item.id === tab.id)
                this.apiTabList.splice(index, 1)
                this.apiTabList.unshift(tab)
                return
            }
            this.apiTabList.unshift(tab)
        },
        setActiveMenuName (menuName) {
            if(isCustomizedMenuFid()){
                // 定制单位 系统管理下菜单
                if(customSystemMenus.includes(menuName)){
                    this._systemActiveMenuName = menuName
                }else{
                    this._dataServiceActiveMenuName = menuName
                }
                 this.activeMenuName = menuName
            }else{
                this.activeMenuName = menuName
            }
        },
        removeTab(tab) {
            let tabIndex = 0
            const customizeSysTemRoute = ['/templateManage','/authorityManage','/langManage','/taskCenter']
            if(isCustomizedMenuFid()){
                const currentSystemTab = customizeSysTemRoute.some(i=>tab.path.includes(i))  // true: 系统管理tab,false:数据服务tab
                let currentTabList = this.apiTabList.filter(item=>{
                    if(currentSystemTab){
                      return customizeSysTemRoute.some(i=>item.path.includes(i))
                    }else{
                      return !customizeSysTemRoute.some(i=>item.path.includes(i))
                    }
                })
                tabIndex = currentTabList.findIndex(i => i.id === tab.id)
                this.apiTabList = this.apiTabList.filter((item) => item.id !== tab.id)
                currentTabList = currentTabList.filter((item) => item.id !== tab.id)
                const data = currentTabList[tabIndex] ? currentTabList[tabIndex] : currentTabList[currentTabList.length - 1]
                if (data.path.indexOf('/system/apiDetail') > -1) {
                    this.initApiDetail({
                        id: data.id
                    })
                }
            }else{
                tabIndex = this.apiTabList.findIndex(i => i.id === tab.id)
                this.apiTabList = this.apiTabList.filter((item) => item.id !== tab.id)
                const data = this.apiTabList[tabIndex] ? this.apiTabList[tabIndex] : this.apiTabList[this.apiTabList.length - 1]
                if (data.path.indexOf('/system/apiDetail') > -1) {
                    this.initApiDetail({
                        id: data.id
                    })
                }
            }
        },
        //更新tab页pageId 当前tab页打开页面、返回页面使用
        changeTabPageId(type, id, pageId) {
            let targetIndex = this.apiTabList.findIndex(it => it.id === id)
            if(targetIndex < 0) return
            let targetTab = this.apiTabList[targetIndex]
            if(type === 'edit') {   // 设置tab信息 用户tab切换
                this.apiTabList[targetIndex].pageId = pageId
            } else if(type === 'reset') {   // 重置tab信息
                this.apiTabList[targetIndex] = {
                    id: targetTab.id,
                    name: targetTab.name,
                    path: targetTab.path
                }
            }
        },
        setGoPath (path) {
            this.goPath = path
        },
        // 更新api详情页markdown源码
        updateApiMarkDownCode(code){
            this.apiMarkDownCode = code
        },
        // 因为api列表的总数只有在pageNum为1时才返回，所以新增或删除需手动+1、-1
        setApiDataTotal (type) {
            if (type === 'add') {
                this.apiDataTotal++
            } else if (type === 'minus') {
                this.apiDataTotal--
            }
        },
        // 初始化接口列表
        initApiList (type, groupIds = null) {
            this.apiSearchValue = this.relationNodeName ? this.relationNodeName : this.apiSearchValue
            const params = {
                search: this.apiSearchValue,
                pageSize: 12,
                pageNum: this.apiPageNumber,
                groupIds
            }
            // 新增/删除/编辑API后 查询列表 新增queryType参数 => 解决接口延迟问题
            if(type === 'update' || type === 'edit') {
                params.queryType = 1
            }
            getApiList(params).then(res => {
                if (res.code == 1) {
                    this.resetRelationName()
                    this.indexTableData = res.data.records
                    this.apiDataTotal  = (res.data?.total && Number(res.data?.total)) || this.apiDataTotal
                } else {
                    message.error(res.message)
                }
            })
        },
        // 初始化详情页
        initApiDetail (params) {
            getApiDetail(params).then(res => {
                if (res.code == 0) {
                    this.updateApiMarkDownCode('')
                    message.error(res.message)
                } else {
                    this.updateApiMarkDownCode(res)
                }
            })
        },
        // 初始化授权管理
        initAuthList (apiId) {
            const params = {
                apiId
            }
            getApiAuthList(params).then(res => {
                if (res.code == 1) {
                    this.authManageList = res.data || []
                } else {
                    // message.error(res.message)
                }
            })
        },
        setTmplGroupId (id) {
            this.tmplGroupId = id
        },
        initTemplateList (searchKw = '') {
            this.resetTempWrapperScroll = true
            this.tmpListLoading = true
            this.tmpListLoadEnd = false
            this.templatePageNumber = 1
            this.templateList = []
            this.tmpGroupLoadEnd = false
            this.tmpGroupPageNum = 1
            this.tmplGroupList = []
            if(this.tmplGroupId || searchKw) {  // 查询分组下的模板数据
                this.getTmpGroupList(searchKw)
                // this.getTempList(searchKw)
            } else {    // 查询模板分组数据
                this.getTmpGroupList()
            }
        },
        // 获取模板分组数据
        getTmpGroupList(searchKw) {
            if(this.tmpGroupLoadEnd) return
            // 首页页码>1
            if(this.tmpGroupPageNum > 1) {
                this.tmpPageLoading = true
            }
            getTmplGroup({
                pageNum: this.tmpGroupPageNum,
                pageSize: 20,
                queryType: 1, // 解决接口延迟问题
            }).then(res => {
                if (res.code === 1) {
                    let result = res.data
                    this.tmplGroupList = this.tmplGroupList.concat(result.records)
                    this.tmpGroupLoadEnd = result.total <= result.size * result.current
                    // 分组数据只有一页 手动加载模板列表数据
                    if(searchKw || (this.tmpGroupLoadEnd && this.tmpGroupPageNum === 1)) {
                        this.getTempList(searchKw)
                    }
                } else {
                    message.error(res.message)
                }
                this.tmpListLoading = false
                this.tmpPageLoading = false
            })
        },
        // 获取模板列表数据
        getTempList(searchKw = '') {
            if(this.tmpListLoadEnd) {
                this.tmpPageLoading = false
                return 
            }
            // 首页 or 分组页页码>1
            if(!this.tmplGroupId || (this.tmplGroupId && this.templatePageNumber>1)) {
                this.tmpPageLoading = true
            }
            const params = {
                templateName: searchKw,
                // pageSize: this.tmplGroupId ? 12 : 20,
                pageSize: 20,
                pageNum: this.templatePageNumber,
                groupId: this.tmplGroupId,
                queryType: 1,   // // 解决接口延迟问题
            }
            getTemplateList(params).then(res => {
                if (res.code == 1) {
                    let result = res.data
                    if (result.records.length) {
                        result.records.forEach(item => {
                            item.value = item.id
                            item.label = item.templateName
                        })
                    }
                    this.templateList = this.templateList.concat(result.records)
                    this.tmpListLoadEnd = result.total <= result.size * result.current
                } else {
                    message.error(res.message)
                }
                this.tmpListLoading = false
                this.tmpPageLoading = false
            })
        },
        setTempGroupName(id, name) {
            let target = this.tmplGroupList.find(it => it.id === id)
            if(target) {
                target.groupName = name
            }
        },
        setTempName(id, name) {
            let target = this.templateList.find(it => it.id === id)
            if(target) {
                target.groupName = name
            }
        },
        setAuthPageNumber (num) {
            this.authPageNumber = num
        },
        setApiPageNumber (num) {
            this.apiPageNumber = num
        },
        setTemplatePageNumber (num) {
            this.templatePageNumber = num
        },
        setTmpGroupPageNum(num) {
            this.tmpGroupPageNum = num
        },
        setResetTempWrapperScroll(v) {
            this.resetTempWrapperScroll = v
        },
        setRolePageNumber (num) {
            this.rolePageNumber = num
        },
        // 初始化权限控制列表
        initAuthorityList () {
            this.authLoading = true
            const params = {
                pageNum: this.authPageNumber,
                pageSize: 12,
                search: this.authSearchValue,
                statuses: this.authStatuses.filter(i => i.isSelect).map(item => item.value).join(',')
            }
            getAuthorityList(params).then(res => {
                if (res.code == 1) {
                    this.authorityList = res.data?.records || []
                    this.authDataTotal = Number(res.data?.total || 0) || this.authDataTotal
                } else {
                    // message.error(res.message)
                }
                this.authLoading = false
            })
        },
        initRoleList () {
            const params = {
                pageNum: this.rolePageNumber,
                pageSize: 12,
            }
            getRoleList(params).then(res => {
                if (res.code == 1) {
                    res.data.records.forEach(item => {
                        item.value = item.id
                        item.label = item.name
                    })
                    this.roleList = res.data.records
                    this.roleDateTotal = Number(res.data?.total || 0) || this.roleDateTotal
                } else {
                    // message.error(res.message)
                }
            })
        },
        setApiHistoryPageNumber (num) {
            this.apiHistoryPageNumber = num
        },
        // 初始化api历史记录列表
        initApiHistoryList () {
            const params = {
                pageNum: this.apiHistoryPageNumber,
                pageSize: 12
            }
            getApiHistory(params).then(res => {
                // console.log(res);
                if (res.code == 1) {
                    this.apiHistoryList = res.data.apilist
                    this.apiHistoryDataTotal = res.data.pagecount ? Number(res.data.pagecount) : this.apiHistoryDataTotal
                }
            })
        },
        // 初始化推送管理列表
        initCollectionList (type) {
            const params = {
                pageNum: this.collectionPageNumber,
                pageSize: 12
            }
            // 新增/删除推送集合后 新增queryType参数 => 解决接口延迟问题
            if(type === 'update') {
                params.queryType = 1
            }
            getCollectionList(params).then(res => {
                if (res.code == 1) {
                    this.collectionList = res.data.records
                    this.collectionDataTotal = Number(res.data.total) || this.collectionDataTotal
                } else {
                    // message.error(res.message)
                }
            })
        },
        setCollectionPageNumber (num) {
            this.collectionPageNumber = num
        },
        // 获取推送平台
        getPushPlatform () {
            getPushPlatform().then(res => {
                if (res.code == 1) {
                    this.pushPlatform = res.data || []
                }
            })
        },
        async getPushMethods () {
            return new Promise((resolve, reject) => {
                getPushMethod().then(res => {
                    if (res.code == 1) {
                        this.pushMehtodList = res.data || []
                        resolve(res)
                    }
                })
            })
        },
        // 初始化推送主题列表
        initPushTopicList (params, type) {
            this.pushListLoading = true
            const jsonData = {
                ...params,
                pageNum: this.pushTopicPageNumber,
                pageSize: 12
            }
            if(!params.name){
                this.pushTopicSearchValue = ''
            } else {
                this.pushTopicSearchValue = params.name
            }
            // 新增/删除推送主题后 查询列表 新增queryType参数 => 解决接口延迟问题
            // 改为延迟一秒后查询
            if(type === 'update') {
                // jsonData.queryType = 1
                setTimeout(() => {
                    getPushTopic(jsonData).then(res => {
                        if (res.code == 1) {
                            // console.log(res);
                            this.pushTopicList = res.data.records
                            this.pushTopicTotal = Number(res.data.total) || this.pushTopicTotal
                        }else{
                            this.pushTopicList = []
                            this.pushTopicTotal = 0
                        }
                        this.pushListLoading = false
                    })
                }, 1000)
                return
            }

            getPushTopic(jsonData).then(res => {
                if (res.code == 1) {
                    this.pushTopicList = res.data.records
                    this.pushTopicTotal = Number(res.data.total) || this.pushTopicTotal
                }else{
                    this.pushTopicList = []
                    this.pushTopicTotal = 0
                }
                this.pushListLoading = false
            })
        },
        // 通过主题id初始化推送记录列表
        initPushRecordList (params,isRefresh = false) {
            if(isRefresh){
                this.pushRecordPageNumber = 1
            }
            this.pushRecordLoading = true
            const jsonData = {
                ...params,
                pageNum: this.pushRecordPageNumber,
                pageSize: 12
            }
            getPushRecordList(jsonData).then(res => {
                if (res.code == 1) {
                    this.pushRecordList = res.data.records
                    this.pushRecordTotal = Number(res.data.total)
                    if(isRefresh){
                        message.success(res.message)
                    }
                }
            }).finally(()=>{
                this.pushRecordLoading = false
            })
        },
        resetPushRecordPageNumber() {
            this.pushRecordPageNumber = 1
        },
        resetPushTopicPageNumber() {
            this.pushTopicPageNumber = 1
        },
        setThemeEditData (data) {
            this.themeEditData = data
        },
        setThemeOperFlag (flag) {
            this.themeOperFlag = flag
        },
        resetThemeEditData () {
            this.themeEditData = {}
            this.themeOperFlag = 'add'
        },
        // 更改查询类型
        setTaskSearchType (type) {
            this.taskSearchType = type
        },
        // 更改查询范围
        setTaskHistoryDiff (diff) {
            this.taskHistoryDiff = diff
        },
        // 初始化任务列表
        initTaskList (type) {
            if (type === 'change' && !this.historyTaskList.length) {
                this.taskCenterLoading = true
            }
            if(this.taskPageNumber == 1){
                // 第一页使用缓存的数据
                this.taskList = this.taskSearchType == 0 ? this.currentTaskList :  this.historyTaskList
            }
            const params = {
                pageNum: this.taskPageNumber,
                pageSize: 12,
                change: this.taskSearchType,
                diff: this.taskHistoryDiff,
                search: this.taskCenterSearchKw,
                taskType: this.searchTaskType
            }
            getTaskList(params).then(res => {
                if (res.code == 1) {
                    this.taskList = res.data.records
                    this.taskDataTotal = Number(res.data.total)
                    if(this.taskPageNumber == 1){
                        // 只缓存第一页数据
                        if(this.taskSearchType == 0){
                            //当前任务
                            this.currentTaskList =  res.data.records 
                        }else{
                            //历史任务
                            this.historyTaskList =  res.data.records 
                        }
                    }
              
                    // console.log(this.taskList, this.taskSearchType);
                }
            }).finally(()=>{
                this.taskCenterLoading = false
            })
        },
        initRedDot () {
            getTaskCount().then(res => {
                if (res.code == 1) {
                    this.taskCountObj = res.data
                }
            })  
        },
        // 设置获取任务数的定时器
        setTaskSetInterval () {
            if (this.taskSetInterval) {
                this.clearTaskSetInterval()
            }
            // 进入先请求一次
            getTaskCount().then(res => {
                if (res.code == 1) {
                    this.taskCountObj = res.data
                }
            })
            this.taskSetInterval = setInterval(() => {
                getTaskCount().then(res => {
                    if (res.code == 1) {
                        this.taskCountObj = res.data
                        const { redDot, historyCount, updatingCount, waitingCount } = res.data
                        if (!redDot && historyCount == 0 && updatingCount == 0 && waitingCount == 0) {
                            this.clearTaskSetInterval()
                        }
                    } else {
                        this.clearTaskSetInterval()
                    }
                })
            }, 2000)
        },
        // 清除获取任务数的定时器
        clearTaskSetInterval () {
            clearInterval(this.taskSetInterval)
            this.taskSetInterval = null
        },
        // 设置获取任务列表的定时器
        setTaskListInterval (type) {
            if (this.taskListInterval) {
                this.clearTaskListInterval()
            }
            this.taskListInterval = setInterval(() => {
                let params = {
                }
                if (type === 'current') {
                    params = {
                        pageNum: this.taskPageNumber,
                        pageSize: 12,
                        change: 0,
                    }
                } else if (type === 'history') {
                    params = {
                        pageNum: this.taskPageNumber,
                        pageSize: 12,
                        change: 1,
                        diff: this.taskHistoryDiff
                    }
                }
                getTaskList(params).then(async res => {
                    if (res.code == 1) {
                        this.initTaskList()
                        if (type === 'current') {
                            if (!Number(res.data.total)) {
                                this.clearTaskListInterval()
                            }
                        } else if (type === 'history') {
                            if (this.taskCountObj.historyCount == 0) {
                                this.clearTaskListInterval()
                            }
                        }
                        // 如果处于任务中心 并且 在 查看历史记录，进行消除红点
                        if (this.taskSearchType && location.hash.indexOf('/system/taskCenter') > -1) {
                            await removeHistoryDot()
                            await removeIndexDot()
                        }
                    } else {
                        this.clearTaskListInterval()
                    }
                })
            }, 5000)
        },
        // 清除获取任务列表的定时器
        clearTaskListInterval () {
            clearInterval(this.taskListInterval)
            this.taskListInterval = null
        },
        setPushRecordMethod(info){
            this.pushRecordMethod = info.value
        },
        setPushDataMode(info){
            this.pushDataMode = info.value
        },
        setTaskCenterSearchKw(kw) {
            this.taskCenterSearchKw = kw
        },
        setSearchTaskType(type) {
            this.searchTaskType = type
        },
        setRelationName(name) {
            this.relationNodeName = name
        },
        resetRelationName(){
            this.relationNodeName = ''
        },
        resetPushTopicList(){
            this.pushTopicList = []
        },

    },
})
