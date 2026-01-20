import { BiRequest as request } from "@/utils/http";

//新增自定义函数
export const addCustomFunc = (data) => {
  const jsonData = {
    url: "/biapi/customFunction/add",
    method: "post",
    data,
  };
  return request(jsonData);
};

//修改自定义函数
export const updateCustomFunc = (data) => {
  const jsonData = {
    url: "/biapi/customFunction/update",
    method: "post",
    data,
  };
  return request(jsonData);
};

//搜索自定义函数

export const getCustomFuncList = (params) => {
  const jsonData = {
    url: "/biapi/customFunction/list",
    method: "get",
    params,
  };
  return request(jsonData);
};

//获取自定义函数详情

export const getCustomFuncDeatil = (id) => {
  const jsonData = {
    url: "/biapi/customFunction/" + id,
    method: "get",
  };
  return request(jsonData);
};

// 删除自定义函数
export const deleteCustomFuncDeatil = (params) => {
  const jsonData = {
    url: "/biapi/customFunction/delete",
    method: "post",
    params
  };
  return request(jsonData);
};