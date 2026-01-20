import { BiRequest as request } from '@/utils/http'

export const setNotifyConf = (data) => {
  const jsonData = {
      method: 'post',
      url: `/biapi/notify/conf`,
      data
  }
  return request(jsonData)
}

export const getNotifyConf = () => {
  const jsonData = {
      method: 'get',
      url: `/biapi/notify/conf/my-conf`
  }
  return request(jsonData)
}