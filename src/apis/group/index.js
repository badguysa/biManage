import { BiRequest as request } from '@/utils/http'

export function addGroupApi(data) {
    const jsonData = {
        url: '/biapi/group/add',
        method: 'post',
        data
    }
    return request(jsonData)
}

export function updateGroupApi(data) {
    const jsonData = {
        url: '/biapi/group/update',
        method: 'post',
        data
    }
    return request(jsonData)
}

export function deleteGroupApi(params) {
    const jsonData = {
        url: '/biapi/group/delete',
        method: 'post',
        params
    }
    return request(jsonData)
}

export function getGroupListApi(params) {
    const jsonData = {
        url: '/biapi/group/list',
        params
    }
    return request(jsonData)
}

export function getTableList(params) {
    const jsonData = {
        url: '/biapi/realtable/list',
        params
    }
    return request(jsonData)
}

export function globalSearchList(params) {
    const jsonData = {
        url: '/biapi/realtable/search',
        params
    }
    return request(jsonData)
}

export function getIndexPreviewData (params) {
    const jsonData = {
        url: '/biapi/realtable/preview',
        params
    }
    return request(jsonData)
}

// 表筛选接口
export function filterTableData (data) {
    const jsonData = {
        url: '/biapi/realtable/preview-filter',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 获取表格列 params: {tableId: id}
export function getIndexPreviewColumns (params) {
    const jsonData = {
        url: '/biapi/realtable/columns',
        params
    }
    return request(jsonData)
}

export function getIndexTableDetail (params) {
    const jsonData = {
        url: '/biapi/realtable',
        params
    }
    return request(jsonData)
}

export function addBlankTable (data) {
    const jsonData = {
        url: '/biapi/realtable',
        method: 'post',
        data
    }
    return request(jsonData)
}

export function getRecycle () {
    const jsonData = {
        url: '/biapi/group/getRecycle',
    }
    return request(jsonData)
}

export function getUpdateStatus (tableId) {
    const jsonData = {
        url: `/biapi/updaterecord/last?tableId=${tableId}`
    }
    return request(jsonData)
}

export function clearRecycle () {
    const jsonData = {
        url: '/biapi/realtable/cleanRecycle',
        method: 'post',
    }
    return request(jsonData)
}

export function previewSensitive (data) {
    const jsonData = {
        url: '/biapi/realtable/preview-sensitive',
        method: "POST",
        data
    }
    return request(jsonData)
}

// 更新表排序值
export function updateTableSort (params) {
    const jsonData = {
        url: '/biapi/realtable/update-sort',
        method: "POST",
        params
    }
    return request(jsonData)
}

export function getTableTotalNum (params) {
    const jsonData = {
        url: `/biapi/realtable/totalCount`,
        params
    }
    return request(jsonData)
}

export function updateMenuSort(params){
    const jsonData = {
        url: '/biapi/group/update-sort',
        method: "POST",
        params
    }
    return request(jsonData)
}