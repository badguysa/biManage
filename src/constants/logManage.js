const cascadUpdateTipInfo = {
  title: '级联更新注意事项: ',
  content: `1.更新：父表更新触发子表更新，但更新过程为异步执行，子表不会立即执行更新;\n2.使用限制：操作内存在动态函数或数据库为mysql时，不支持使用级联更新;\n`
}

const logKindTipInfo = {
  title: '',
  content: `Server日志：后台服务组件日志，用于记录BI server 处理前端请求以及后台任务的全链路执行情况；\nPowerJob日志：任务执行日志，用于记录PowerJob任务执行情况；\nNginx日志：网关代理服务系统日志，用于记录用户访问BI系统的每一个请求情况；\nStarRocks审计日志：数据库审计日志，用于记录数据库查询语句和慢查询情况；`
}

const methodFunctionInfo = {
  // math start
  ABS: '<span style="color:#2B67FF">ABS</span> 函数可以获取一个数的绝对值\n用法：<span style="color:#2B67FF">ABS</span>(数值)\n示例：<span style="color:#2B67FF">ABS</span>(-1) 返回1，也就是-1的绝对值',
  CEIL: '<span style="color:#2B67FF">CEIL</span> 函数可以获取一个向上取整的值\n用法：<span style="color:#2B67FF">CEIL</span>(数值)\n示例：<span style="color:#2B67FF">CEIL</span>(1.6)返回2',
  FLOOR: '<span style="color:#2B67FF">FLOOR</span> 函数可以获取一个向下取整的值\n用法：<span style="color:#2B67FF">FLOOR</span>(数值)\n示例：<span style="color:#2B67FF">FLOOR</span>(1.6)返回1',
  RAND: '<span style="color:#2B67FF">RAND</span> 函数可以返回0-1的随机数\n用法：<span style="color:#2B67FF">RAND</span>()\n示例：<span style="color:#2B67FF">RAND</span>()返回0.3981822127459405',
  SIGN: `<span style="color:#2B67FF">SIGN</span> 函数用于确定一个数是正数、零还是负数\n用法：<span style="color:#2B67FF">SIGN</span>(数值)\n示例：\n<span style="color:#2B67FF">SIGN</span>(-5.5)返回-1\n<span style="color:#2B67FF">SIGN</span>(5.5)返回1\n<span style="color:#2B67FF">SIGN</span>(0)返回0`,
  PI: '<span style="color:#2B67FF">PI</span> 函数可以获取圆周率\n用法：<span style="color:#2B67FF">PI</span>()\n示例：<span style="color:#2B67FF">PI</span>()返回3.141592653589793',
  TRUNCATE: '<span style="color:#2B67FF">TRUNCATE</span> 函数可将数字舍入到指定的小数位数\n用法：<span style="color:#2B67FF">TRUNCATE</span>(数值,小数位数)\n示例：<span style="color:#2B67FF">TRUNCATE</span>(3.141592,2)返回3.14',
  ROUND: '<span style="color:#2B67FF">ROUND</span> 函数可以将数字四舍五入到指定的位数\n用法：<span style="color:#2B67FF">ROUND</span>(数值,位数)\n示例：<span style="color:#2B67FF">ROUND</span>(3.14159,3)返回3.142',
  POW: '<span style="color:#2B67FF">POW</span> 函数可以返回数值乘幂的结果\n用法：<span style="color:#2B67FF">POW</span>(数值,指数)\n示例：<span style="color:#2B67FF">POW</span>(2,3)返回8',
  SQRT: '<span style="color:#2B67FF">SQRT</span> 函数返回非负实数的正平方根\n用法：<span style="color:#2B67FF">SQRT</span>(数值)\n示例：<span style="color:#2B67FF">SQRT</span>(4)返回2',
  EXP: '<span style="color:#2B67FF">EXP</span> 函数用于计算自然对数的底数 𝑒（大约等于 2.71828）的指数\n用法：<span style="color:#2B67FF">EXP</span>(指数)\n示例：<span style="color:#2B67FF">EXP</span>(1)返回2.718281828459045',
  MOD: '<span style="color:#2B67FF">MOD</span> 函数可以获取两数相除的余数\n用法：<span style="color:#2B67FF">MOD</span>(被除数,除数)\n示例：<span style="color:#2B67FF">MOD</span>(4,3)返回1，也就是4/3的余数',
  // math end
  // date start
  NOW: `<span style="color:#2B67FF">NOW</span> 函数可以获取当前时间yyyy-mm-dd hh:m:ss\n用法：<span style="color:#2B67FF">NOW</span>()\n示例：<span style="color:#2B67FF">NOW</span>() 返回2022-01-01 11:11:11`,
  DATEDIFF: `<span style="color:#2B67FF">DATEDIFF</span> 函数可以计算两个日期之间相差的天数\n用法：<span style="color:#2B67FF">DATEDIFF</span>(开始日期,结束日期)\n示例：<span style="color:#2B67FF">DATEDIFF</span>('2024-01-01','2024-01-05')返回4`,
  ADDDATE: `<span style="color:#2B67FF">ADDDATE</span> 函数可以将时间加上指定年、月、日、时、分、秒单位的数值\n用法：<span style="color:#2B67FF">ADDDATE</span>(被计算的时间,INTERVAL 需要加的数值 单位)，单位YEAR-年、MONTH-月、DAY-天、HOUR-小时、MINUTE-分钟、SECOND-秒\n示例：<span style="color:#2B67FF">ADDDATE</span>('2022-01-01 11:11:11', INTERVAL '5' MINUTE)返回2022-01-01 11:16:11`,
  SUBDATE: `<span style="color:#2B67FF">SUBDATE</span> 函数可以将时间减去指定年、月、日、时、分、秒单位的数值\n用法：<span style="color:#2B67FF">SUBDATE</span>(被计算的时间,INTERVAL 需要减的数值 单位)，单位YEAR-年、MONTH-月、DAY-天、HOUR-小时、MINUTE-分钟、SECOND-秒\n示例：<span style="color:#2B67FF">ADDDATE</span>('2022-01-01 11:16:11', INTERVAL '5' MINUTE)返回2022-01-01 11:11:11`,
  DATE_FORMAT: `<span style="color:#2B67FF">DATE_FORMAT</span> 函数可以返回指定格式的日期\n用法：<span style="color:#2B67FF">DATE_FORMAT</span>(日期,'格式')，格式的类型有%Y-年、%m-月、%d-日、%H-时、%i-分、%s-秒\n示例：<span style="color:#2B67FF">DATE_FORMAT</span>('2011-11-11 11:11:11', '%Y-%m-%d %H')返回2011-11-11 11`,
  
  FROM_UNIXTIME: `<span style="color:#2B67FF">FROM_UNIXTIME</span> 函数用于将 Unix 时间戳转换为指定日期和时间格式，默认转化10位时间戳，13位时间戳需要除1000\n用法：<span style="color:#2B67FF">FROM_UNIXTIME</span>(时间戳,'格式')，格式的类型有%Y-年、%m-月、%d-日、%H-时、%i-分、%s-秒\n示例：<span style="color:#2B67FF">FROM_UNIXTIME</span>(1706694168831/1000, '%Y-%m-%d %H:%i:%s')返回2024-01-31 17:42:48`,
  MINUTE:`<span style="color:#2B67FF">MINUTE</span> 函数可以获取某日期的分钟数\n用法：<span style="color:#2B67FF">MINUTE</span>(时间)\n用例：<span style="color:#2B67FF">MINUTE</span>('2024-08-16')返回16`,
  HOUR: `<span style="color:#2B67FF">HOUR</span> 函数可以获取某日期的小时数\n用法：<span style="color:#2B67FF">HOUR</span>(时间)\n用例：<span style="color:#2B67FF">HOUR</span>('2024-08-16')返回16`,
  DAY: `<span style="color:#2B67FF">DAY</span> 函数可以获取某日期是当月的第几日\n用法：<span style="color:#2B67FF">DAY</span>(时间)\n用例：<span style="color:#2B67FF">DAY</span>('2024-08-16')返回16`,
  MONTH: `<span style="color:#2B67FF">MONTH</span> 函数可以获取某日期的月份\n用法：<span style="color:#2B67FF">MONTH</span>(时间)\n用例：<span style="color:#2B67FF">MONTH</span>('2024-08-16')返回8`,
  YEAR: `<span style="color:#2B67FF">YEAR</span> 函数可以获取某日期的年份\n用法：<span style="color:#2B67FF">YEAR</span>(时间)\n用例：<span style="color:#2B67FF">YEAR</span>('2024-08-16')返回2024`,
  // date end
  // text start
  CHAR_LENGTH: `<span style="color:#2B67FF">CHAR_LENGTH</span> 函数可以获取文本中的字符数\n用法：<span style="color:#2B67FF">CHAR_LENGTH</span>(文本)\n示例：<span style="color:#2B67FF">CHAR_LENGTH</span>('你好nihao123')返回10`,
  LENGTH: `<span style="color:#2B67FF">LENGTH</span> 函数用于计算字符串长度\n用法：<span style="color:#2B67FF">LENGTH</span>(被计算列)\n示例：<span style="color:#2B67FF">LENGTH</span>('你好nihao123')返回14`,
  CONCAT: `<span style="color:#2B67FF">CONCAT</span> 函数可以将多个文本合并成一个文本\n用法：<span style="color:#2B67FF">CONCAT</span>(文本1,文本2,文本3)\n示例：<span style="color:#2B67FF">CONCAT</span>('陈远','大二','机械专业')返回陈远大二机械专业`,
  CONCAT_WS: `<span style="color:#2B67FF">CONCAT_WS</span> 函数可以用一个文本作为拼接符，将多个文本合并成一个文本\n用法：<span style="color:#2B67FF">CONCAT_WS</span>(拼接符,文本1,文本2,文本3)\n示例：<span style="color:#2B67FF">CONCAT_WS</span>('&','陈远','大二','机械专业')返回陈远&大二&机械专业`,
  UPPER: `<span style="color:#2B67FF">UPPER</span> 函数可以将一个文本中所有小写字母转化为大写字母\n用法：<span style="color:#2B67FF">UPPER</span>(文本)\n示例：<span style="color:#2B67FF">UPPER</span>('chaoxing')返回CHAOXING`,
  
  LOWER: `<span style="color:#2B67FF">LOWER</span> 函数可以将一个文本中的所有大写字母转换为小写字母\n用法：<span style="color:#2B67FF">LOWER</span>(文本)\n示例：<span style="color:#2B67FF">LOWER</span>('CHAOXING')返回chaoxing\n`,
  SUBSTR: `<span style="color:#2B67FF">SUBSTR</span> 函数可以返回文本中从指定位置开始的指定数目的字符\n用法：<span style="color:#2B67FF">SUBSTR</span>(文本,开始截取位数,截取保留个数)\n示例：<span style="color:#2B67FF">SUBSTR</span>(20120101,5,4)返回0101\n`,
  UUID: `<span style="color:#2B67FF">UUID</span> 函数用于自动生成32位唯一标识符，格式为8-4-4-4-12\n用法：<span style="color:#2B67FF">UUID</span>()\n示例：<span style="color:#2B67FF">UUID</span>()返回123e4567-e89b-12d3-a456-426614174000\n`,
  REPLACE: `<span style="color:#2B67FF">REPLACE</span> 函数可以根据指定的文本，将指定文本替换为不同的文本\n用法：<span style="color:#2B67FF">REPLACE</span>(字段,需要被替换的文本,替换文本)\n示例：<span style="color:#2B67FF">REPLACE</span>(123e4567-e89b-12d3-a456-426614174000,'-','')返回123e4567e89b12d3a456426614174000`,
  SPLIT_PART: `<span style="color:#2B67FF">SPLIT_PART</span> 函数可以根据分隔符拆分字段，返回指定位置的分割内容\n用法：<span style="color:#2B67FF">SPLIT_PART</span>(字段,'分割符',第几部分)\n示例：<span style="color:#2B67FF">SPLIT_PART</span>(123e4567-e89b-12d3-a456-426614174000,'-',3)返回12d3`,
  SUBSTRING: `<span style="color:#2B67FF">SUBSTRING</span> 函数可以根据设置的X位数，去除字符串中前X个字符\n用法：<span style="color:#2B67FF">SUBSTRING</span>(文本,第X位),；需注意X为要去除的位数+1，如要去除前2位数，则X需填3\n示例：<span style="color:#2B67FF">SUBSTRING</span>(U2陈远,3)返回陈远`,
  RIGHT: `<span style="color:#2B67FF">RIGHT</span> 函数可以根据设置的X位数，仅保存字符串中后X个字符\n用法：<span style="color:#2B67FF">RIGHT</span>(文本,第X位)\n示例：<span style="color:#2B67FF">RIGHT</span>(U2陈远,2)返回陈远`,
  TRIM: `<span style="color:#2B67FF">TRIM</span> 函数可以删除文本首尾的空格\n用法：<span style="color:#2B67FF">TRIM</span>(文本)\n示例：<span style="color:#2B67FF">TRIM</span>(陈远 )返回陈远`,
  // text end
  // logic start
  CASEWHEN: `<span style="color:#2B67FF">CASE WHEN </span>函数用于根据不同指定条件返回不同值\n用法：CASE(指定列) WHEN 条件 THEN 返回值 ELSE 返回值 END\n示例：\nCASE x\nWHEN x1 THEN a\nWHEN x2 THEN b\nELSE c\nEND\n结果：x = x1 返回 a ，x = x2 返回 b， 其他 返回 c`,
  IF: `<span style="color:#2B67FF">IF</span> 函数用于判断一个条件能否满足；如果满足返回一个值，如果不满足则返回另一个值\n用法：<span style="color:#2B67FF">IF</span>(逻辑表达式,为true返回的值,为false返回的值)\n示例：<span style="color:#2B67FF">IF</span>(学生代码=20,'0','1')返回  当学生代码为20时返回0，不为20返回1`,
  IFNULL: `<span style="color:#2B67FF">IFNULL</span> 函数用于判断条件中能否满足NULL值；如果满足返回另一个值，如果不满足则返回原值\n用法：<span style="color:#2B67FF">IFNULL</span>(被处理的列,为null时的替换值)\n示例：<span style="color:#2B67FF">IFNULL</span>(0,'1')返回0、<span style="color:#2B67FF">IFNULL</span>(null,'1')返回1`,
  // logic end
  // senior start
  ROW_NUMBER: `<span style="color:#2B67FF">ROW_NUMBER</span> 函数可以为条件列中的每一行分配一个唯一的序号，这个序号是按照正序从 1 开始递增\n用法： <span style="color:#2B67FF">ROW_NUMBER</span>() OVER(ORDER BY 条件列)\n示例：<span style="color:#2B67FF">ROW_NUMBER</span>() OVER(ORDER BY 条件列)返回从1开始递增的排序`,
  ID_NUMBER_CHECK: `<span style="color:#2B67FF">身份证号校验</span>函数是中台定制的打包函数，可用于校验身份证号格式是否合规\n用法：用于数据标准规则校验\n示例：<span style="color:#2B67FF">身份证号校验</span>(365221200001304818)`,
  PHONE_NUMBER_CHECK: `<span style="color:#2B67FF">手机号校验</span>函数是中台定制的打包函数，可用于校验手机号格式是否合规\n用法：用于数据标准规则校验\n示例：<span style="color:#2B67FF">手机号校验</span>(13547899999)`,
  GET_ID_GENDER: `<span style="color:#2B67FF">身份证号提取性别</span>函数是中台定制的打包函数，可用于提取身份证号内的男女生性别\n用法：用于数据标准规则校验\n示例：<span style="color:#2B67FF">身份证号提取性别</span>(365221200001304818)返回男`,
  GET_ID_AGE: `<span style="color:#2B67FF">身份证号提取年龄</span>函数是中台定制的打包函数，可用于提取身份证号内的年龄\n用法：用于数据标准规则校验\n示例：<span style="color:#2B67FF">身份证号提取年龄</span>(365221200001304818)返回24`,
  GET_ID_BIRTH: `<span style="color:#2B67FF">身份证号提取出生日期</span>函数是中台定制的打包函数，可用于提取身份证号内的出生日期\n用法：用于数据标准规则校验\n示例：<span style="color:#2B67FF">身份证号提取出生日期</span>(365221200001304818)返回2000-01-30`,
  // senior end
}

export {
  cascadUpdateTipInfo,
  logKindTipInfo,
  methodFunctionInfo
}