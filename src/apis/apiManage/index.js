import { BiRequest as request } from '@/utils/http'

// 添加api
const createApi = data => {
    const jsonData = {
        url: '/biapi/apiinfo',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 删除api
const deleteApi = params => {
    const jsonData = {
        url: '/biapi/apiinfo',
        method: 'delete',
        params
    }
    return request(jsonData)
}

// 编辑api
const editApi = data => {
    const jsonData = {
        url: '/biapi/apiinfo',
        method: 'put',
        data
    }
    return request(jsonData)
}

// 切换分组
const moveGroupApi = params => {
    const jsonData = {
        url: '/biapi/apiinfo/moveGroup',
        method: 'post',
        params
    }
    return request(jsonData)
}


// 获取api列表
const getApiList = params => {
    const jsonData = {
        url: '/biapi/apiinfo/list',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 获取api详情数据
const getApiDetail = (params) => {
    const jsonData = {
        url: '/biapi/api/doc',
        params
    }
    return request(jsonData)
}

// 导出api分组下所有api接口文档
const batchAPIDocument = (groupId) => {
    const jsonData = {
        url: `/biapi/apiDoc/exportByGroupId?groupId=${groupId}`
    }
    return request(jsonData)
}

// 添加授权用户
const createAuthUser = data => {
    const jsonData = {
        url: '/biapi/apiAuth/apiUser',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 编辑授权用户
const editAuthUser = data => {
    const jsonData = {
        url: '/biapi/apiAuth/apiUser',
        method: 'put',
        data
    }
    return request(jsonData)
}

// 删除授权用户
const deleteAuthUser = data => {
    const jsonData = {
        url: '/biapi/apiAuth/apiUser',
        method: 'delete',
        data
    }
    return request(jsonData)
}

// 给多个用户授权某个接口
const authManyUser = data => {
    const jsonData = {
        url: '/biapi/apiAuth/bindMapper',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 获取授权用户列表
const getApiAuthList = params => {
    const jsonData = {
        url: '/biapi/apiAuth/list',
        params
    }
    return request(jsonData)
}

// 更改API授权
const changeApiAuth = data => {
    const jsonData = {
        url: '/biapi/apiAuth/apiUser',
        method: 'put',
        data
    }
    return request(jsonData)
}

const getApiHistory = params => {
    const jsonData = {
        url: '/biapi/apihistory/list',
        params
    }
    return request(jsonData)
}

// 是否启用API
const enableApi = (id, params) => {
    const jsonData = {
        url: `/biapi/apiinfo/${id}/enable`,
        params
    }
    return request(jsonData)
}

export {
    createApi,
    deleteApi,
    getApiList,
    editApi,
    moveGroupApi,
    getApiDetail,
    createAuthUser,
    editAuthUser,
    deleteAuthUser,
    authManyUser,
    getApiAuthList,
    changeApiAuth,
    getApiHistory,
    enableApi,
    batchAPIDocument
}