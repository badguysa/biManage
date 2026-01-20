import axios from 'axios'
import router from '@/router';
import { message } from 'ant-design-vue';

const TIMEOUT = 30000

// 中台服务
const BiRequest = axios.create({
  timeout: TIMEOUT,
  withCredentials: true
})

// 云盘服务
const CloudRequest = axios.create({
  baseURL: `${window.location.protocol}//pan-yz.chaoxing.com`,
  timeout: TIMEOUT,
  withCredentials: false
})


// 请求拦截器
BiRequest.interceptors.request.use(config => {
  // console.log('config', config.method, config.url)
  // config.headers['token'] = localStorage.getItem('token')
  config.headers['Accept-Language'] = localStorage.getItem('biLocale') || navigator.language || 'zh-CN'
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截器
BiRequest.interceptors.response.use(res => {
  let statusCode = res.data.code
  switch(statusCode) {
    case 401:
      // token失效 移除过期token
      localStorage.removeItem('TWO_FACTOR_LOGIN')
      localStorage.removeItem('hasToken')
      // 非登录页刷新当前页面
      if(router.currentRoute.value.name !== 'login') {
        router.push('/login')
      }
      // message.error(res.data.message)
      break
    case 502:
      message.error('服务异常')
    break
    default:
      break
  }
  return res.data
}, err => {
  // 超时处理
  if(err.code === 'ECONNABORTED') {
    message.error('操作失败，服务器响应时间过长，请检查网络状态。')
  }
  return Promise.reject(err)
})

export {
  BiRequest,
  CloudRequest
}