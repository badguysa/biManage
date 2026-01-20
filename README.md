# 数据中台

## 技术栈

+ vue3
+ pinia
+ ant-design-vue
+ vue-i18n

## script

安装依赖：``npm install``

运行：``npm run dev``

打包：``npm run build``

## dependencies

| 依赖名称                                                                       | 依赖说明     |
| :----------------------------------------------------------------------------- | ------------ |
| [svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader#configuration) | svg图标封装  |
| [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import#install)  | 自动导入插件 |

## 目录结构

```
├─src  -- 源代码
	├─apis  -- 接口调用
	├─assets  -- 图片资源
	├─components  -- 通用组件
	├─constants  -- 常量
	├─hooks  -- 通用逻辑封装
	├─locale  -- 国际化
	├─plugins	-- 插件
	├─router  -- 路由
	├─Stores  -- 状态管
	├─ui  -- UI组件
	├─utils  -- 工具函数
	├─views  -- 前端页面
		├─dataCenter  -- 数据中心
    		├─centerLayout
    			├─mainArea
    				├─bloodRelation  -- 血缘分析
    				├─dataDictionary  -- 数据字典
    				├─db  -- db导入
    				├─editTableInfo  -- 非自主配置表编辑组件
    					├─desensitizationModal  -- 字段脱敏弹窗
    				├─form  -- 表单导入
    				├─kafka  -- kafka导入
    				├─recycleBin  -- 回收站
    				├─selfconfig  -- 自助配置
    					├─add_column  -- 新增列
    					├─code_set  -- 字段设置
    					├─deweight  -- 删除重复行
    					├─field_desensitize  -- 字段脱敏
    					├─group_summary  -- 分组汇总
    					├─head_add  -- 头部组件
    					├─merge_tables  -- 多表合并
    					├─progress_left  -- 左侧进度组件
    					├─table_code  -- 字段设置
    					├─table_sort  -- 排序
    				├─sql  -- sql导入
    				├─table  -- 数据中心表预览
    				├─updateRecord  -- 更新记录
    			├─modals  -- 弹窗组件
    			├─tableTree  -- 中间主要区域
    		├─leftLayout  -- 左侧菜单区域
    	├─homePage  -- 数据看板
    		├─apiMonitor  -- 接口监控
    		├─cloudStorage  -- 接口监控
    		├─dataOverview  -- 概览
    		├─datavVsualization  -- 数据可视化
    	├─login  -- 登录页
    	├─systemManagement  -- 系统管理
    ├─workers  -- webworker
```

## 线上地址

https://appswh.chaoxing.com/bi/index.html

## 本地开发

1. 更改host文件或使用charles代理 ``127.0.0.1``到 ``chaoxing``域名下
   > 127.0.0.1 test.chaoxing.com
2. 将线上cookie中的BI_TOKEN字段复制到开发环境中
3. 代理服务到后端本地开发，手动切换vue.config文件proxy选项
4. 接口文档（测试环境）：https://appswh.chaoxing.com/biapi/doc.html
