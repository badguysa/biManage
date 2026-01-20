const symbolTextMap = {
    eq: 'operationList.eq',
    ne: 'operationList.ne',
    eq: 'operationList.eq',
    gt: 'operationList.gt',
    lt: 'operationList.lt',
    gte: 'operationList.gte',
    lte: 'operationList.lte',
    between: 'operationList.between',
    notBetween: 'numberOperationList.notBetween',
    isnull: 'operationList.isnull',
    notnull: 'operationList.notnull',
    in: 'textOperationList.in',
    notIn: 'textOperationList.notIn',
    start: 'textOperationList.start',
    notStart: 'textOperationList.notStart',
    end: 'textOperationList.end',
    notEnd: 'textOperationList.notEnd',
    contain: 'textOperationList.contain',
    notContain: 'textOperationList.notContain',
    isblank: 'textOperationList.isblank',
    notblank: 'textOperationList.notblank',
    topNAsc: 'numberOperationList.topNAsc',
    topN: 'numberOperationList.topN'
}

const operationList = [{
    text: 'operationList.eq',
    symbol: 'eq',
}, {
    text: 'operationList.ne',
    symbol: 'ne',
	border: true,
}, {
    text: 'operationList.gt',
    symbol: 'gt',
}, {
    text: 'operationList.lt',
    symbol: 'lt',
	border: true,
}, {
    text: 'operationList.gte',
    symbol: 'gte',
}, {
    text: 'operationList.lte',
    symbol: 'lte',
	border: true,
}, {
    text: 'operationList.between',
    symbol: 'between'
}, {
    text: 'operationList.isnull',
    symbol: 'isnull'
}, {
    text: 'operationList.notnull',
    symbol: 'notnull'
}]

// 文本条件
/**
 * like - 开头是 content前加%
 * like - 结尾是 content后加%
 * like - 包含 content前后加%
 */
const textOperationList = [
{
	text: 'textOperationList.eq',
	symbol: 'eq',
}, {
	text: 'textOperationList.ne',
	symbol: 'ne',
	border: true,
}, {
	text: 'textOperationList.in',
	symbol: 'in',
}, {
	text: 'textOperationList.notIn',
	symbol: 'notIn',
	border: true,
}, {
    text: 'textOperationList.start',
    symbol: 'start',
}, {
	text: 'textOperationList.notStart',
	symbol: 'notStart',
	border: true,
}, {
    text: 'textOperationList.end',
    symbol: 'end'
}, {
	text: 'textOperationList.notEnd',
	symbol: 'notEnd',
	border: true,
}, {
    text: 'textOperationList.contain',
    symbol: 'contain'
}, {
	text: 'textOperationList.notContain',
	symbol: 'notContain',
	border: true,
}, {
    text: 'textOperationList.isnull',
    symbol: 'isnull'
}, {
    text: 'textOperationList.notnull',
    symbol: 'notnull',
	border: true,
}, {
    text: 'textOperationList.isblank',
    symbol: 'isblank'
}, {
    text: 'textOperationList.notblank',
    symbol: 'notblank'
}]

// 数字条件
const numberOperationList = [{
    text: 'numberOperationList.eq',
    symbol: 'eq',
}, {
    text: 'numberOperationList.ne',
    symbol: 'ne',
	border: true,
}, {
    text: 'numberOperationList.gt',
    symbol: 'gt',
}, {
    text: 'numberOperationList.lt',
    symbol: 'lt',
	border: true,
}, {
    text: 'numberOperationList.gte',
    symbol: 'gte',
}, {
    text: 'numberOperationList.lte',
    symbol: 'lte',
	border: true,
}, {
    text: 'numberOperationList.between',
    symbol: 'between'
}, {
	text: 'numberOperationList.notBetween',
	symbol: 'notBetween',
	border: true,

}, {
	text: 'numberOperationList.topNAsc',
	symbol: 'topNAsc'
}, {
	text: 'numberOperationList.topN',
	symbol: 'topN',
	border: true,
}, {
    text: 'numberOperationList.isnull',
    symbol: 'isnull'
}, {
    text: 'numberOperationList.notnull',
    symbol: 'notnull',
	border: true,
}]

// 日期条件
const timeOperationList = [{
    text: 'timeOperationList.eq',
    symbol: 'eq',
}, {
    text: 'timeOperationList.ne',
    symbol: 'ne',
	border: true,
}, {
    text: 'timeOperationList.beforeTime',
    symbol: 'lt'
}, {
    text: 'timeOperationList.afterTime',
    symbol: 'gt',
	border: true,
}, {
    text: 'timeOperationList.between',
    symbol: 'between'
}, {
	text: 'timeOperationList.notBetween',
	symbol: 'notBetween',
	border: true,
}, {
	text: 'timeOperationList.topNAsc',
	symbol: 'topNAsc'
}, {
	text: 'timeOperationList.topN',
	symbol: 'topN',
	border: true,
}, {
    text: 'timeOperationList.isnull',
    symbol: 'isnull'
}, {
    text: 'timeOperationList.notnull',
    symbol: 'notnull'
}]

const chPushDesc = `{datas: [{
    "fid": 1385, // 单位id,由中台提供
    "tableId": 666668, // 数据中台的表id,由中台提供
    "key": "hello word", // 授权的key值,与tableId绑定,由中台提供
    "operateType": "add、delete、update", // 操作类型增删改,只填其中一个
    "addInfo": {}, // 新增数据的全部字段json
    "uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
    "deleteCondition": {}, // 删除条件,如"deleteCondition": {"id":1002,"number":10}
    "updateCondition": {}, // 更新条件,如"updateCondition": {"id":1002,"age":10}
    "updateField": {} // 要更新的字段,如"updateField": {"name":"新名称","phone":"手机号"}
}]}`

// const chPullDesc = `[{
//     "operateType": "add、delete、update", // 操作类型增删改,只填其中一个 
//     "addInfo": {}, // 新增数据的全部字段json
//     "uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
//     "deleteCondition": {}, // 删除条件,如"deleteCondition": {"id":1002,"number":10}
//     "updateCondition": {}, // 更新条件,如"updateCondition": {"id":1002,"age":10}
//     "updateField": {} // 要更新的字段,如"updateField": {"name":"新名称","phone":"手机号"}
// }]`

const chPullDesc = `{datas: [{
	"fid": 1385, // 单位id,由中台提供
	"tableId": 666668, // 数据中台的表id,由中台提供
	"key": "hello word", // 授权的key值,与tableId绑定,由中台提供
	"operateType": "add、delete、update", // 操作类型增删改,只填其中一个
	"addInfo": {}, // 新增数据的全部字段json
	"uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
	"deleteCondition": {}, // 删除条件,如"deleteCondition": {"id":1002,"number":10}
	"updateCondition": {}, // 更新条件,如"updateCondition": {"id":1002,"age":10}
	"updateField": {} // 要更新的字段,如"updateField": {"name":"新名称","phone":"手机号"}
}]}`

const loPushDesc = `{datas: [{
    "fid": 1385, // idອົງກອນ,ສະໜອງໂດຍສະຖານີສູນກາງ
    "tableId": 666668, // ຂໍ້ມູນລວມມີ id ຕາຕະລາງ,ສະໜອງໂດຍສະຖານີກາງ
    "key": "hello word", // ຄ່າ key ທີ່ມອບສິດ,ຜູກມັດກັບ tableId,ສະໜອງໂດຍສະຖານີສູນກາງ
    "operateType": "add、delete、update", // ເພີ່ມ,ລົບ, ແປງປະເພດການດໍາເນີນງານ,ຕື່ມໃສ່ອັນດຽວເທົ່ານັ້ນ
    "addInfo": {}, // ເພີ່ມໃໝ່ຂໍ້ມູນພາກສ່ວນjsonທັງໝົດ
    "uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
    "deleteCondition": {}, // ລົບເງື່ອນໄຂ,ເຊັ່ນ"deleteCondition": {"id":1002,"number":10}
    "updateCondition": {}, // ອັບເດດເງື່ອນໄຂ,ເຊັ່ນ"updateCondition": {"id":1002,"age":10}
    "updateField": {} // ພາກສ່ວນທີ່ຕ້ອງອັບເດດ,ເຊັ່ນ"updateField": {"name":"ຊື່ໃໝ່","phone":"ເບີມືຖື"}
}]}`

// const loPullDesc = `[{
//     "operateType": "add、delete、update", // ເພີ່ມ,ລົບ, ແປງປະເພດການດໍາເນີນງານ,ຕື່ມໃສ່ອັນດຽວເທົ່ານັ້ນ 
//     "addInfo": {}, // ເພີ່ມໃໝ່ຂໍ້ມູນພາກສ່ວນjsonທັງໝົດ
// 		"uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
//     "deleteCondition": {}, // ລົບເງື່ອນໄຂ,ເຊັ່ນ"deleteCondition": {"id":1002,"number":10}
//     "updateCondition": {}, // ອັບເດດເງື່ອນໄຂ,ເຊັ່ນ"updateCondition": {"id":1002,"age":10}
//     "updateField": {} // ພາກສ່ວນທີ່ຕ້ອງອັບເດດ,ເຊັ່ນ"updateField": {"name":"ຊື່ໃໝ່","phone":"ເບີມືຖື"}
// }]`

const loPullDesc = `{datas: [{
	"fid": 1385, // 单位id,由中台提供
	"tableId": 666668, // 数据中台的表id,由中台提供
	"key": "hello word", // 授权的key值,与tableId绑定,由中台提供
	"operateType": "add、delete、update", // 操作类型增删改,只填其中一个
	"addInfo": {}, // 新增数据的全部字段json
	"uniqueIndex": "", // 数据唯一标识的多个字段,如"uniqueIndex":"name,fid,staid"
	"deleteCondition": {}, // 删除条件,如"deleteCondition": {"id":1002,"number":10}
	"updateCondition": {}, // 更新条件,如"updateCondition": {"id":1002,"age":10}
	"updateField": {} // 要更新的字段,如"updateField": {"name":"新名称","phone":"手机号"}
}]}`


// 公式编辑 方法列表数据 类型 MATH:数学函数;DATETIME:日期函数;TEXT:文本函数;LOGIC:逻辑函数;SENIOR:高级函数;CURSTOM:自定义函数
const methodInfo = [
	{  
        "name": "ABS",  
        "type": "MATH",  
        "params": { "num": 1, "types": ["column", "number"] },  
        "def": "method.ABS"  
    },  
    {  
        "name": "CEIL",  
        "type": "MATH",  
        "def": "method.CEIL"  
    },  
    {  
        "name": "EXP",  
        "type": "MATH",  
        "def": "method.EXP"  
    },  
    {  
        "name": "FLOOR",  
        "type": "MATH",  
        "def": "method.FLOOR"  
    },  
    {  
        "name": "MOD",  
        "type": "MATH",  
        "def": "method.MOD"  
    },  
    {  
        "name": "PI()",  
        "type": "MATH",  
        "def": "method.PI"  
    },  
    {  
        "name": "POW",  
        "type": "MATH",  
        "def": "method.POW"  
    },  
    {  
        "name": "RAND",  
        "type": "MATH",  
        "def": "method.RAND"  
    },  
    {  
        "name": "ROUND",  
        "type": "MATH",  
        "def": "method.ROUND"  
    },  
    {  
        "name": "SIGN",  
        "type": "MATH",  
        "def": "method.SIGN"  
    },  
    {  
        "name": "SQRT",  
        "type": "MATH",  
        "def": "method.SQRT"  
    },  
    {  
        "name": "TRUNCATE",  
        "type": "MATH",  
        "def": "method.TRUNCATE"  
    },
	{  
        "name": "ADDDATE",  
        "type": "DATETIME",  
        "def": "method.ADDDATE"  
    },  
    {  
        "name": "DAY",  
        "type": "DATETIME",  
        "def": "method.DAY"  
    },  
    {  
        "name": "DATEDIFF",  
        "type": "DATETIME",  
        "def": "method.DATEDIFF"  
    },
	{  
        "name": "DATE_FORMAT",  
        "type": "DATETIME",  
        "def": "method.DATE_FORMAT"  
    },
    {  
        "name": "FROM_UNIXTIME",  
        "type": "DATETIME",  
        "def": "method.FROM_UNIXTIME"  
    },  
    {  
        "name": "HOUR",  
        "type": "DATETIME",  
        "def": "method.HOUR"  
    },  
    {  
        "name": "MINUTE",  
        "type": "DATETIME",  
        "def": "method.MINUTE"  
    },  
    {  
        "name": "MONTH",  
        "type": "DATETIME",  
        "def": "method.MONTH"  
    },  
    {  
        "name": "NOW",  
        "type": "DATETIME",  
        "def": "method.NOW"  
    },  
    {  
        "name": "SUBDATE",  
        "type": "DATETIME",  
        "def": "method.SUBDATE"  
    },  
    {  
        "name": "YEAR",  
        "type": "DATETIME",  
        "def": "method.YEAR"  
    }, 
	{  
        "name": "CHAR_LENGTH",  
        "type": "TEXT",  
        "def": "method.CHAR_LENGTH"  
    },  
    {  
        "name": "CONCAT",  
        "type": "TEXT",  
        "def": "method.CONCAT"  
    },  
    {  
        "name": "CONCAT_WS",  
        "type": "TEXT",  
        "def": "method.CONCAT_WS"  
    },  
    {  
        "name": "LENGTH",  
        "type": "TEXT",  
        "def": "method.LENGTH"  
    },  
    {  
        "name": "LOWER",  
        "type": "TEXT",  
        "def": "method.LOWER"  
    },  
    {  
        "name": "REPLACE",  
        "type": "TEXT",  
        "def": "method.REPLACE"  
    },  
    {  
        "name": "RIGHT",  
        "type": "TEXT",  
        "def": "method.RIGHT"  
    },  
    {  
        "name": "SPLIT_PART",  
        "type": "TEXT",  
        "def": "method.SPLIT_PART"  
    },  
    {  
        "name": "SUBSTR",  
        "type": "TEXT",  
        "def": "method.SUBSTR"  
    },  
    {  
        "name": "SUBSTRING",  
        "type": "TEXT",  
        "def": "method.SUBSTRING"  
    },  
    {  
        "name": "TRIM",  
        "type": "TEXT",  
        "def": "method.TRIM"  
    },  
    {  
        "name": "UPPER",  
        "type": "TEXT",  
        "def": "method.UPPER"  
    },  
    {  
        "name": "UUID",  
        "type": "TEXT",  
        "def": "method.UUID"  
    },
	{
		"name": "CASE WHEN",
		"type": "LOGIC",
		"def": "method.CASEWHEN"
	},
	{
		"name": "IF",
		"type": "LOGIC",
		"def": "method.IF"
	},
	{
		"name": "IFNULL",
		"type": "LOGIC",
		"def": "method.IFNULL"
	},
	{
		"name": "ROW_NUMBER() OVER(ORDER BY )",
		"type": "SENIOR",
		"def": "method.ROW_NUMBER"
	},
]

// 标准校验 定制方法
const standardCheckMethods = [
  {
    name: '身份证号校验',
    type: 'SENIOR',
    def: 'method.ID_NUMBER_CHECK',
    replacement:
      "${placehoder} REGEXP '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\\d{3}(\\d|X|x)$'",
    reg: /身份证号校验\((.+?)\)/g
  },
  {
    name: '手机号校验',
    type: 'SENIOR',
    def: 'method.PHONE_NUMBER_CHECK',
    replacement: "${placehoder} REGEXP '^1[3-9]\\d{9}$'",
    reg: /手机号校验\((.+?)\)/g
  },
//   {
//     name: '身份证号提取性别',
//     type: 'SENIOR',
//     def: 'method.GET_ID_GENDER',
//     replacement: "IF(SUBSTRING(${placehoder}, 17, 1) % 2 = 0, '女', '男')",
//     reg: /身份证号提取性别\((.+?)\)/g
//   },
//   {
//     name: '身份证号提取年龄',
//     type: 'SENIOR',
//     def: 'method.GET_ID_AGE',
//     replacement: 'TIMESTAMPDIFF(YEAR, ${placehoder}, CURDATE())',
//     reg: /身份证号提取年龄\((.+?)\)/g
//   },
//   {
//     name: '身份证号提取出生日期',
//     type: 'SENIOR',
//     def: 'method.GET_ID_BIRTH',
//     replacement:
//       'TIMESTAMPDIFF(YEAR, SUBSTRING(${placehoder}, 7, 8), CURDATE())',
//     reg: /身份证号提取出生日期\((.+?)\)/g
//   }
]

/**
 * 将添加公式中的自定义函数改为对应表达式
 * @param {string} expression  公式表达式
 * 对接文档: https://noteyd.chaoxing.com/pc/0f91a8a3-0779-4e04-a290-08ffa8baab55
 */
function replaceFormulaExpression(expression) {
    standardCheckMethods.forEach(item => {
        expression = expression.replace(item.reg, function(_, targetParmas) {
            return item.replacement.replace('${placehoder}', targetParmas)
        })
    })
    return expression
}

export {
    symbolTextMap,
    operationList,
    textOperationList,
    numberOperationList,
    timeOperationList,
    chPushDesc,
    chPullDesc,
    loPullDesc,
    loPushDesc,
    methodInfo,
    standardCheckMethods,
    replaceFormulaExpression
}