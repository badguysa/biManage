import { BiRequest as request } from '@/utils/http'

export const importExcelData = (data) => {
    const jsonData = {
        url: '/biapi/realtable/import-excel',
        method: 'post',
        params: data
    }
    return request(jsonData)
}

export const appendExcelData = (data) => {
    const jsonData = {
        url: '/biapi/realtable/append-excel',
        method: 'post',
        params: data
    }
    return request(jsonData)
}

// 修改表所属小组
export const updateExcelGroup = (params) => {
    return request({
        url: '/biapi/realtable/update-group',
        method: 'post',
        params: params
    })
}


