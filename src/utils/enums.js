// 表类型映射
export const tableTypeMap = {
  0: '空表',
  1: '表单',  //常规表单
  2: 'excel',
  3: 'db',
  4: '自助配置',
  5: 'sql',
  6: '表单',  // 审批表单
  7: 'api',
  8: 'kafka'
}

// 数据源映射
export const dataSourceMap = {
  0: 'MYSQL',
  1: 'STARROCKS',
  2: 'ORACLE',
  3: 'SQLSERVER',
  4: 'POSTGRESQL',
  5: 'API',
  6: 'Kafka'
}

// 数据库映射
export const databaseMap = {
  0: 'MYSQL',
  1: 'SQLSERVER',
  2: 'ORACLE',
  3: 'POSTGRESQL',
  4: 'STARROCKS',
}

// 表状态映射
export const tableStatusMap = {
  0: '空表',
  1: '导入中',
  2: '完成',
  3: '更新中',
  4: '错误',
  5: '已冻结',
  6: '数据源被删除',
}

// 文件导出映射
export const tableExportMap = {
  5: 'excel',
  6: 'api',
  7: 'db',
  8: '表单',
  9: 'sql',
  10: '自助配置',
}

/**
 * 更新策略
 * 1, 2, 5, 7 可以设置更新频率
 */
export const updatePolicyMap = {
  0: 'NONE',  // 不更新
  1: 'FULL_UPDATE', // 全量更新 
  2: 'INCR_UPDATE', // 增量更新
  3: 'REALTIME_UPDATE', // 实时更新
  4: 'API_UPDATE_PUSH', // api增量更新（中台接收推送）
  5: 'API_UPDATE_PULL', // api增量更新（中台定时拉取）
  6: 'CASCADE_UPDATE',  // 级联更新
  7: 'API_INCR_APPEND', // API增量追加，每次更新拉取步长范围数据追加
  8: 'PAUSED',  // 已暂停
}

/**
 * 数据标准校验状态  dataCheckTaskStatus
 * null 代表无任务
 */
export const checkStatusMap = {
  0: '等待导入',
  1: '导入中',
  2: '导入停止',
  3: '导入成功',
  4: '导入失败'
}