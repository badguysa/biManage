import { mainStore } from '@/Stores/mainStore'

// API数据源 参数回显
export function useEchoApiParams(formState, editInfo, pageFormState, authParamList) {
  const useMainStore = mainStore()

  // 基础信息回显
  formState.apiSourceName = editInfo.sourceName
  formState.apiAddress = editInfo.apiUrl
  formState.apiType = editInfo.requestMethod ? 'post' : 'get'


  

  // 参数回显
  // 添加基础参数的选中状态
  const parseNormalParamsData = JSON.parse(editInfo.normalParams).map((item)=> {
    item.isSelect = true
    return item
  })
  useMainStore.setBasciParamList(parseNormalParamsData, 'echo')
  useMainStore.setHeadParamList(JSON.parse(editInfo.headerParams), 'echo')
  // 添加 body参数的选中状态
  const parseBodyParamsData = JSON.parse(editInfo.bodyParams).map((item)=> {
    item.isSelect = true
    return item
  })
  useMainStore.setBodyParamList(parseBodyParamsData, 'echo')


  // 授权参数回显
  if(editInfo.authParams) {
    let authParams = JSON.parse(editInfo.authParams)
    formState.authType = authParams.type

    let obj = authParams.authentication

    if(formState.authType === 'basic auth') {
      formState.username = obj.username
      formState.password = obj.password
    } else if(formState.authType === 'bearer token' && obj.values?.length) {
      let target = authParamList.value.find(it => 
        it.from === obj.values[0].paramType && 
        it.name === obj.values[0].paramName
      )
      if(target) {
        formState.bearUuid = target.uuid
      }
    } 
  } else {
    // 重置授权参数信息
    formState.authType = 'no auth'
    formState.username = ''
    formState.password = ''
    formState.bearUuid = ''
  }


  // 分页参数回显
  let pageParams = JSON.parse(editInfo.pageParams), params = {}

  pageFormState.pageType = pageParams.type

  switch (pageParams.type) {
    case 0: // 普通分页
      params = pageParams.normalParams
      pageFormState.pageNumberName = params.pageNumberName
      pageFormState.pageNumberBegin = params.pageNumberBegin
      pageFormState.pageSizeName = params.pageSizeName
      pageFormState.pageSize = params.pageSize
      break
    case 1: // 偏移分页
      params = pageParams.offsetParams
      pageFormState.fieldName = params.fieldName
      pageFormState.lastValue = params.lastValue
      pageFormState.paramName = params.paramName
      pageFormState.secondFieldName = params.secondFieldName
      pageFormState.secondParamName = params.secondParamName
      pageFormState.lastAuxValue = params.lastAuxValue
      break
    case 2: // 循环分页
      params = pageParams.foreachParams
      pageFormState.leftName = params.leftName
      pageFormState.rightName = params.rightName
      pageFormState.dataFmtType = params.dataFmtType
      pageFormState.beginValue = params.beginValue
      pageFormState.endValue = params.endValue
      pageFormState.stepSize = params.stepSize
      pageFormState.stepUnit = params.stepUnit
      pageFormState.dataFmtCustom = params.dataFmtCustom
      break
  }
}
