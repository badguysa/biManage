import { BiRequest as request } from '@/utils/http'

export const getToken = (params, headers) => {
    const jsonData = {
        url: '/biapi/auth/getAuthority',
        headers: headers,
        params
    }
    return request(jsonData)
}

// 退出登录
export const clearCookie = () => {
    const jsonData = {
        url: '/biapi/auth/logout',
        method: 'get'
    }
    return request(jsonData)
}

// 请求更新记录数据
export const getUpdateRecordData = (params) => {
    const jsonData = {
        url: '/biapi/updaterecord/list',
        params
    }
    return request(jsonData)
}
// 请求更新记录数据源数据总数
export const getSourceDataNum = (params) => {
    const jsonData = {
        url: '/biapi/realtable/source-data-num',
        params
    }
    return request(jsonData)
}

// 查询是否有关联表
export const getMapperList = params => {
    const jsonData = {
        url: '/biapi/apiRealTable/getMapperList',
        params
    }
    return request(jsonData)
}

export const updateNow = params => {
    const jsonData = {
        url: '/biapi/realtable/updateNow',
        params
    }
    return request(jsonData)
}

export const getSystemConfig = () => {
    const jsonData = {
        url: '/biapi/system/config',
    }
    return request(jsonData)
}

// 重启任务
export const restartTask = (params) => {
    const jsonData = {
        url: '/biapi/task/restart',
        params
    }
    return request(jsonData)
}


// 获取镜像单位信息
export const getMirrorInfo = () => {
    const jsonData = {
        url: '/biapi/system/config/base',
    }
    return request(jsonData)
}

// 获取镜像获取重定向接口
export const getCloudDiskRedirectUrl = () => {
    const jsonData = {
        url: '/biapi/system/config/cloudDiskRedirectUrl',
    }
    return request(jsonData)
}
// excel导出
export const exportDataAPI = (params) => {
    const jsonData = {
        url: '/biapi/realtable/exportData',
        params: params,
        responseType: 'blob'
    }
    return request(jsonData)
}


// 导出一级分组
export const exportFatherApi = (params) => {
    const jsonData = {
        url: `/biapi/standardLib/export`,
        responseType: 'blob',
        params
    }
    return request(jsonData)
}

// 上传文件
export const uploadFile = (data, uploadProgressFn, signal) => {
    const jsonData = {
        url: '/biapi/file/upload',
        method: 'post',
        onUploadProgress: uploadProgressFn,
        data,
        signal
      }
      return request(jsonData)
}

// 获取上传token
export const getUploadTokenAPI = () => {
    const jsonData = {
        url: '/biapi/system/config/getUploadConfig',
        method: 'get'
    }
    return request(jsonData)
}

// 获取预览字段
export const getPreviewColumns = (params) => {
    const jsonData = {
        url: '/biapi/realtable/columnPreview',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 根据ids查表格数据
export const getTableByIds = (params) => {
    const jsonData = {
        url: '/biapi/realtable/listByIds',
        method: 'get',
        params
    }
    return request(jsonData)
}