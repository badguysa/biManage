export const platformMethodMap = {
  0: -1, // 自定义
  1: 1, // 文化云http
  3: 4, // 智慧大脑
  4: 5, // 表单
  5: 6, // 数据库
  6: 0, // http
  7: 2, // kAFKA
}

export const dbConfigMap = {
  dbAddr: 'addr',
  dbPort: 'port',
  dbUserName: 'username',
  dbPassword: 'password',
  dbName: 'dbName',
  dbConnInfo: 'connInfo'
}

export const dbTypeMap = {
  0: 'MYSQL',
  1: 'SQLSERVER',
  2: 'ORACLE',
  3: 'POSTGRESQL',
  4: 'STARROCKS'
}

export const MYSQL_FIELD_TYPE = [
  'tinyint', 'smallint', 'mediumint', 'int', 'bigint', 
  'float', 'double', 'decimal', 'bit', 'date', 
  'time', 'datetime', 'timestamp', 'year', 'char', 
  'varchar', 'tinytext', 'text', 'mediumtext', 'longtext', 
  'enum', 'set', 'binary', 'varbinary', 'blob', 
  'mediumblob', 'longblob', 'geometry', 'point', 'linestring', 
  'polygon', 'multipoint', 'multilinestring', 'multipolygon', 'geometrycollection',
  'json'
]

export const ORACLE_FIELD_TYPE = [
  'char', 'varchar2', 'long', 'number', 'float', 
  'real', 'blob', 'clob', 'date', 'timestamp', 
  'interval year to month', 'interval day to second', 'rowid'
]

export const SQLSERVER_FIELD_TYPE= [
  'bit', 'int', 'smallint', 'tinyint', 'bigint', 
  'decimal', 'numeric', 'money', 'smallmoney', 'float', 
  'real', 'char', 'varchar', 'text', 'nchar', 
  'nvarchar(max)', 'nvarchar', 'ntext', 'binary', 'varbinary(max)', 
  'varbinary', 'image', 'datetime', 'datetime2', 'date', 
  'time', 'smalldatetime', 'timestamp', 'uniqueidentifier', 'int identity',
  'bigint identity'
]

export const timeOption = [{
  value: 2,
  label: 'common.minute'
}, {
  value: 0,
  label: 'common.hour'
}, {
  value: 1,
  label: 'common.day'
}]

export const modeOption = [
{
  value: 0,
  label: 'pushManage.allPush'
},
// {
//     value: 1,
//     label: 'pushManage.pushOneByOne'
// }, 
{
  value: 2,
  label: 'pushManage.incrPush'
}]

export const explainDocMap = {
  // 表单推送说明文档
  5: 'https://sharewh2.xuexi365.com/share/00f0cc26-c1b7-4e1e-bacf-67be79549b7b?t=3',
  // 数据库推送说明文档
  6: 'https://sharewh2.xuexi365.com/share/923b81ee-7273-443e-80a8-c99d8e61b815?t=3'
}

// 暂时写死 军神没空改
export const tooltipInfo = {
  title: '保持目标数据表中数据和中台内完全一致',
  content: `1.开启强一致，填写主键——删除目标库数据，保持和中台内一致\n2.开启强一致，不填主键——删除目标库数据，保持和中台内一致\n3.关闭强一致，填写主键——不修改目标库数据，仅更新中台内推送的数据\n4.关闭强一致，不填主键——不修改目标库数据，中台内推送的数据会无限追加`
}

export const incrPushTipInfo = {
  title: '增量推送注意事项：',
  content: `1.仅更新策略为实时更新、增量更新、全量部分更新的数据表才能设置增量推送\n2.增量推送任务由表数据更新触发，无需设置更新频率\n`
}
