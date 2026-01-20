import { CloudRequest } from '@/utils/http'

// 云盘上传文件
export const uploadFile = (data, uploadProgressFn, signal) => {
  const jsonData = {
    url: '/upload',
    method: 'post',
    onUploadProgress: uploadProgressFn,
    data,
    signal
  }
  return CloudRequest(jsonData)
}