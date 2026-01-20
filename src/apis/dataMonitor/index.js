import { BiRequest as request } from '@/utils/http'

// 查看数据监控列表
export const getMonitorList = params => {
  const jsonData = {
    url: '/biapi/monitor/collection/list',
    params
  }
  return request(jsonData)
}

// 添加监控
export const addDataMonitor = data => {
  const jsonData = {
    url: '/biapi/monitor/collection/add',
    method: 'post',
    data
  }
  return request(jsonData)
}

// 修改监控
export const updateDataMonitor = data => {
  const jsonData = {
    url: '/biapi/monitor/collection/update',
    method: 'post',
    data
  }
  return request(jsonData)
}

// 查看监控详情
export const viewMonitorDetail = id => {
  return request({
    url: `/biapi/monitor/collection/detail/${id}`
  })
}

// 删除监控
export const deleteDataMonitor = id => {
  return request({
    url: `/biapi/monitor/collection/delete/${id}`,
    method: 'post'
  })
}

// 切换通知开关
export const updateNotifyStatus = id => {
  return request({
    url: `/biapi/monitor/collection/notifySwitch/${id}`,
    method: 'post'
  })
}

/// 数据表start
// 查看数据表 监控对象列表
export const getTaskTableList = params => {
  const jsonData = {
    url: '/biapi/monitor/task/table/list',
    params
  }
  return request(jsonData)
}

// 查看数据表 概要信息
export const getTaskTableSummary = params => {
  const jsonData = {
    url: '/biapi/monitor/task/table/summary',
    params
  }
  return request(jsonData)
}

// 查看数据表 任务列表
export const getTaskTableTaskList = params => {
  const jsonData = {
    url: '/biapi/monitor/task/table/taskList',
    params
  }
  return request(jsonData)
}

// 查看数据表 时长前10的任务(潜在异常分析)
export const getTaskTableTop10Duration = params => {
  const jsonData = {
    url: '/biapi/monitor/task/table/top10TaskOfDuration',
    params
  }
  return request(jsonData)
}

/// 数据源 start
// 查看数据源 监控对象列表
export const getTaskDatasourceList = params => {
  const jsonData = {
    url: '/biapi/monitor/task/datasource/list',
    params
  }
  return request(jsonData)
}

// 查看数据源 监控对象详情
export const getTaskDatasourceDetail = params => {
  const jsonData = {
    url: '/biapi/monitor/task/datasource/objectDetail',
    params
  }
  return request(jsonData)
}

// 查看数据源 概要信息
export const getTaskDatasourceSummary = params => {
  const jsonData = {
    url: '/biapi/monitor/task/datasource/summary',
    params
  }
  return request(jsonData)
}

/// 推送 start
// 查看推送 监控对象列表
export const getTaskPushList = params => {
  const jsonData = {
    url: '/biapi/monitor/task/push/list',
    params
  }
  return request(jsonData)
}

// 查看推送 监控对象详情
export const getTaskPushDetail = params => {
  const jsonData = {
    url: '/biapi/monitor/task/push/objectDetail',
    params
  }
  return request(jsonData)
}

// 查看推送 概要信息
export const getTaskPushSummary = params => {
  const jsonData = {
    url: '/biapi/monitor/task/push/summary',
    params
  }
  return request(jsonData)
}

// 查看推送 刷新任务
export const getTaskPushRefresh = params => {
  const jsonData = {
    url: '/biapi/monitor/task/push/refreshTask',
    params
  }
  return request(jsonData)
}
