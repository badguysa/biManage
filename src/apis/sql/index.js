import { BiRequest as request } from '@/utils/http'
import qs from 'qs'

export function getSqlPreviewData(data) {
    return request({
        url: data.url,
        method: 'post',
        data: qs.stringify(data.data)
    })
}

export const sqlDataImport = (data) => {
    return request({
        url: data.url,
        method: 'post',
        data: qs.stringify(data.data)
    })
}