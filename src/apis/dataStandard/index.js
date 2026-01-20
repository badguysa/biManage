import { BiRequest as request } from '@/utils/http'

/**
 * 新增分组
 * groupType: 
 *  0 数据标准
 *  1 数据集市
 *  2 API分组
 * @param {*} params 
 * @returns 
 */
export const getStandardLibList = (params) => {
    const jsonData = {
        url: '/biapi/standardLib/list',
        params
    }
    return request(jsonData)
}

// 标准库添加
export function addStandardLibApi(data) {
    const jsonData = {
        url: '/biapi/standardLib/add',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 标准库修改
export function updateStandardLibApi(data) {
    const jsonData = {
        url: '/biapi/standardLib/update',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 标准库删除
export function deleteStandardLibApi(params) {
    const jsonData = {
        url: '/biapi/standardLib/delete',
        method: 'post',
        params
    }
    return request(jsonData)
}

// 数据标准列表
export function getStandardTableList(params){
    const jsonData = {
        url: '/biapi/standard/table/list',
        params
    }
    return request(jsonData)
}

// 数据标准应用数据表
export function standardApplyTableList(params){
    const jsonData = {
        url: `/biapi/standard/table/dataTableList`,
        params
    }
    return request(jsonData)
}

// 数据标准表添加
export function standardTableAdd(data){
    const jsonData = {
        url: '/biapi/standard/table/add',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 数据标准表详情
export function standardTableDetail(id, isDownload = 0){
    const jsonData = {
        url: `/biapi/standard/table/detail/${id}/${isDownload}`
    }
    return request(jsonData)
}

// 数据标准表编辑
export function standardTableEdit(data){
    const jsonData = {
        url: '/biapi/standard/table/update',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 数据标准表删除
export function standardTableDelete(id){
    const jsonData = {
        url: `/biapi/standard/table/delete/${id}`,
        method: 'post',
    }
    return request(jsonData)
}

// 数据标准表下载
export function standardTableDownload(id){
    const jsonData = {
        url: `/biapi/standard/table/download/${id}`,
        responseType: 'blob'
    }
    return request(jsonData)
}

// 数据标准模板下载
export function standardTemplateDownload(){
    const jsonData = {
        url: '/biapi/standard/template/table/download',
        responseType: 'blob'
    }
    return request(jsonData)
}

// 添加标准的上传
export function standardUpload(params){
    const jsonData = {
        url: '/biapi/standard/template/table/upload',
        method: 'post',
        params: params,
    }
    return request(jsonData)
}

// 获取数据标准配置
export const getStandardConfig = () => {
    const jsonData = {
        url: '/biapi/standardGlobalManage/getGlobalManage',
    }
    return request(jsonData)
}

// 编辑数据标准配置
export const updateStandardConfig = (data) => {
    const jsonData = {
        url: '/biapi/standardGlobalManage/saveOrUpdate',
        method: 'post',
        data
    }
    return request(jsonData)
}

// 获取当前单位所有用户
export const getCurrentUnitUsers = () => {
    const jsonData = {
        url: '/biapi/standardGlobalManage/getCurrentUnitUsers',
    }
    return request(jsonData)
}



// 导入标准表
export const importStandardTable = (params)=>{
    const jsonData = {
        url: '/biapi/standard/import/emptyTable',
        method: 'post',
        params
    }
    return request(jsonData)
}

// 查询标准树形列表
export const getStandardTreeList = (params)=>{
    const jsonData = {
        url: '/biapi/standard/import/emptyTable',
        params
    }
    return request(jsonData)
}
// 以下接口未核对

// 标准记录表
export const standardRecordTableList = (params)=>{
    const jsonData = {
        url: '/biapi/realtable/getHistoryTableStandard',
        params
    }
    return request(jsonData)
}

// 校验导入标准表
export const importCheckStandardTable = (params)=>{
    const jsonData = {
        url: '/biapi/realtable/generateDataCheckTask',
        params
    }
    return request(jsonData)
}

// 增加分组浏览量
export const incrGroupView = (id) => {
    const jsonData = {
      url: `/biapi/standardLib/incrView?id=${id}`,
      method: "get",
    };
    return request(jsonData);
};

// 增加取消数据关联
export const cancelRelat = (data) => {
    const jsonData = {
      url: `/biapi/standard/table/cancel-relation`,
      method: "post",
      data,
      params:data
    };
    return request(jsonData);
};

// 查看数据标准 更改isRead为1 
export const readDataCheck = (params) => {
    const jsonData = {
      url: `/biapi/realtable/readDataCheckTask`,
      method: "get",
      params
    };
    return request(jsonData);
};

// 获取所有报告
export const getAllStandradReport = (params) => {
    const jsonData = {
        url: `/biapi/standard/report/getAllReports`,
        params
    }
    return request(jsonData)
}

// 获取全局维度下的标准库信息
export const getGlobalReportList = (params) => {
    const jsonData = {
        url: `/biapi/standard/report/getGlobalReport`,
        params
    }
    return request(jsonData)
}

// 获取表维度的信息
export const getTablepReortInfo = (params) => {
    const jsonData = {
        url: `/biapi/standard/report/getReport`,
        params
    }
    return request(jsonData)
}

// 标准表下的应用表维度
export const getReportByStandard = (params) => {
    const jsonData = {
        url: `/biapi/standard/report/getReportByStandardId`,
        params
    }
    return request(jsonData)
}

// 标准库下的标准表维度
export const getGroupReportDetail = (params) => {
    const jsonData = {
        url: `/biapi/standard/report/getStandardTableReportByGroupId`,
        params
    }
    return request(jsonData)
}


// 标准字段库列表
export const getStandardFieldList = (params) => {
    const jsonData = {
        url: `/biapi/standard/field/list`,
        params
    }
    return request(jsonData)
}

// 添加标准字段库字段
export const addStandardField = (params) => {
    const jsonData = {
        url: `/biapi/standard/field/add`,
        method: 'post',
        params
    }
    return request(jsonData)
}

// 删除标准字段库字段
export const deleteStandardField = (params) => {
    const jsonData = {
        url: `/biapi/standard/field/delete`,
        method: 'post',
        params
    }
    return request(jsonData)
}

// 修改标准字段库字段
export const updateStandardField = (params) => {
    const jsonData = {
        url: `/biapi/standard/field/update`,
        method: 'post',
        params
    }
    return request(jsonData)
}