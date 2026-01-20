export const statusMap = {
  normal: 1, 
  completed: 2, // 完成
  updating: 3, // 更新中
  error: 4 // 错误
}

// 自助配置步骤异常判断 判断config中用到的字段 columns中是否都包含
export const selfConfigError = (config, columns) => {
  let action = config.action
  let flag = false

  if(action === 'select') {
    flag = config.contents?.columns?.some(col => 
      !columns.includes(col)
    )
  } else if(action === 'where') {
      flag = config.contents?.some(it => {
          switch(it.leftExpression?.type){
              case 'column':  // 条件
                  return !columns.includes(it.leftExpression?.content)
              case 'expression':  // 公式
                  return it.leftExpression.params.filter(p => p.type === 'column')
                      .some(i => !columns.includes(i.content))
              default:
                  return false
          }
      })
  } else if(action === 'order') {
      flag = config.contents?.some(it => 
          !columns?.includes(it.column)
      )
  } else if(action === 'add') {
      flag = config.contents?.some(it => 
          it.params?.some(param => 
              !columns?.includes(param.content)
          )
      )
  } else if(action === 'group') {
      if(!config.contents.columns) return
      flag = config.contents?.columns.some(col =>    // 分组列
              !columns?.includes(col)
      ) ||
      config.contents?.aggregate.some(it =>   // 统计列
          !columns?.includes(it.column)
      )
  } else if(action === 'setting') {
      // flag = config.contents?.some(it => 
      //     !columns.includes(it.column)
      // )
  } else if(action === 'join') {
      flag = config.contents?.onColumns?.some(it => 
          !columns?.includes(it.originColumn)
      )
  }

  return flag
}

// 血缘异动步骤异常判断 判断config中是否用到errorColumns包含的异常字段
export const bloodAnalysisError = (config, errorColumns) => {
    let action = config.action
    let flag = false
  
    if(action === 'select') {
      flag = config.contents?.columns?.some(col => 
        errorColumns.includes(col)
      )
    } else if(action === 'where') {
        flag = config.contents?.some(it => {
            switch(it.leftExpression?.type){
                case 'column':  // 条件
                    return errorColumns.includes(it.leftExpression?.content)
                case 'expression':  // 公式
                    return it.leftExpression.params.filter(p => p.type === 'column')
                        .some(i => errorColumns.includes(i.content))
                default:
                    return false
            }
        })
    } else if(action === 'order') {
        flag = config.contents?.some(it => 
            errorColumns.includes(it.column)
        )
    } else if(action === 'add') {
        flag = config.contents?.some(it => 
            it.params?.some(param => 
                errorColumns.includes(param.content)
            )
        )
    } else if(action === 'group') {
        if(!config.contents.columns) return
        flag = config.contents?.columns.some(col =>    // 分组列
            errorColumns.includes(col)
        ) ||
        config.contents?.aggregate.some(it =>   // 统计列
            errorColumns.includes(it.column)
        )
    } else if(action === 'setting') {
        flag = config.contents?.some(it => 
            errorColumns.includes(it.column)
        )
    } else if(action === 'join') {
        flag = config.contents?.onColumns?.some(it => 
            errorColumns.includes(it.originColumn)
        )
    }
  
    return flag
  }