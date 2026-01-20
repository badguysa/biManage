import { defineStore } from "pinia";
import { getStandardLibList, getStandardTableList, standardTableDetail } from '@/apis/dataStandard/index.js'
import { message } from 'ant-design-vue';
export const dataStandardStore = defineStore('dataStandardStore', {
  state: () => ({
    leftDataList: [], // 左侧数据标准树
    standardExpendIndex: -1, // 是否由空表导入/数据标准页面点击标准表名称 跳转过来的 -1:否 1:是
    isInitMount: true, // 是否初始化
    leftDataLoading: false, // 数据加载状态
    activeStandardKey: 'TEMPLATE_FIELD', // 激活的标准库的值 默认显示模板字段库
    activeStandardType: 0, // 激活的标准库的类型 0:默认  1:智慧大脑
    groupObject: {}, // outItem 父级数据 inner 子级数据 innerInner 孙级数据
    groupModalStatus: '', // 1.fadd 父级添加同级分组 2.fedit 父级修改分组名称 3.cadd 父级添加子级分组 4.cedit 子级修改分组名称 5.default 从主页点击添加分组 6.fdelete 删除父级分组 7. cdelete 删除子级分组 
    iconPreviewUrl: '', // 图标库选中的icon
    standardTableList: [], // 标准库的表
    tableListLoading: false,  // 列表加载状态
    standardTablePageNumber: 1, // 页码
    standardTableSearchValue: '', // 搜索值
    standardTableTotal: 0, // 列表总数
    standardConfigChange: false, // 标准配置是否修改过
    addOrEditDataStandardStatus: 0, // 系统管理-数据标准新增和编辑 0: 新增 1：编辑
    editDataStandardObj: {}, // 编辑数据标准的对象
    // 数据中心
    dataCenterImportStandardKey: undefined, // 导入标准的key
    dataCenterImportStandardDetail: {}, // 导入标准表的详情
    dataCenterImportStandardStatus: 0, // 数据中心-导入和编辑标准表  0: 新增 1：编辑
    isEditingField: false  // 字段模板库是否为编辑状态
  }),
  actions: {
    async getLeftDataListFn() {
      this.leftDataLoading = true
      let oldData = [...this.leftDataList]
      let fatherExpandIdList = []
      let chlidExpandIdList = []
      let groundsonExpandIdList = []
      for(let item of oldData){
        if(item.isExpanded){
          fatherExpandIdList.push(item.id)
          if(item.subList && item.subList.length > 0){
            for(let chlidItem of item.subList){
              if(chlidItem.isExpanded){
                chlidExpandIdList.push(chlidItem.id)
                if(chlidItem.subList && chlidItem.subList.length > 0){
                  for(let groundsonItem of chlidItem.subList){
                    if(groundsonItem.isExpanded){
                      groundsonExpandIdList.push(groundsonItem.id)
                    }
                  }
                }                
              }
            }
          }          
        }
      }      
      const  res = await getStandardLibList({groupType: 0})
      if(res.code === 1){
        const data = res.data
        data.forEach((item)=>{
          if(fatherExpandIdList.includes(item.id)){
            item.isExpanded = true
          }
          if(item.subList && item.subList.length > 0){
            item.subList.forEach((chlidItem)=>{
              if(chlidExpandIdList.includes(chlidItem.id)){
                chlidItem.isExpanded = true
              }
              if(chlidItem.subList && chlidItem.subList.length > 0){
                chlidItem.subList.forEach((grandsonItem)=>{
                  if(groundsonExpandIdList.includes(grandsonItem.id)){
                    grandsonItem.isExpanded = true
                  }
                })
              }
            })
          }
        })     
        this.setLeftDataList(data)
      }
      this.leftDataLoading = false
    },
    setLeftDataList(data) {
      this.leftDataList = data
    },
    updateActiveStandardKey(id) {
      // 重置搜索内容
      this.setSearchValue('')
      this.activeStandardKey = id
    },
    updateActiveStandardType(val) {
      this.activeStandardType = val
    },
    updateImportStandardKey(id) {
      this.dataCenterImportStandardKey = id
    },
    selectLeftList(obj) {
      this.groupObject = obj
    },
    changeGroupModalStatus(status) {
      this.groupModalStatus = status
    },
    setIconPreviewUrl(url) {
      this.iconPreviewUrl = url
    },
    getStandardTableListFn() {
      this.tableListLoading = true
      // 新逻辑，在有搜索值的情况下，不传libId全局进行搜索
      const jsonData = {
        libId:this.standardTableSearchValue ? '': this.activeStandardKey,
        sw: this.standardTableSearchValue || undefined,
        pageNum: this.standardTablePageNumber,
        pageSize: 12
      }
      getStandardTableList(jsonData).then(res => {
        if (res.code == 1) {
          this.standardTableList = res.data.records
          this.standardTableTotal = Number(res.data.total) || this.standardTableTotal
        } else {
          message.error(res.message)
        }
        this.tableListLoading = false
      })
    },
    setPageNumber(val){
      this.standardTablePageNumber = val
    },
    setSearchValue(val){
      this.standardTableSearchValue = val
    },
    switchStandardConfigChange(flag){
      this.standardConfigChange = flag
    },
    async getImportStandardTable(id){
      return new Promise(async (resolve) => {
        const res = await standardTableDetail(id)
        if(res.code === 1){
          const data = res.data
          this.dataCenterImportStandardDetail = data
        } else {
          this.dataCenterImportStandardDetail = {}
          message.error(res.message)
        }
        resolve()
      })
    },
    setImportStandardStatus(val){
      this.dataCenterImportStandardStatus = val
    },
    setAddOrEditDataStandardStatus(val){
      this.addOrEditDataStandardStatus = val
    },
    setEditDataStandardObj(data){
      this.editDataStandardObj = data
    },
    setStandardExpendIndex(val){
      this.standardExpendIndex = val
    },
    setIsInitMount(bol){
      this.isInitMount = bol
    },
    setEditintFieldTemplate(flag) {
      this.isEditingField = flag
    }
  }
})