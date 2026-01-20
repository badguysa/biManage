import { getLogBoardTask, getNodeList, getLineAndListNodeData ,getSystemAccessList, getUserOperationList, getOperationDetailList
 } from '@/apis/logManage';
 import { getCollectionById } from '@/apis/push';

export const systemManageStore = defineStore('systemManageStore', {
  state: () => ({
    // TODO: 系统管理菜单页面标识统一使用systemPageId
    systemPageId: 'apiManagePage',  // 页面ID
    pushCollectionInfo: '', // 推送集合信息
    pushRecordId: '', // 推送记录ID
    
    nodeOptions: [], // 结点列表
    chooseMachine: undefined, //选择的结点
    logMonitorRefreshLoading: false, // 日志监控刷新状态
    nodeRAMLists: [], // 节点RAM使用情况
    nodeLoadTrendData: [], // 节点负载列表数据
    logMonitorDateValue: undefined, // 资源监控日期选择值

    logAuditDateValue: null, // 审计日志日期选择值
    descriptionList: [
      {
        value: 0,
        label: 'logManage.logout',
        isSelect: true
      },
      {
        value: 1,
        label: 'logManage.login',
        isSelect: true
      },
    ], //描述列表
    resultList: [
      {
        value: 0,
        label: 'logManage.fail',
        isSelect: true
      },
      {
        value: 1,
        label: 'logManage.success',
        isSelect: true
      },
    ], // 结果列表
    systemAccessList: [], // 系统访问列表
    systemAccessListTotal: 0, // 系统访问列表总数
    systemAccessPageNumber: 1, //系统访问页数
    systemAccessLoading: false, //系统访问状态

    operationDescriptList: [
      {
        value: 0,
        label: '新增',
        isSelect: true
      },
      {
        value: 1,
        label: '修改/编辑',
        isSelect: true
      },
      {
        value: 2,
        label: '删除',
        isSelect: true
      },
      {
        value: 3,
        label: '导出',
        isSelect: true
      }
    ], // 操作描述模块
    userOperationList: [], // 用户功能模块列表
    userOperationListTotal: 0, // 用户操作列表总数
    userOperationPageNumber: 1, //用户操作页数
    userOperationLoading: false, //用户操作状态
  }),
  actions: {
    setSystemPageId(pageId) {
      this.systemPageId = pageId
    },
    setPushCollectionInfo(info) {
      this.pushCollectionInfo = info
    },
    async getCollection(id) {
      let res = await getCollectionById({id})
      this.setPushCollectionInfo(res.data)
    },
    setPushRecordId(id) {
      this.pushRecordId = id
    },
    async getNodeOptions(){
      const  res  = await getNodeList()
      if(res.code === 1){
          res.data.forEach((item)=>{
              let obj = {}
              obj.value = item
              obj.option = item
              this.nodeOptions.push(obj)
          })
          this.chooseMachine =  this.nodeOptions[0].value
      }
    },
    async getLogMonitorData(needGetNodeData = true) {
      if(needGetNodeData) {
        // 先获取结点
        await this.getNodeOptions()
      }
      const params = {
        node: this.chooseMachine,
        date: this.logMonitorDateValue
      }
      const res = await getLogBoardTask(params)
        if (res.code === 1) {
          const data = res.data
          this.nodeRAMLists = []
          const cpuObject = {
            id: 2,
            title: '节点CPU使用率',
            total: data.cpuTotal,
            value: (data.cpuUsage * 100).toFixed(2),
            used: data.cpuUsed,
            unit: data.cpuUnit || 'CORES',
          }
          const diskObject = {
            id: 3,
            title: '节点home/guandata磁盘使用率',
            total: data.diskTotal,
            value:  (data.diskUsage * 100).toFixed(2),
            used:  data.diskUsed,
            unit: data.diskUnit,
          }
          const memoryObject = {
            id: 1,
            title: '节点内存使用率',
            total: data.memoryTotal,
            value:  (data.memoryUsage * 100).toFixed(2),
            used:  data.memoryUsed,
            unit: data.memoryUnit,
          }
          this.nodeRAMLists.push(cpuObject, diskObject, memoryObject);  
          this.nodeRAMLists.sort((a, b) => a.id - b.id);
          this.changeLogMonitorRefreshLoading(false)
        }
    },
    async getTrendData(){
      const params = {
        node: this.chooseMachine,
        date: this.logMonitorDateValue
      }
      const res = await getLineAndListNodeData(params)
      if(res.code === 1){
        const data = res.data
        this.nodeLoadTrendData = data.nodes
      }
    },
    changeLogDateValue(data) {
      this.logMonitorDateValue = data
    },
    changeLogMonitorRefreshLoading(bool) {
      this.logMonitorRefreshLoading = bool
    },
    setLogAuditDateValue(val) {
      this.logAuditDateValue = val
    },
    // 初始化系统访问列表
    initSystemAccessList() {
      this.systemAccessLoading = true
      const params = {
        pageNum: this.systemAccessPageNumber,
        pageSize: 12,
        actions: this.descriptionList.filter(i => i.isSelect).map(item => item.value).join(','),
        statuses: this.resultList.filter(i => i.isSelect).map(item => item.value).join(','),
      }
      getSystemAccessList(params).then(res => {
        if (res.code == 1) {
          this.systemAccessList = res.data?.records || []
          this.systemAccessListTotal = Number(res.data?.total || 0) || this.systemAccessListTotal
        }
        this.systemAccessLoading = false
      })
    },
    // 初始化系统访问列表
    initUserOperationList() {
      this.userOperationLoading = true
      const params = {
        pageNum: this.userOperationPageNumber,
        pageSize: 12,
        start: this.logAuditDateValue ? new Date(this.logAuditDateValue[0]).getTime() : undefined,
        end: this.logAuditDateValue ?  new Date(this.logAuditDateValue[1]).getTime() : undefined,
        opType: this.operationDescriptList.filter(i => i.isSelect).map(item => item.value).join(','),
      }
      getUserOperationList(params).then(res => {
        if (res.code == 1) {
          this.userOperationList = res.data?.records || []
          this.userOperationListTotal = Number(res.data?.total || 0) || this.userOperationListTotal
        }
        this.userOperationLoading = false
      })
    },
    setSystemAccessPageNumber(val){
      this.systemAccessPageNumber = val
    },
    setUserOperationPageNumber(val){
      this.userOperationPageNumber = val
    },
    setChooseMachine(val){
      this.chooseMachine = val
    },
    resetMonitorData(){
      this.nodeOptions = [] // 结点列表
      this.chooseMachine = undefined
      this.logMonitorRefreshLoading = false
      this.nodeRAMLists = []
      this.nodeLoadTrendData = []
      this.logMonitorDateValue = undefined
    },
  }
})