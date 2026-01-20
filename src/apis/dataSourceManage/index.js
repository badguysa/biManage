import { BiRequest as request } from '@/utils/http'

// 获取数据源列表
export const getDataSourceList = params => {
  const jsonData = {
    url: `/biapi/datasource/list`,
    params,
  }
  return request(jsonData)
}

// 获取数据源信息
export const getSourceInfo = params => {
  const jsonData = {
    method: 'get',
    url: `/biapi/datasource/getSource`,
    params,
  }
  return request(jsonData)
}

// 获取应用数据表
export const getTableList = params => {
  const jsonData = {
    url: `/biapi/datasource/tableList`,
    params,
  }
  return request(jsonData)
}

// 数据源名称判重
export const sourceNameIsDuplicate = params => {
  const jsonData = {
    url: `/biapi/datasource/isDuplicate`,
    params,
  }
  return request(jsonData)
}

// 添加DB数据源
export const addDBSource = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/addDB`,
    data,
  }
  return request(jsonData)
}

// 添加DB数据源
export const addAPISource = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/addApi`,
    data,
  }
  return request(jsonData)
}

// 添加Kafka数据源
export const addKafkaSource = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/addKafka`,
    data,
  }
  return request(jsonData)
}

// 删除数据源
export const deleteDataSource = params => {
  const jsonData = {
    method: 'delete',
    url: `/biapi/datasource/batchDeleteSource`,
    params,
  }
  return request(jsonData)
}

// 测试DB数据源连接
export const testDBConn = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/testDBConn`,
    data,
  }
  return request(jsonData)
}

// 测试Kafka数据源连接
export const testKafkaConn = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/testKafkaConn`,
    data,
  }
  return request(jsonData)
}

// 修改DB数据源
export const editDBSource = data => {
  const jsonData = {
    method: 'put',
    url: `/biapi/datasource/updateDB`,
    data,
  }
  return request(jsonData)
}

// 修改API数据源
export const editAPISource = data => {
  const jsonData = {
    method: 'put',
    url: `/biapi/datasource/updateApi`,
    data,
  }
  return request(jsonData)
}

// 修改Kafka数据源
export const editKafkaSource = data => {
  const jsonData = {
    method: 'put',
    url: `/biapi/datasource/updateKafka`,
    data,
  }
  return request(jsonData)
}

// 更改数据源状态
export const changeSourceStatus = params => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/changeStatus`,
    params,
  }
  return request(jsonData)
}

// DB数据源判重
export const checkDBSource = data => {
  const jsonData = {
    method: 'post',
    url: `/biapi/datasource/checkDB`,
    data,
  }
  return request(jsonData)
}