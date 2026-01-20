import { BiRequest as request } from '@/utils/http'

// 获取kafka数据源topic
export function getTopicNames(data) {
  const jsonData = {
    url: '/biapi/kafka/meta/topicNames',
    method: 'post',
    data,
  }
  return request(jsonData)
}

// 获取分区列表
export function getTopicPartitions(data) {
  const jsonData = {
    url: '/biapi/kafka/meta/partitions',
    method: 'post',
    data,
  }
  return request(jsonData)
}

// 预览kafka数据源
export function previewKafkaSource(data) {
  const jsonData = {
    url: '/biapi/kafka/import/connectTest',
    method: 'post',
    data,
  }
  return request(jsonData)
}

// kafka导入
export function importKafka(data) {
  const jsonData = {
    url: '/biapi/kafka/import/addToBI',
    method: 'post',
    data,
  }
  return request(jsonData)
}