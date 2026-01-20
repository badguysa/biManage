import { BiRequest as request } from '@/utils/http'

export function getFormListInFid (params) {
    const jsonData = {
        url: `/biapi/form/getFormListInFid/${params.formType}`,
        params
    }
    return request(jsonData)
}

export function getTableData (params) {
    const jsonData = {
        url: '/biapi/form/getFormPreviewDatas',
        method: 'post',
        params
    }
    return request(jsonData)
}

export function importForm (params) {
    const jsonData = {
        url: '/biapi/form/add',
        method: 'post',
        params
    }
    return request(jsonData)
}

export function importCrossForm (data) {
    const jsonData = {
        url: '/biapi/form/crossUnitAdd',
        method: 'post',
        data
    }
    return request(jsonData)
}

export function getCrossFormList (data) {
    const jsonData = {
        url: '/biapi/form/getFormList',
        method: 'post',
        data
    }
    return request(jsonData)
}