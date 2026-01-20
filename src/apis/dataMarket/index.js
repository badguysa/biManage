import { BiRequest as request } from "@/utils/http";

// 获取数据集市资源列表
export const getResourceList = params => {
  const jsonData = {
    url: '/biapi/dmResource/list',
    params
  }
  return request(jsonData)
}

// 新增数据集市
export const addDmResource = (data) => {
  const jsonData = {
    url: "/biapi/dmResource/add",
    method: "post",
    data,
  };
  return request(jsonData);
};

// 更新数据集市
export const updateDmResource = (data) => {
  const jsonData = {
    url: "/biapi/dmResource/update",
    method: "post",
    data,
  };
  return request(jsonData);
};

// 获取数据集市列表
export const getColumns = (params) => {
  const jsonData = {
    url: "/biapi/dmResource/columns/"+params,
    method: "get",
  };
  return request(jsonData);
};

// 获取数据集市预览
export const getPreview = (params) => {
  const jsonData = {
    url: "/biapi/dmResource/preview/"+params,
    method: "get",
  };
  return request(jsonData);
};

// 获取数据资源详情
export const getDetail = (params) => {
  const jsonData = {
    url: "/biapi/dmResource/"+params,
    method: "get",
  };
  return request(jsonData);
};

// 删除数据源
export const removeDetail = (params) => {
  const jsonData = {
    url: "/biapi/dmResource/delete",
    method: "post",
    params
  };
  return request(jsonData);
};

// 获取申请资源地址
export const applySource = (params) => {
  const jsonData = {
    url: "/biapi/dm/approve/redirectApproveUrl",
    method: "get",
    params
  };
  return request(jsonData);
};

// 访客 查看我的申请记录
export const viewApproveRecrod = (params) => {
  const jsonData = {
    url: "/biapi/dm/approve/redirectOwnApproveUrl",
    method: "get",
    params
  };
  return request(jsonData);
};

// 管理员 查看我的审批
export const viewMyApproval = (params) => {
  const jsonData = {
    url: "/biapi/dm/approve/myApproval",
    method: "get",
    params
  };
  return request(jsonData);
};

// 申请资源
export const applyForDataResource = (data) => {
  const jsonData = {
    url: "/biapi/dm/approve/applyForResource",
    method: "post",
    data
  };
  return request(jsonData);
};