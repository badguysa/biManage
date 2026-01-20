import { defineStore } from 'pinia'

export const modalStore = defineStore('modalStore', {
    state: () => ({
        groupModalVisible: false, // 控制添加和修改以及重名分组的modal框

        groupModalStatus: '', // 1.fadd 父级添加同级分组 2.fedit 父级修改分组名称 3.cadd 父级添加子级分组 4.cedit 子级修改分组名称 5.default 从主页点击添加分组 6.fdelete 删除父级分组 7. cdelete 删除子级分组 

        iconModalVisible: false, // 控制图标库的modal框

        addTableModalVisible: false, // 控制添加空表的modal框

        moveTableModalVisible: false, // 控制表格移动的modal框

        moveItem: {}, // 记录是要移动哪一条数据

        uploadModalVisible: false, // 控制上传模态框显隐

        uploadMiddlePageModalVisible: false, // 控制上传中间页显隐

        mergeModalVisible: false, // 选择要合并的表与字段

        deleteModalVisible: false, // 所有删除modal框

        addColumnModalVisible: false, // 自助配置新增列弹窗

        updateModalVisible: false, // 更新策略modal框

        DBModalVisible: false, // 添加DBmodal框

        kafkaModalVisible: false, // 添加kafka

        saveAsModalVisible: false, // 自助配置另存为

        addFliterModalVisible: false, // 自助配置筛选公式弹窗

        deleteProgressVisible: false, // 删除自助配置步骤

        apiAddModalVisible: false, // api管理添加

        editAuthManageModalVisible: false, // 新增or编辑授权信息

        authManageModalVisible: false, // 授权管理弹窗

        selfUpdateModalVisible: false, // 自助配置的更新的策略

        templateModalVisible: false, // 新增编辑模板内容弹窗

        apiParamsModalVisible: false, // api导入中 编辑与新增参数的弹窗

        apiParamsDelModalVisible: false, // api导入删除参数的弹窗

        apiMergeModalVisible: false, // api多表合并

        apiDelProgressModalVisible: false, // api删除步骤

        apiAddColumnModalVisible: false, // api 添加列

        apiAddFliterModalVisible: false, // api 添加公式

        apiDescModalVisible: false, // api导入更新策略说明弹窗

        downloadDoscModalVisible: false, // 下载数据格式文档

        pushConnectionModalVisible: false, // 新增、编辑推送集合的弹窗

        exitTipModalVisible: false, // 切换退出自助配置页面时的提示页面

        recyclePreviewModalVisible: false, // 回收站的预览数据弹窗

        revertModalVisible: false, // 还原至弹窗

        binDelTableModalVisible: false, // 回收站进行删除表

        setPageSizeModalVisible: false, // 显示行数设置弹窗

        globalSearchModalVisible: false, // 全局搜索框

        childrenDataModalVisible: false, // 概览查看子级数据情况

        tableTrendModalVisible: false, // 表趋势走向

        collectionModalVisible: false, // 集合弹窗
        
        interfaceDetailModalVisible: false, // 接口调用详情

        fileterModalVisible: false, // 筛选弹窗

        regularUpdateModalVisible: false, // 定时更新弹窗

        regularUpdateModalid: false, // 定时更新弹窗对应uuid

        decryptModalVisible: false, //解密弹窗

        addCrossFormModalVisible: false, // 跨表单导入弹窗

        addStandardLibModalVisible: false, // 数据标准的添加和修改弹窗

    }),
    actions: {

        // 分组
        changeGroupModalVisible (status) {
            this.groupModalStatus = status
            this.groupModalVisible = !this.groupModalVisible
        },

        // 图标库
        changeIconModalVisible () {
            this.iconModalVisible = !this.iconModalVisible
        },

        // 添加空表
        changeAddTableModalVisible () {
            this.addTableModalVisible = !this.addTableModalVisible
        },

        // 表格移动
        changeMoveTableModalVisible () {
            this.moveTableModalVisible = !this.moveTableModalVisible
        },

        // 记录是要移动哪一条数据
        moveRecord (record) {
            this.moveItem = record
        },

        // 添加excel
        changeUploadModalVisible () {
            this.uploadModalVisible = !this.uploadModalVisible
        },


        changeUploadMiddlePageModalVisible (){
            this.uploadMiddlePageModalVisible = !this.uploadMiddlePageModalVisible
        },

        changeMergeModalVisible () {
            this.mergeModalVisible = !this.mergeModalVisible
        },

        changeDeleteModalVisible () {
            this.deleteModalVisible = !this.deleteModalVisible
        },

        changeAddColumnModalVisible () {
            this.addColumnModalVisible = !this.addColumnModalVisible
        },

        changeUpdateModalVisible () {
            this.updateModalVisible = !this.updateModalVisible
        },

        changeDBModalVisible() {
            this.DBModalVisible = !this.DBModalVisible
        },

        changeKafkaModalVisible() {
            this.kafkaModalVisible = !this.kafkaModalVisible
        },
        changeSaveAsModalVisible() {
            this.saveAsModalVisible = !this.saveAsModalVisible
        },

        changeAddFliterModalVisible () {
            this.addFliterModalVisible = !this.addFliterModalVisible
        },

        changeDeleteProgressVisible() {
            this.deleteProgressVisible = !this.deleteProgressVisible
        },

        changeApiAddModalVisible() {
            this.apiAddModalVisible = !this.apiAddModalVisible
        },

        changeEditAuthManageModalVisible() {
            this.editAuthManageModalVisible = !this.editAuthManageModalVisible
        },

        changeAuthManageModalVisible() {
            this.authManageModalVisible = !this.authManageModalVisible
        },

        changeSelfUpdateModalVisible() {
            this.selfUpdateModalVisible = !this.selfUpdateModalVisible
        },

        changeTemplateModalVisible() {
            this.templateModalVisible = !this.templateModalVisible
        },

        changeApiParamsModalVisible() {
            this.apiParamsModalVisible = !this.apiParamsModalVisible
        },

        changeApiParamsDelModalVisible() {
            this.apiParamsDelModalVisible = !this.apiParamsDelModalVisible
        },

        changeApiMergeModalVisible() {
            this.apiMergeModalVisible = !this.apiMergeModalVisible
        },

        changeApiDelProgressModalVisible() {
            this.apiDelProgressModalVisible = !this.apiDelProgressModalVisible
        },

        changeApiAddColumnModalVisible() {
            this.apiAddColumnModalVisible = !this.apiAddColumnModalVisible
        },

        changeApiAddFliterModalVisible() {
            this.apiAddFliterModalVisible = !this.apiAddFliterModalVisible
        },

        changeApiDescModalVisible() {
            this.apiDescModalVisible = !this.apiDescModalVisible
        },

        changeDownloadDoscModalVisible() {
            this.downloadDoscModalVisible = !this.downloadDoscModalVisible
        },

        changePushConnectionModalVisible() {
            this.pushConnectionModalVisible = !this.pushConnectionModalVisible
        },

        changeExitTipModalVisible() {
            this.exitTipModalVisible = !this.exitTipModalVisible
        },

        changeRecyclePreviewModalVisible() {
            this.recyclePreviewModalVisible = !this.recyclePreviewModalVisible
        },

        changeRevertModalVisible() {
            this.revertModalVisible = !this.revertModalVisible
        },

        changeBinDelTableModalVisible() {
            this.binDelTableModalVisible = !this.binDelTableModalVisible
        },

        changeSetPageSizeModalVisible() {
            this.setPageSizeModalVisible = !this.setPageSizeModalVisible
        },

        changeGlobalSearchModalVisible() {
            this.globalSearchModalVisible = !this.globalSearchModalVisible
        },

        changeChildrenDataModalVisible() {
            this.childrenDataModalVisible = !this.childrenDataModalVisible
        },

        changeTableTrendModalVisible() {
            this.tableTrendModalVisible = !this.tableTrendModalVisible
        },

        changeCollectionModalVisible() {
            this.collectionModalVisible = !this.collectionModalVisible
        },

        changeInterfaceDetailModalVisible() {
            this.interfaceDetailModalVisible = !this.interfaceDetailModalVisible
        },
        
        changeFilterModalVisivle() {
            this.fileterModalVisible = !this.fileterModalVisible
        },
        
        changeRegularUpdateModalVisible(uuid = '') {
            this.regularUpdateModalVisible = !this.regularUpdateModalVisible
            this.regularUpdateModalid = uuid
        },

        changeDecryptModalVisible() {
            this.decryptModalVisible = !this.decryptModalVisible
        },

        changeAddCrossFormModalVisible() {
            this.addCrossFormModalVisible = !this.addCrossFormModalVisible
        },

        changeAddStandardLibModalVisible() {
            this.addStandardLibModalVisible = !this.addStandardLibModalVisible
        },
    }
})