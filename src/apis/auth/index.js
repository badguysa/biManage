import { BiRequest as request } from '@/utils/http'

// 获取短信验证码
export const getSmsCode = params => {
  const jsonData = {
      url: '/biapi/auth/getSmsCode',
      method: 'get',
      params
  }
  return request(jsonData)
}

// 校验短信验证码
export const checkSmsCode = params => {
    const jsonData = {
        url: '/biapi/auth/checkSmsCode',
        method: 'post',
        params
    }
    return request(jsonData)
}

// 获取用户信息
export const getUserInfoApi = () => {
    const jsonData = {
        url: '/biapi/auth/getUserInfo',
        method: 'get'
    }
    return request(jsonData)
}

// 获取图片验证码
export const getImgVerifyCode = () => {
    const jsonData = {
        url: '/biapi/auth/getCheckCode',
        method: 'get',
        responseType: 'blob'
    }
    return request(jsonData)
}
