import { BiRequest as request } from '@/utils/http'

export const getDbList = (params) => {
    const jsonData = {
        url: `/biapi/realtable/db-table-list`,
        params
    }
     return request(jsonData)
}

export const getDbInfo = (params) => {
    const jsonData = {
        url: `/biapi/dbinfo/list`,
        params
    }
    return request(jsonData)
}
export const getDbSchema = (data, cb) => {
    const jsonData = {
        url: `/biapi/dbinfo/schema`,
        method: 'post',
        data
    }
    return request(jsonData, cb)
   
}
export const getDb = (data, cb) => {
    const jsonData = {
        url: `/biapi//dbinfo/db`,
        method: 'post',
        data
    }
    return request(jsonData, cb)
   
}

export const getDbPreviewData = (params) => {
    const jsonData = {
        url: `/biapi/realtable/db-table-preview`,
        params
    }
    return request(jsonData)
}

// 新版db预览接口 支持筛选
export const getDbPreviewDataV2 = (data) => {
    const jsonData = {
        url: `/biapi/realtable/db-table-preview-v2`,
        method: 'post',
        data
    }
    return request(jsonData)
}

export const dbTableImport = (data) => {
    const jsonData = {
        url: `/biapi/realtable/db-table-import`,
        method: 'post',
        data
    }
    return request(jsonData)
}