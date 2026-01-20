import { IsArray, IsObject } from "./utils.js"

const getType = (value) => {
    if (typeof value !== 'number' || typeof value !== 'string') return 'string'
    return typeof value
}
const getNumType = value => {
    let type = 0
    if ((typeof value !== 'number' && typeof value !== 'string') || typeof value === 'string') {
        type = 0
    } else if (typeof value === 'number') {
        type = 1
    }
    return type
}

// api字段解析数组结构
const parseArrayData = (jsonArray) => {
    // console.log('jsonArray', jsonArray)
    let parseRes = []

    if(!jsonArray.length) return parseRes

    // 暂定解析前100项
    for(let i = 0; i < 100; i++) {
        let objArray = jsonArray[i]
        if(!objArray) break
        for(let j = 0; j < objArray.length; j++) {
            let jsonObj = objArray[j]
            if(parseRes.some(it => it.key === jsonObj.key)) continue
            // 不含该字段
            parseRes.push(jsonObj)
        }
    }
    
    return parseRes
}

// 对返回的数据进行正解析
const parseData = (uuObj, lastKey) => {
    let jsonTreeModelDTO = []
    for(let key in uuObj) {
        if (IsObject(uuObj[key])) {
            const obj = {
                children: parseData(uuObj[key], lastKey ? lastKey + '##' + key : '##' + key),
                key: lastKey ? '##' + lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: null,
                isSelect: false,
                isExpand: true
            }
            obj.flagNum = obj.key.split('#').length - 1
            jsonTreeModelDTO.push(obj)
        }
        else if (IsArray(uuObj[key])) { // 这一步有瑕疵,遇到问题再根据问题做调整
            const jsonArray = uuObj[key].map(item => {
                // IsArray(item)防止数组为多维数据
                if (IsObject(item) || IsArray(item)) return parseData(item, lastKey ? lastKey + '##' + key : '##' + key)
            })
            const obj = {
                children: parseArrayData(jsonArray),
                key: lastKey ? lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: null,
                isSelect: false,
                isExpand: true
            }
            obj.flagNum = obj.key.split('#').length - 1
            jsonTreeModelDTO.push(obj)
        }
        else {
            const obj = {
                children: null,
                key: lastKey ? lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: uuObj[key],
                isSelect: false,
                isExpand: true
            }
            obj.flagNum = obj.key.split('#').length - 1
            jsonTreeModelDTO.push(obj)
        }
    }
    const childrens = jsonTreeModelDTO.filter(i => i.children)
    if (!childrens.length && jsonTreeModelDTO.length) {
        jsonTreeModelDTO.forEach(item => {
            item.notAllowed = true
        })
    }
    return jsonTreeModelDTO
}

const getImgType = (num) => {
    if (num == 0) {
        return 'textImg'
    } else if (num == 1 || num == 3) {
        return 'numImg'
    } else {
        return 'timeImg'
    }
}

const createTableData = (array) => {
    let columns = []
    let data = []
    let obj = {}
    array.forEach(item => {
        const colObj = {
            key: item.key,
            dataIndex: item.title,
            [item.title]: item.value,
            imgType: getImgType(item.numType),
            columnAlias: item.originName
        }
        obj = { ...obj, [item.title]: item.value}
        columns.push(colObj)
    })
    data.push(obj)
    return {
        columns,
        data
    }
}

const isJSON = (str) => {
    if (typeof str == 'string') {
        try {
            JSON.parse(str);
            return true;
        } catch(e) {
            return false;
        }
    }
}

const parseParamsData = (uuObj, lastKey) => {
    let jsonTreeModelDTO = []
    for(let key in uuObj) {
        if (IsObject(uuObj[key])) {
            const obj = {
                children: parseParamsData(uuObj[key], lastKey ? lastKey + '##' + key : '##' + key),
                disabled: true,
                key: lastKey ? '##' + lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: null,
                isSelect: false,
                isExpand: true
            }
            jsonTreeModelDTO.push(obj)
        }
        else if (IsArray(uuObj[key])) { // 这一步有瑕疵,遇到问题再根据问题做调整
            const jsonArray = uuObj[key].map(item => {
                // IsArray(item)防止数组为多维数据
                if (IsObject(item) || IsArray(item)) return parseParamsData(item, lastKey ? lastKey + '##' + key : '##' + key)
            })
            const obj = {
                children: (jsonArray.length && jsonArray) || [],
                disabled: true,
                key: lastKey ? lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: null,
                isSelect: false,
                isExpand: true
            }
            jsonTreeModelDTO.push(obj)
        }
        else {
            const obj = {
                children: null,
                disabled: true,
                key: lastKey ? lastKey + '##' + key : '##' + key,
                originName: key,
                title: key,
                type: getType(uuObj[key]),
                numType: getNumType(uuObj[key]),
                value: uuObj[key],
                isSelect: false,
                isExpand: true
            }
            jsonTreeModelDTO.push(obj)
        }
    }
    return jsonTreeModelDTO
}

export {
    parseData,
    createTableData,
    isJSON,
    parseParamsData
}