import { BiRequest as request } from '@/utils/http'

export const getCodeList = (params) => {
    const jsonData = {
        url: '/biapi/realtable/columns',
        params
    }
    return request(jsonData)
}

export const getPreviewData = (data) => {
    const jsonData = {
        url: '/biapi/realtable/self-config-preview',
        method: 'post',
        data
    }
    return request(jsonData)
}

export const importFlie = (data) => {
    const jsonData = {
        url: '/biapi/realtable/self-config-import',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 编辑自助配置
export const editSelfConfig = (data) => {
    const jsonData = {
        url: '/biapi/realtable/self-config-edit',
        method: 'post',
        data
    }
    return request(jsonData)
}

export const deleteTable = (params) => {
    const jsonData = {
        url: '/biapi/realtable',
        method: 'delete',
        params
    }
    return request(jsonData)
}

export const updateColumns = data => {
    return request({
        url: '/biapi/column/updateColumns',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    })
}

// db同步数据源表结构
export const syncDbColumn = data => {
    return request({
        url: '/biapi/column/syncDbColumn',
        method: 'post',
        data: data
    })
}

export const deleteBinTable = params => {
    const jsonData = {
        url: '/biapi/realtable/deleteFromRecycle',
        method: 'delete',
        params
    }
    return request(jsonData)
}
// 更新字段描述
export const updateColumnsDesc = data => {
    const jsonData = {
        url: '/biapi/column',
        method: 'put',
        data
    }
    return request(jsonData)
}
// 数据字典下载流
export const getDictionaryDoc = (params) => {
    const jsonData = {
        url: '/biapi/realtable/dictionary',
        params
    }
    return request(jsonData)
}