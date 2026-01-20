import { BiRequest as request } from '@/utils/http'

// 获取集合
export const getCollectionList = params => {
  const jsonData = {
    url: '/biapi/topicModel/getCollection',
    params
  }
  return request(jsonData)
}