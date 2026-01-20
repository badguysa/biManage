import { BiRequest as request } from '@/utils/http'

// 暂停任务
export const stopTask = (params) => {
    const jsonData = {
        url: `/biapi/taskcenter/stop`,
        params
    }
    return request(jsonData)
}

// 取消任务
export const deleteTask = params => {
    const jsonData = {
        url: '/biapi/taskcenter',
        method: 'delete',
        params
    }
    return request(jsonData)
}

// 统计任务数量（更新中,等待,历史任务）
export const getTaskCount = (params) => {
    const jsonData = {
        url: `/biapi/taskuser/count`,
        params
    }
    return request(jsonData)
}

// 获取任务中心当前任务和历史任务列表
export const getTaskList = (params) => {
    const jsonData = {
        url: `/biapi/taskcenter/list`,
        params
    }
    return request(jsonData)
}

// 保存导入状态，在excel导入之前调用
export const savetTaskStatus = (data) => {
    const jsonData = {
        url: `/biapi/taskcenter/save`,
        method: 'post',
        data
    }
    return request(jsonData)
}

// 消除历史记录红点
export const removeHistoryDot = () => {
    const jsonData = {
        url: '/biapi/taskuser/historytask'
    }
    return request(jsonData)
}

// 消除首页红点
export const removeIndexDot = () => {
    const jsonData = {
        url: '/biapi/taskuser/indexreddot'
    }
    return request(jsonData)
}

// 通过objectId获取下载地址
export const getDownloadUrl = (params) => {
    const jsonData = {
        url: `/biapi/file/status`,
        params
    }
    return request(jsonData)
}

// 导出小表
export const exportSmallTable = async (params) => {
    return request({
        url: '/biapi/realtable/exportSmallData',
        method: 'get',
        params: params,
        responseType: 'blob'
    })
}

// 镜像导出
export const exportMirror = async (taskId) => {
    return request({
        url: `/biapi/taskcenter/downloadFromMirror/${taskId}`,
        method: 'get',
        responseType: 'blob'
    })
}

// 查看数据校验异常数据概要列表
export const getCheckErrorData = (params)=> {
    const jsonData = {
        url: `/biapi/standard/check_result/summary`,
        params
    }
    return request(jsonData)
}

//  导出数据校验异常数据概要列表
export const exportCheckErrorData = (params)=>{
    return request({
        url: '/biapi/standard/check_result/exportCheckResult',
        method: 'get',
        params: params,
        responseType: 'blob'
    })
}

// 查看数据校验异常数据详细列表
export const getCheckTaskResultErrorData = (params)=> {
    const jsonData = {
        url: `/biapi/standard/check_result/detail`,
        params
    }
    return request(jsonData)
}

// 导出数据校验异常数据详细列表
export const exportCheckTaskResultErrorData = (params)=> {
    return request({
        url: '/biapi/standard/check_result/exportCheckResultDetail',
        method: 'get',
        params: params,
        responseType: 'blob'
    })
}

// 查看数据校验异常数据详细列表
export const deleteTaskRecord = (id)=> {
    return request({
        url: `/biapi/taskcenter/delete/${id}`,
        method: 'post'
    })
}