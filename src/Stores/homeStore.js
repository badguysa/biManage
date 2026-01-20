import { defineStore } from "pinia";
import { getTop5Data, getTotalCount, getTableTrend, getCollectionInfo, getTopicDataSet, getLastBoardTask,getApiLastBoardTask,getApiAvgRtTop5,getApiFailCntTop5,getApiReqCntTop5DataSet,getApiRunInfo,getInApiInfo,getstandardReportInfo } from '@/apis/board';
import { formatTime } from '@/utils/utils';
import boardImg from '@/assets/icons/board.png';
import monitorImg from '@/assets/icons/monitor.png';
import visibleImg from '@/assets/icons/visible.png'
import cloudFileImg from '@/assets/Iconlibrary/tubiaoku(17).png'
import dataMonitorImg from '@/assets/icons/data-monitor.png'

export default defineStore('homeStore', {
    state: () => ({
        leftMenuList: [{
            id: 'boardId',
            path: '/dataBoard/dataOverview',
            name: 'dataBoard.overview',
            imgSrc: boardImg
        }, 
        {
            id: 'monitorId',
            path: '/dataBoard/apiMonitor',
            name: 'dataBoard.apiMonitor',
            imgSrc: monitorImg
        },
        {
            id: 'visualId',
            path: '/dataBoard/visual',
            name: 'common.visualization',
            imgSrc: visibleImg,
        }
    ],
        tabsList: [{
            id: 'boardId',
            path: '/dataBoard/dataOverview',
            name: 'dataBoard.overview'
        }],
        activeKey: 'boardId',
        tempData: null, // 中间数据
        top5Data: [], // 表新增数据量 TOP 5
        todayData: {}, // 当日数据总量
        tableTrend: [], // 表的折线图
        collectionInfo: [], // 集合的运行情况
        standardInfo: [], // 数据标准的运行情况
        topicDataSet: [], // 主题数据集,
        topPercent: 1,
        lastBoardTask: {},
        lastApiMonitorTask:{},//api监控
        apiMonitorRefreshLoading: false,
        overviewLoading: {
            top5DataLoading: false,
            topicDataSetLoading: false,
            collectionInfoLoading: false
        },
        avgRtTop5Data: [],
        apiFailTop5Data: [],  //接口失败top5
        apiTop5DataSet: [],  //接口数据集
        apiRunInfo: {},  //接口运行监测
        apiInApiInfo: {},
        apiDateValue: null,
        interfaceDetailData: {}
    }),
    actions: {
        hiddenVisual (config) {
            if (config.hiddenDataVisualization  === true) {
                this.leftMenuList = this.leftMenuList.filter(item => item.id !== 'visualId')
            }
            
            // 是否展示云盘菜单
            if (config.useCloudDisk) {
                !this.leftMenuList.find(it => it.id === 'cloudStorage')
                && this.leftMenuList.push({
                    id: 'cloudStorage',
                    path: '/dataBoard/cloudStorage',
                    name: 'common.cloudStorage',
                    imgSrc: cloudFileImg
                })
            }
        },
        setHomeMenu(data) {
            let dataMarketMenu = {
                id: 'dataMarketId',
                path: '/dataBoard/dataMarket',
                name: 'dataMarket.marketTitle',
                imgSrc: dataMonitorImg                
            }
            let dataMarketTab = {
                id: 'dataMarketId',
                path: '/dataBoard/dataMarket',
                name: 'dataMarket.marketTitle'
            }
            // 仅含数据集市游客一个身份 只展示数据集市菜单
            if(data?.roles?.length === 1 && data.roles[0] === '数据集市游客') {
                this.leftMenuList = [dataMarketMenu]
                this.tabsList = [dataMarketTab]
                this.activeKey = 'dataMarketId'
            } 
            // 含有数据集市游客身份 显示数据集市菜单
            else if(data?.roles?.includes('数据集市游客')) {
                this.leftMenuList.push(dataMarketMenu)
            }

        },
        // showaApiMonitor(puid) {
        //     if(!puid) return
        //     // 接口监控暂时对以下puid用户开放
        //     let puidArr = [
        //         84293417, // 何溢
        //         276533843, // 张友
        //         107420866,  // 胡方杰
        //         22329841, // 张雍熙
        //         33549640,  // 黄高华
        //         227258664, // 郭军
        //         124410117,  // 钟晓华
        //     ]
        //     if(puidArr.includes(parseInt(puid))) {
        //         this.leftMenuList.push({
        //             id: 'monitorId',
        //             path: '/dataBoard/apiMonitor',
        //             name: 'dataBoard.apiMonitor',
        //             imgSrc: monitorImg
        //         })
        //     }
        // },
        changeTabsList (tab, type) {
            this.activeKey = tab.id
            const ids = this.tabsList.map(i => i.id)
            if (type === 'add') {
                if (ids.includes(tab.id)) {
                    const index = this.tabsList.findIndex(item => item.id === tab.id)
                    this.tabsList.splice(index, 1)
                    this.tabsList.unshift(tab)
                    return
                }
                this.tabsList.unshift(tab)
            } else if (type === 'delete') {
                this.tabsList = this.tabsList.filter(item => item.id !== tab.id)
            }
        },
        changeActiveKey (key) {
            this.activeKey = key
        },
        changeTempData (data) {
            this.tempData = data
        },
        getTop5Data (data) {
            this.overviewLoading.top5DataLoading = true
            getTop5Data(data).then(res => {
                if (res.code === 1) {
                    this.top5Data = res.data || []
                    if (this.top5Data.length) {
                        this.top5Data.sort((a, b) => b.count - a.count)
                        this.topPercent = this.top5Data[0].count / 0.9
                        this.top5Data.forEach(item => {
                            item.percent = parseInt(item.count / this.topPercent * 100)
                        })
                    }
                }
                this.overviewLoading.top5DataLoading = false
            })
        },
        getTodayData (data) {
            getTotalCount(data).then(res => {
                if (res.code === 1) {
                    this.todayData = res.data || []
                }
            })
        },
        getTableTrendData (data) {
            getTableTrend(data).then(res => {

            })
        },
        getCollectionRunningData (data) {
            this.overviewLoading.collectionInfoLoading = true
            getCollectionInfo(data).then(res => {
                if (res.code === 1) {
                    this.collectionInfo = res.data || []
                }
                this.overviewLoading.collectionInfoLoading = false
            })
        },
        getstandardRunningData () {
            this.overviewLoading.collectionInfoLoading = true
            getstandardReportInfo().then(res => {
                if (res.code === 1) {
                    this.standardInfo = res.data || []
                }
                this.overviewLoading.collectionInfoLoading = false
            })
        },
        getTopicDataSet (data) {
            this.overviewLoading.topicDataSetLoading = true
            getTopicDataSet(data).then(res => {
                if (res.code === 1) {
                    this.topicDataSet = res.data || []
                }
                this.overviewLoading.topicDataSetLoading = false
            })
        },
        changeApiMonitorRefreshLoading (bool) {
            this.apiMonitorRefreshLoading = bool
        },
        getLastBoardTask () {
            getLastBoardTask().then(res => {
                if (res.code === 1) {
                    this.lastBoardTask = res.data || {}
                }
            })
        },
        getBoardData () {
            getLastBoardTask().then(res => {
                if (res.code === 1) {
                    this.lastBoardTask = res.data || {}
                    let dateValue = ''
                    if (this.lastBoardTask.time) {
                        dateValue = Number(this.lastBoardTask.time.substring(0, 10).split('-').join(''))
                    } else {
                        dateValue = Number(formatTime(Date.now()).substring(0, 10).split('-').join(''))
                    }
                    this.getTodayData({
                        dateValue
                    })
                    this.getTop5Data({
                        dateValue
                    })
                    this.getTopicDataSet({
                        dateValue
                    })
                    this.getCollectionRunningData({
                        dateValue
                    })
                    this.getstandardRunningData()
                }
            })
        },
        // 接口耗时top5
        getAvgRtTop5 (data){
            getApiAvgRtTop5(data).then(res => {
                if (res.code === 1) {
                    this.avgRtTop5Data = res.data || []
                }
            })
        },
        // 接口失败top5
        getApiFailCntTop5 (data){
            getApiFailCntTop5(data).then(res => {
                if (res.code === 1) {
                    this.apiFailTop5Data = res.data || []
                }
            })
        },
        // 接口数据集
        getApiTop5DataSet (data){
            getApiReqCntTop5DataSet(data).then(res => {
                if (res.code === 1) {
                    this.apiTop5DataSet = res.data || []
                }
            })
        },
        // 接口运行监测
        getApiRunInfo (data){
            getApiRunInfo(data).then(res => {
                if (res.code === 1) {
                    this.apiRunInfo = res.data || {}
                }
            })
        },
        // 流入接口
        getInApiInfo (data){
            getInApiInfo(data).then(res => {
                if (res.code === 1) {
                    this.apiInApiInfo = res.data || {}
                }
                this.changeApiMonitorRefreshLoading(false)
            })
        },
        changeApiDateValue(data){
            this.apiDateValue = data
        },
        changeInterfaceDetailData(data){
            this.interfaceDetailData = data
        },
        getApiMonitorData () {
            getApiLastBoardTask().then(res => {
                if (res.code === 1) {
                    this.lastApiMonitorTask = res.data || {}
                    let dateValue = ''
                    if (this.lastApiMonitorTask.time) {
                        dateValue = Number(this.lastApiMonitorTask.time.substring(0, 10).split('-').join(''))
                    } else {
                        dateValue = Number(formatTime(Date.now()).substring(0, 10).split('-').join(''))
                    }
                    this.apiDateValue = dateValue
                    this.getAvgRtTop5({
                        dateValue
                    })
                    this.getApiFailCntTop5({
                        dateValue
                    })
                    this.getApiTop5DataSet({
                        dateValue
                    })
                    this.getApiRunInfo({
                        dateValue
                    })
                    this.getInApiInfo({
                        dateValue
                    })
                }
            })
        }
    }
})