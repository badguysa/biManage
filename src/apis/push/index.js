/**
 * 推送管理各个接口
 */
import { BiRequest as request } from '@/utils/http'

// 获取推送平台
export const getPushPlatform = () => {
    const jsonData = {
        url: '/biapi/push/collection/push-platform',
        method: 'get',
    }
    return request(jsonData)
}

// 获取推送集合列表
export const getCollectionList = (params) => {
    const jsonData = {
        url: '/biapi/push/collection/list',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 批量删除推送集合
export const deleteCollection = (params) => {
    const jsonData = {
        url: '/biapi/push/collection',
        method: 'delete',
        params
    }
    return request(jsonData)
}

// 创建-修改推送集合
export const setCollection = data => {
    const jsonData = {
        url: '/biapi/push/collection',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 根据id查具体的集合信息
export const getCollectionById = (params) => {
    const jsonData = {
        url: '/biapi/push/collection',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 推送主题列表
export const getPushTopic = (params) => {
    const jsonData = {
        url: '/biapi/push/topic/list',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 根据id查主题信息
export const getTopicById = (params) => {
    const jsonData = {
        url: '/biapi/push/topic',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 根据ids查主题信息
export const getTopicByIds = (params) => {
    const jsonData = {
        url: '/biapi/push/topic/listByIds',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 创建-修改主题
export const setPushTopic = data => {
    const jsonData = {
        url: '/biapi/push/topic',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 批量删除主题
export const deletePushTopic = (params) => {
    const jsonData = {
        url: '/biapi/push/topic',
        method: 'delete',
        params
    }
    return request(jsonData)
}

// 获取推送方式
export const getPushMethod = (params) => {
    const jsonData = {
        url: '/biapi/push/topic/push-method',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 获取具体推送记录
export const getPushRecord = (params) => {
    const jsonData = {
        url: '/biapi/push/record',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 通过主题id获取推送记录列表
export const getPushRecordList = (params) => {
    const jsonData = {
        url: '/biapi/push/record/list',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 删除具体的推送记录
export const deletePushRecord = (params) => {
    const jsonData = {
        url: '/biapi/push/record',
        method: 'delete',
        params
    }
    return request(jsonData)
}

// 立即推送
export const pushRightNow = params => {
    const jsonData = {
        url: '/biapi/push/topic/push',
        method: 'post',
        params: params
    }
    return request(jsonData)
}

// 切换推送状态
export const changeTopicStatus = params => {
    const jsonData = {
        url: '/biapi/push/topic/switch-status',
        method: 'post',
        params: params
    }
    return request(jsonData)
}

// 切换集合状态
export const changeCollectionStatus = params => {
    const jsonData = {
        url: '/biapi/push/collection/switch-status',
        method: 'post',
        params: params
    }
    return request(jsonData)
}

// 获取集合下的主题数
export const getTopicCount = (params) => {
    const jsonData = {
        url: '/biapi/push/topic/countTopics',
        params
    }
    return request(jsonData)
}

// 批量添加主题
export const batchSaveTopic = (data) => {
    const jsonData = {
        url: '/biapi/push/topic/batchSave',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 取消推送
export const cancelPush = (params) => {
    const jsonData = {
        url: '/biapi/push/topic/cancel-push',
        method: 'post',
        params
    }
    return request(jsonData)
}