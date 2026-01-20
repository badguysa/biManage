import { BiRequest as request } from '@/utils/http'

const addManager = data => {
    const jsonData = {
        url: '/biapi/auth/addManager',
        method: 'post',
        data
    }
    return request(jsonData)
}

const deleteManager = data => {
    const jsonData = {
        url: '/biapi/auth/deleteManager',
        method: 'delete',
        data
    }
    return request(jsonData)
}

// 系统角色api start
const getRoleList = params => {
    const jsonData = {
        url: '/biapi/systemRole/list',
        params
    }
    return request(jsonData)
}

// 新增系统角色
const addSystemRole = data => {
    const jsonData = {
        url: '/biapi/systemRole',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 编辑系统角色
const editSystemRole = data => {
    const jsonData = {
        url: '/biapi/systemRole',
        method: 'put',
        data
    }
    return request(jsonData)
}

// 删除系统角色
const deleteSystemRole = data => {
    const jsonData = {
        url: '/biapi/systemRole',
        method: 'delete',
        data
    }
    return request(jsonData)
}

// 获取角色功能权限
const getDataAccess = (params) => {
    const jsonData = {
        url: '/biapi/systemRole/dataAccessList/' + params
    }
    return request(jsonData)
}
// 获取角色数据权限
const getFuncAccess = (params) => {
    const jsonData = {
        url: '/biapi/systemRole/funcAccessList/' + params
    }
    return request(jsonData)
}
// 系统角色api end

// 系统用户api start
const getAuthorityList = (params) => {
    const jsonData = {
        url: '/biapi/systemUser/list',
        params
    }
    return request(jsonData)
}
// 启动、禁用用户权限
const setUserAuth = data => {
    const jsonData = {
        url: '/biapi/systemUser/enable',
        method: 'post',
        data
    }
    return request(jsonData) 
}

// 添加系统用户
const addSystemUser = data => {
    const jsonData = {
        url: '/biapi/systemUser',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 编辑系统用户
const editSystemUser = data => {
    const jsonData = {
        url: '/biapi/systemUser',
        method: 'put',
        data
    }
    return request(jsonData)
}

// 删除系统用户
const deleteSystemUser = data => {
    const jsonData = {
        url: '/biapi/systemUser',
        method: 'delete',
        data
    }
    return request(jsonData)
}

// 重置密码
const resetPassword = data => {
    const jsonData = {
        url: '/biapi/systemUser/resetPwd',
        method: 'post',
        data
    }
    return request(jsonData)
}
// 系统用户api end

// 是否禁止编辑表
const getEditAuth = (params) => {
    const jsonData = {
        url: '/biapi/pageAuth/forbidEditTable/' + params
    }
    return request(jsonData)
}

// 是否禁止查看自助配置
const getCheckAuth = (params) => {
    const jsonData = {
        url: '/biapi/pageAuth/forbidReadSelfConfig/' + params
    }
    return request(jsonData)
}

const getAccessConfig = () => {
    const jsonData = {
        url: '/biapi/pageAuth/func'
    }
    return request(jsonData)
}

const getUserInfo = (params) => {
    const jsonData = {
        url: '/biapi/systemUser/getUserInfo/' + params
    }
    return request(jsonData)
}

// 获取表权限
const getTableAuth = (params) => {
    const jsonData = {
        url: '/biapi/pageAuth/realTable/' + params
    }
    return request(jsonData)
}

export {
    addManager,
    deleteManager,
    getAuthorityList,
    getRoleList,
    setUserAuth,
    addSystemUser,
    editSystemUser,
    deleteSystemUser,
    addSystemRole,
    editSystemRole,
    deleteSystemRole,
    getDataAccess,
    getFuncAccess,
    resetPassword,
    getEditAuth,
    getCheckAuth,
    getAccessConfig,
    getUserInfo,
    getTableAuth
}