import { BiRequest as request } from '@/utils/http'

// 新增api授权单位
export const addApiAuth = data => {
  const jsonData = {
    url: '/biapi/system/api/auth/add',
    method: 'post',
    data
  }
  return request(jsonData)
}

// 删除api授权单位
export const deleteApiAuth = params => {
  const jsonData = {
    url: '/biapi/system/api/auth/delete',
    method: 'post',
    params
  }
  return request(jsonData)
}

// 获取api授权单位信息列表
export const getApiAuthList = params => {
  const jsonData = {
    url: '/biapi/system/api/auth/list',
    method: 'get',
    params
  }
  return request(jsonData)
}

// 修改api授权单位
export const editApiAuth = data => {
  const jsonData = {
    url: '/biapi/system/api/auth/update',
    method: 'post',
    data
  }
  return request(jsonData)
}

// 修改api授权单位状态
export const toggleApiStatus = params => {
  const jsonData = {
    url: '/biapi/system/api/auth/switch-status',
    method: 'post',
    params
  }
  return request(jsonData)
}

// 主键查询
export const getAuthById = id => {
  const jsonData = {
    url: `/biapi/system/api/auth/${id}`,
    method: 'get',
    params
  }
  return request(jsonData)
}
