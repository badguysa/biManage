import { BiRequest as request } from '@/utils/http'

// 推送集合运行情况
export const getstandardReportInfo = () => {
    const jsonData = {
        url: '/biapi/dataBoard/standardReport'
    }
    return request(jsonData)
}

// 推送集合运行情况
export const getCollectionInfo = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/collectionInfo',
        params
    }
    return request(jsonData)
}

// 表新增数据量TOP 5
export const getTop5Data = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/tableIncrementTop5',
        params
    }
    return request(jsonData)
} 
// 表新增数据量趋势（近七天）
export const getTableTrend = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/tableIncrementTrend',
        params
    }
    return request(jsonData)
}

// 主题数据集
export const getTopicDataSet = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/topicDataSet',
        params
    }
    return request(jsonData)
}

// 当日数据总量
export const getTotalCount = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/totalCount',
        params
    }
    return request(jsonData)
}

// 推送集合导出
export const exportCollection = (params) => {
    const jsonData = {
        url: '/biapi/dataBoard/ExportPushCollection',
        responseType: 'blob',
        params
    }
    return request(jsonData)
}

// 刷新数据看板
export const refreshDataBoard = () => {
    const jsonData = {
        url: '/biapi/task/brushBoard',
    }
    return request(jsonData)
}
// 刷新Api数据看板
export const refreshApiDataBoard = () => {
    const jsonData = {
        url: '/biapi/task/brushApiBoard',
    }
    return request(jsonData)
}

// 数据看板最新任务
export const getLastBoardTask = () => {
    const jsonData = {
        url: '/biapi/task/lastBoardTask',
    }
    return request(jsonData)
}
// 监控看板最新任务
export const getApiLastBoardTask = () => {
    const jsonData = {
        url: '/biapi//task/lastApiBoardTask',
    }
    return request(jsonData)
}
// 接口top
export const getApiAvgRtTop5 = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/apiAvgRtTop5',
        params
    }
    return request(jsonData)
}
// 接口失败top5
export const getApiFailCntTop5 = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/apiFailCntTop5',
        params
    }
    return request(jsonData)
}
// 接口数据集
export const getApiReqCntTop5DataSet = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/apiReqCntTop5DataSet',
        params
    }
    return request(jsonData)
}
// 接口监测
export const getApiRunInfo = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/apiRunInfo',
        params
    }
    return request(jsonData)
}
// 接口监测
export const getInApiInfo = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/inApiInfo',
        params
    }
    return request(jsonData)
}
// 接口api详情
export const getApiDetail = (params) => {
    const jsonData = {
        url: '/biapi/apiBoard/apiDetail',
        params
    }
    return request(jsonData)
}
export const getTableByApiName = data => {
    const jsonData = {
        url: '/biapi/apiBoard/tableByApiName',
        method: 'post',
        data: data
    }
    return request(jsonData)
}