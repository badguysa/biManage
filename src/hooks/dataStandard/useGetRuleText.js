import { symbolTextMap } from '@/utils/config'

const getRuleText = (t, item) => {
    let ruleText
    let symbol
    if(item.imgType === 'CHARACTER'){
        symbol = `textOperationList.${item.type}`
    } else if(item.imgType === 'NUMBER'){
        symbol = `numberOperationList.${item.type}`
    } else if(item.imgType === 'DATE_TIME'){
        symbol = `timeOperationList.${item.type}`
    }
    if(item.type ==='between' || item.type ==='notBetween'){
        ruleText = `${t(symbol)}${item.betweenStartContent}至${item.betweenEndContent}之间`
    } else {
        ruleText =  `${t(symbol)}${item.value}`
    }
    return ruleText
}

// 是否有校验规则
const hasVerifyRule = (info) => {
    // 判断selfConfigWhere字段是否含有有效值
    if(!Array.isArray(info.selfConfigWhere)) return false
    let rule = info.selfConfigWhere[0]
    return Array.isArray(rule?.contents) && rule.contents[0]
}

// 获取校验规则文本
const getRuleTextLoop = (t, info, needSlice = true) => {
    let options = info.selfConfigWhere
    if(!options) return []
    let ruleList = []

    options.forEach(option => {
        _loopFind(option.contents)
    })

    function _loopFind(configs) {
        if(!Array.isArray(configs)) return
        configs.forEach(config => {
            if(!config.symbol) return
            let ruleText = ''
            if(['between', 'notBetween'].includes(config.symbol)) {
                ruleText = `${t(symbolTextMap[config.symbol])}${config.betweenStartExpression.content}至${config.betweenEndExpression.content}`
            } else if(config.symbol === 'exp' || config.symbol === 'regexp') {
                // 公式
                ruleText = config.info
            } else {
                ruleText = `${t(symbolTextMap[config.symbol])}${config.rightExpression.content}`
            }
            ruleList.push({
                text: ruleText,
                logic: config.logic === 'AND' ? '且' : '或',
            })
            config.nesting && _loopFind(config.nesting)
        })
    }

    // 不需要截取
    if(!needSlice) {
        return ruleList.map((r, i, self) => ({
            ...r,
            showLogic: self.length > 1,
            isLast: i === self.length - 1,
        }))
    }

    return ruleList.slice(0, 2).map((r, i, self) => ({
        ...r,
        showLogic: self.length > 1,
        isLast: i === self.length - 1,
        hasMore: ruleList.length > 2
    }))
}


const handleEditDataList = (array)=>{
    if(!Array.isArray(array))   return
    return array.map((item)=>{
        return {
            ...item,
            description: item.description ?? '',
            required: !Boolean(item.required),
        }
    })
}

export { getRuleText, getRuleTextLoop, hasVerifyRule, handleEditDataList }