import { BiRequest as request } from '@/utils/http'
import qs from 'qs'

// API导入 第一步 测试连接
const apiConnectTest = (data) => {
    const jsonData = {
        url: '/biapi/apiImport/connectTest',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 判断第二步是否正确
const apiAnalysisResult = (data) => {
    const jsonData = {
        url: '/biapi/apiImport/analysisResult',
        method: 'post',
        data
    }
    return request(jsonData)
}

// api导入设置项添加到BI
const apiImportToBi = (data) => {
    const jsonData = {
        url: '/biapi/apiImport/addToBI',
        method: 'post',
        data
    }
    return request(jsonData)
}

const updateDoc = params => {
    const jsonData = {
        url: '/biapi/apiImport/updateDoc',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 定时拉取文档下载
const downloadPullNote = (params) => {
    const jsonData = {
        url: '/biapi/apiImport/pullDoc',
        method: 'get',
        params
    }
    return request(jsonData)
}

const getEncryptStr = data => {
    const jsonData = {
        url: '/biapi/apiImport/getEncryptStr',
        method: 'post',
        data: qs.stringify(data)
    }
    return request(jsonData)
}

const getDynamicStr = params => {
    const jsonData = {
        url: '/biapi/apiImport/getDynamicStr',
        method: 'get',
        params
    }
    return request(jsonData)
}

// 自定义参数预览
const getCustomParamPreviewRes = data => {
    const jsonData = {
        url: '/biapi/apiImport/getTemplateStr',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 添加解密
const apiDecryptHandle = (data) =>{
    const jsonData = {
        url: '/biapi/apiImport/getTemplateStr',
        method: 'post',
        data
    }
    return request(jsonData)
}

export {
    apiConnectTest,
    apiAnalysisResult,
    apiImportToBi,
    updateDoc,
    downloadPullNote,
    getEncryptStr,
    getDynamicStr,
    getCustomParamPreviewRes,
    apiDecryptHandle
}