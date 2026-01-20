export const filterOption = {
  config: [
    // 选表字段配置项
    {
      uuid: 'c775d2f1-1710-449a-b7c0-9c85b6abd80d',
      action: 'select',
      contents: {
        tableId: '1854050088057643010',
        columns: [
          'stu_no',
          'stu_sch',
          'stu_major',
          'stu_name',
          'stu_score',
          'stu_comp',
          'stu_class'
        ]
      }
    },
    // 筛选配置项
    {
      uuid: '0b397dc3-a4fe-43c9-afa1-36ece529a5c3',
      action: 'where',
      contents: [
        {
          leftExpression: { type: 'column', content: 'stu_no', valueType: '' },
          symbol: 'ne',
          rightExpression: { type: 'value', content: 'U202110657', valueType: 'string' },
          logic: 'AND',
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: { type: 'value', content: '', valueType: 'date' },
          betweenEndExpression: { type: 'value', content: '', valueType: 'date' },
          codeType: 'text'
        },
        {
          leftExpression: { type: 'column', content: 'stu_major', valueType: '' },
          symbol: 'ne',
          rightExpression: { type: 'value', content: '工业工程', valueType: 'string' },
          logic: 'AND',
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: { type: 'value', content: '', valueType: 'date' },
          betweenEndExpression: { type: 'value', content: '', valueType: 'date' },
          codeType: 'text',
          nesting: []
        },
        {
          leftExpression: { type: 'column', content: 'stu_comp', valueType: '' },
          symbol: 'eq',
          rightExpression: { type: 'value', content: '10', valueType: 'double' },
          logic: 'AND',
          betweenEndSymbol: 'lte',
          betweenStartSymbol: 'gte',
          betweenStartExpression: { type: 'value', content: '', valueType: 'date' },
          betweenEndExpression: { type: 'value', content: '', valueType: 'date' },
          codeType: 'number'
        }
      ]
    }
  ],
  sql: "SELECT temp1.`stu_no`, temp1.`stu_sch`, temp1.`stu_major`, temp1.`stu_name`, temp1.`stu_score`, temp1.`stu_comp`, temp1.`stu_class` FROM (SELECT temp0.`stu_no`, temp0.`stu_sch`, temp0.`stu_major`, temp0.`stu_name`, temp0.`stu_score`, temp0.`stu_comp`, temp0.`stu_class` FROM t_db_350d52672f6d47cb958febd3463a2644 AS temp0) AS temp1 WHERE `stu_no` <> 'U202110657' AND `stu_major` <> '工业工程' AND `stu_comp` = 10"
}

// 字段信息完整结构
// {
//   id: '1854070293752258561',
//   createBy: '84293417',
//   createTime: '1730879779648',
//   updateBy: '84293417',
//   updateTime: '1730879780320',
//   deleted: 0,
//   version: '1',
//   columnName: 'xxjgdm',
//   columnAlias: '2',
//   columnDesc: null,
//   columnType: 'VARCHAR',
//   columnLength: 36,
//   columnPrecision: null,
//   isPrimaryKey: 0,
//   realTableId: '1854070293710315521',
//   orderNum: 2,
//   fid: 176881,
//   isDisplay: 1,
//   sensitiveConfig: null,
//   encrypted: 0,
//   required: false,
//   dmColumnId: null,
//   virtualPk: false,
//   queryParams: null
// }

export const columnsInfo = [
  {
    columnName: '111',
    columnAlias: '11',
    columnType: 'VARCHAR',
  },
  {
    columnName: '222',
    columnAlias: '22',
    columnType: 'double',
  },
  {
    columnName: '333',
    columnAlias: '33',
    columnType: 'date',
  }
]
