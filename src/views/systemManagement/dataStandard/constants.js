// 各标准表校验异常率表头
export const abnormalRateColumns = [
  {
    title: '标准表名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '校验表数量',
    dataIndex: 'checkTable',
    key: 'checkTable'
  },
  {
    title: '校验数据量',
    dataIndex: 'dataNum',
    key: 'dataNum'
  },
  {
    title: '异常数据量',
    key: 'abnormalNum',
    dataIndex: 'abnormalNum'
  },
  {
    title: '异常字段数量',
    key: 'abnormalColumnNum',
    dataIndex: 'abnormalColumnNum'
  },
  {
    title: '异常数据率',
    key: 'abnormalRate',
    dataIndex: 'abnormalRate'
  },
  {
    title: '操作',
    key: 'operate'
  }
]

// 异常详情表头
export const abnormalDetailColumns = [
  {
    title: '数据表名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '校验表数量',
    dataIndex: 'checkTable',
    key: 'checkTable'
  },
  {
    title: '校验数据量',
    dataIndex: 'dataNum',
    key: 'dataNum'
  },
  {
    title: '异常数据量 ',
    key: 'abnormalNum',
    dataIndex: 'abnormalNum'
  },
  {
    title: '异常数据率',
    key: 'abnormalRate',
    dataIndex: 'abnormalRate'
  }
]
