import { BiRequest as request } from '@/utils/http'

// 资源监控start
// 资源监控最新数据
export const getLogBoardTask = (params) => {
    const jsonData = {
        url: '/biapi/log/resource/metrics',
        params
    }
    return request(jsonData)
}

// 资源监控结点列表
export const getNodeList = () => {
    const jsonData = {
        url: '/biapi/log/resource/nodes',
    }
    return request(jsonData)
}

// 资源监控结点线和列表
export const getLineAndListNodeData = (params)=>{
    const jsonData = {
        url: '/biapi/log/resource/cpuLoadTrend',
        params
    }
    return request(jsonData)
}
// 资源监控end

// 审计日志start
// 用户操作列表
export const getUserOperationList = (params)=>{
    const jsonData = {
        url: '/biapi/log/operation/list',
        params
    }
    return request(jsonData)
}
// 详细参数
export const getOperationDetailList = (id, params)=>{
    const jsonData = {
        url: `/biapi/log/operation/detailList/${id}`,
        params
    }
    return request(jsonData)
}
// 用户操作导出
export const userOperationExport = ()=>{
    const jsonData = {
        url: '/biapi/log/operation/export',
        responseType: 'blob',
    }
    return request(jsonData)
}
// 系统访问列表
export const getSystemAccessList = (params)=>{
    const jsonData = {
        url: '/biapi/log/login/list',
        params
    }
    return request(jsonData)
}

// 系统访问导出
export const systemAccessExport = ()=>{
    const jsonData = {
        url: '/biapi/log/login/export',
        responseType: 'blob'
    }
    return request(jsonData)
}
// 审计日志end

//运维日志start
export const operationLogsExport = (params)=>{
    const jsonData = {
        url: '/biapi/log/infra',
        responseType: 'blob',
        params
    }
    return request(jsonData)
}

//运维日志end
