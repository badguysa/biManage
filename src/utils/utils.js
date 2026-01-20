import img1 from '@/assets/icons/addtable1.png'
import img2 from '@/assets/icons/addtable2.png'
import img3 from '@/assets/icons/addtable3.png'
import img4 from '@/assets/icons/addtable4.png'
import img5 from '@/assets/icons/database.png'
import img6 from '@/assets/icons/sql.png'
import apiIcon from '@/assets/icons/api-icon.png'
import kafkaIcon from '@/assets/icons/kafka.png'
import standardIcon from '@/assets/icons/standard.png'
import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
import { message } from 'ant-design-vue'
import { exportDataAPI , exportFatherApi , uploadFile } from '@/apis/common'
import { uploadFile as cloudUploadFile } from '@/apis/cloud'
import { customizedMenuFids } from '@/constants/systemManage'

// 文件导出映射 5-Excel导出 6-API 7-DB 8-表单 9-SQL 10-自助配置
const exportMap = {
    2: 5,
    7: 6,
    3: 7,
    1: 8,
    6: 8,
    5: 9,
    4: 10
}

function getimgType(type) {
    if (!type) {
        return 'textImg'
    }
    type = type.toLowerCase()
    let imgType = ''
    const numberType = ['number', 'decimal', 'numeric', 'float', 'real', 'money', 'bit', 'serial4', 'serial8']
    const stringType = ['string', 'long', 'uuid', 'json']
    if (type.indexOf('char') > -1 || type.indexOf('text') > -1 || stringType.includes(type)) {
        imgType = 'textImg'
    } else if (type.indexOf('double') > -1 || type.indexOf('int') > -1 || numberType.includes(type) || type.includes('decimal')) {
        imgType = 'numImg'
    } else if (type.indexOf('date') > -1 || type.indexOf('time') > -1 || type == 'year') {
        imgType = 'timeImg'
    } else {
        imgType = 'textImg'
    }
    return imgType
}

function getCodeType(type) {
    if (!type) {
        return 'selfConfig.string'
    }
    type = type.toLowerCase()
    let codeType = ''
    const stringType = ['string', 'long', 'uuid', 'json', 'character']
    if (type == 'varchar' || type == 'char' || type.indexOf('text') > -1 || stringType.includes(type)) {
        codeType = 'selfConfig.string'
    } else if (type == 'bool' || type == 'bit' || type.indexOf('int') > -1) {
        codeType = 'selfConfig.bigint'
    } else if (type == 'number' || type == 'double' || type == 'decimal' || type == 'numeric' || type == 'float' || type == 'real' || type == 'money' || type.includes('decimal')) {
        codeType = 'selfConfig.numeric'
    } else if (type == 'date' || type == 'year') {
        codeType = 'selfConfig.date'
    } else if (type == 'time') {
        codeType = 'selfConfig.time'
    } else if (type == 'datetime' || type == 'date_time') {
        codeType = 'selfConfig.datetime'
    } else {
        return 'selfConfig.string'
    }
    return codeType
}

function getTableImg(record) {
    if (!record) return img1
    const type = record.value
    if (type == 0) { // 空表
        return img1
    } else if (type == 1 || type == 6) { // 表单
        return img2
    } else if (type == 2) { // excel
        return img3
    } else if (type == 3) { // db
        return img5
    } else if (type == 4) { // 自助配置
        return img4
    } else if (type == 5) { // sql
        return img6
    } else if (type == 7) { // api
        return apiIcon
    } else if (type == 8) { // kafka
        return kafkaIcon
    } else if (type == 9) { // 标准
        return standardIcon
    }
}

// 根据表类型获取对应svg图标
function getTableSvg(record) {
    if (!record) return 'empty'
    const type = record.value
    if (type == 0) { // 空表
        return 'empty'
    } else if (type == 1 || type == 6) { // 表单
        return 'form'
    } else if (type == 2) { // excel
        return 'excel'
    } else if (type == 3) { // db
        return 'DB'
    } else if (type == 4) { // 自助配置
        return 'selfConfig'
    } else if (type == 5) { // sql
        return 'sql'
    } else if (type == 7) { // api
        return 'apiTable'
    } else if (type == 8) { // kafka
        return 'kafka'
    } else if (type == 9) { // 标准
        return 'standard'
    }
}


// 获取下拉列表字段图标类型
function getIconSrc(item) {
    let { imgType } = item
    if (imgType === 'textImg') {
        return text_img
    } else if (imgType === 'numImg') {
        return num_img
    } else {
        return time_img
    }
}

function getTypeIconSvg(item) {
    let { imgType } = item
    switch (imgType) {
        case 'textImg':
            return 'text'
        case 'numImg':
            return 'number'
        case 'timeImg':
            return 'time'
        default:
            return 'text'
    }
}

const getTypeIconClassName = (item) => {
    let className = ''
    switch (item.imgType) {
        case 'textImg':
            className = 'textIcon'
            break
        case 'numImg':
            className = 'numberIcon'
            break
        case 'timeImg':
            className = 'timeIcon'
            break
        default:
            className = 'textIcon'
            break
    }
    if (item.errorColumn) {
        className += ' errorStatus'
    }
    return className
}

const formatTime = time => {
    var time = Number(time)
    var date = new Date(time);
    var format = "yyyy-MM-dd hh:mm";
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

const formatTimeToSecond = time => {
    const date = new Date(Number(time)); // 创建一个Date对象，参数为时间戳
    const year = date.getFullYear(); // 年份
    const month = date.getMonth() + 1; // 月份，注意需要加1，月份从0开始
    const day = date.getDate(); // 日
    const hour = date.getHours(); // 小时
    const minute = date.getMinutes(); // 分钟
    const second = date.getSeconds(); // 秒
    return `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day} ${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
}

const getFileSize = (size) => {
    if (!size)
        return "";
    let num = 1024.00; //byte
    if (size < num)
        return size + "B";
    if (size < Math.pow(num, 2))
        return (size / num).toFixed(2) + "K"; //kb
    if (size < Math.pow(num, 3))
        return (size / Math.pow(num, 2)).toFixed(2) + "M"; //M
    if (size < Math.pow(num, 4))
        return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
    return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
}

// 根据表不同的更新策略生成对应的文字
const parseUpdatePolicy = (num) => {
    switch (num) {
        case 0:
            return 'common.noUpdate';
        case 1:
            return 'common.fullUpdate';
        case 2:
            return 'common.incrUpdate';
        case 3:
            return 'common.realTimeUpdate';
        case 4:
            return 'common.apiPushPolicy';
        case 5:
            return 'common.apiPullPolicy';
        case 6:
            return 'common.cascadingUpdate';
        case 7:
            return 'common.appendUpdate';
        case 8:
            return 'common.paused';
        default:
            return 'common.noUpdate'
    }
}

const IsObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]'

const IsArray = (list) => Object.prototype.toString.call(list) === '[object Array]'

const getUrlParam = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);

    if (r != null) return decodeURI(r[2]);
    return '';
}
const getHashParam = (name) => {
    const regex = new RegExp(`${name}=([^&]+)`)
    const match = window.location.hash.match(regex);
    const value = match ? match[1] : null;
    return value
}
function getCookie(name) {
    const d = document.cookie.split(';')?.map(item => item.split('='))?.find(citem => citem[0].trim() === name)
    return d ? d[1] : ''
}

const getPath = (key) => {
    const arr = key.split('##').splice(1, key.split('##').length)
    let str = ''
    for (let i = 0; i < arr.length; i++) {
        if (i !== arr.length - 1) {
            str += arr[i] + '.'
        } else {
            str = str.substring(0, str.length - 1) + '[*]'
        }
    }
    return '$.' + str
}
const isNumber = (value) => {
    return (/^\-?[0-9]+$/).test(value + '');
}

// 判断字符串是否为json格式
function isJSON(str) {
    if (typeof str != 'string') { // 1、传入值必须是 字符串
        return false;
    }

    try {
        var obj = JSON.parse(str); // 2、仅仅通过 JSON.parse(str)，不能完全检验一个字符串是JSON格式的字符串
        if (typeof obj == 'object' && obj) {  //3、还必须是 object 类型
            return true;
        } else {
            return false;
        }

    } catch (e) {
        return false;
    }
}

// url校验
function isUrl(str) {
    let reg = new RegExp('((((http[s]{0,1}|ftp)://)([a-zA-Z0-9\\-]+\\.)+[a-zA-Z0-9\\-]+(:\\d+)?)|(((http[s]{0,1}|ftp)://)?(((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))(:\\d+)?)|(([a-zA-Z0-9\\-]+\\.)+((ac)|(ad)|(ae)|(aero)|(af)|(ag)|(ai)|(al)|(am)|(an)|(ao)|(ar)|(arpa)|(as)|(asia)|(at)|(au)|(aw)|(ax)|(az)|(ba)|(bb)|(bd)|(be)|(bf)|(bg)|(bh)|(bi)|(biz)|(bj)|(bm)|(bn)|(bo)|(br)|(bs)|(bt)|(bv)|(bw)|(by)|(bz)|(ca)|(cat)|(cc)|(cd)|(cf)|(cg)|(ch)|(chintai)|(ci)|(ck)|(cl)|(cm)|(cn)|(co)|(com)|(coop)|(cr)|(cu)|(cv)|(cx)|(cy)|(cz)|(de)|(dj)|(dk)|(dm)|(do)|(dz)|(ec)|(edu)|(ee)|(eg)|(er)|(es)|(et)|(eu)|(fi)|(fj)|(fk)|(fm)|(fo)|(fr)|(ga)|(gb)|(gd)|(ge)|(gf)|(gg)|(gh)|(gi)|(gl)|(global)|(globo)|(gm)|(gmail)|(gn)|(gov)|(gp)|(gq)|(gr)|(gs)|(gt)|(gu)|(gw)|(gy)|(hk)|(hm)|(hn)|(hr)|(ht)|(hu)|(id)|(ie)|(il)|(im)|(in)|(info)|(int)|(iq)|(ir)|(is)|(it)|(je)|(jm)|(jo)|(jobs)|(jp)|(ke)|(kg)|(kh)|(ki)|(km)|(kn)|(kp)|(kr)|(kw)|(ky)|(kz)|(la)|(lb)|(lc)|(li)|(lk)|(lr)|(ls)|(lt)|(lu)|(lv)|(ly)|(ma)|(mc)|(md)|(me)|(mg)|(mh)|(mil)|(mk)|(ml)|(mm)|(mn)|(mo)|(mobi)|(mp)|(mq)|(mr)|(ms)|(mt)|(mu)|(museum)|(mv)|(mw)|(mx)|(my)|(mz)|(na)|(name)|(nc)|(ne)|(net)|(nf)|(ng)|(ni)|(nl)|(no)|(np)|(nr)|(nu)|(nz)|(om)|(org)|(pa)|(pe)|(pf)|(pg)|(ph)|(pk)|(pl)|(pm)|(pn)|(pr)|(pro)|(ps)|(pt)|(pw)|(py)|(qa)|(re)|(ro)|(rs)|(ru)|(rw)|(sa)|(sb)|(sc)|(sd)|(se)|(sg)|(sh)|(si)|(sj)|(sk)|(sl)|(sm)|(smile)|(so)|(sr)|(st)|(su)|(sy)|(sz)|(tc)|(td)|(tel)|(tf)|(tg)|(th)|(tj)|(tl)|(tm)|(tn)|(to)|(tp)|(tr)|(travel)|(tt)|(tv)|(tw)|(tz)|(ua)|(ug)|(uk)|(us)|(uy)|(uz)|(va)|(vc)|(ve)|(vg)|(vi)|(vn)|(vu)|(wf)|(ws)|(ye)|(yt)|(za)|(zm)|(zw))(?![a-zA-Z0-9]))(:\\d+)?)))(/[a-zA-Z0-9\\.\\-~!@#$%^&#$%^&amp;*+?:_/=&lt;&gt;()]*)?', 'gi')
    let res = reg.test(str)
    return res
}

const apiSymbolKey = Symbol('apiSymbolKey')

// 文件导出
async function fileExport(tableInfo, queryParams) {
    let params = {
        id: tableInfo.tableId,
        type: exportMap[tableInfo.tableType],
        queryParams: getObjectBase64Str(queryParams)
    };

    if (tableInfo.querySql) {
        params = {
            id: tableInfo.tableId,
            type: exportMap[tableInfo.tableType],
            querySql: tableInfo.querySql
        }
    }

    return new Promise((resolve, reject) => {
        exportDataAPI(params).
            then((res) => {
                // 这是失败的情况，返回封装的二进制json数据
                if(res.type === 'application/json'){
                    let result
                    let reader = new FileReader();
                    // 设置 FileReader 对象的 onload 回调函数
                    reader.onload = function(event) {
                        // 读取 Blob 中的数据
                        const data = event.target.result;
                        // 将数据解析为 JavaScript 对象
                        result = JSON.parse(data);
                        if (result.code === 0) {
                            message.error(result.message)
                        }
                        resolve(result)
                    }
                    // 读取 Blob 中的数据
                    reader.readAsText(res);
                // 返回成功的情况，返回二进制文本数据
                } else if ( res.type === 'text/xml'){
                    if(tableInfo.dataNum <= 10000) { // 小于10000条 前端下载
                        let data = res;
                        if(res.data){
                            data = res.data;
                        }
                        const blob = new Blob([data])
                        const downloadUrl = window.URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = downloadUrl
                        link.download = tableInfo.tableAlias + '.xlsx'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }
                    resolve(res)
                }
            }).catch(err => 
                reject(err)
            )
    })
}

// 数据标准导出
async function standardExport(name,id) {
    let params = {
        id
    }
    return new Promise((resolve, reject) => {
        exportFatherApi(params).
            then((res) => {
                // 状态为这个才是成功
                if(res.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                    let data = res;
                    if(res.data){
                        data = res.data;
                    }
                    const blob = new Blob([data])
                    const downloadUrl = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = downloadUrl
                    link.download = name + '.docx'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    resolve(res)
                // 失败的情况
                } else if ( res.type === 'application/json'){
                    let result
                    let reader = new FileReader();
                    // 设置 FileReader 对象的 onload 回调函数
                    reader.onload = function(event) {
                        // 读取 Blob 中的数据
                        const data = event.target.result;
                        // 将数据解析为 JavaScript 对象
                        result = JSON.parse(data);
                        if (result.code === 0) {
                            message.error(result.message)
                        }
                        resolve(result)
                    }
                    // 读取 Blob 中的数据
                    reader.readAsText(res);
                }
            }).catch(err => 
                reject(err)
            )
    })
}

const isCustomizedMenuFid = () => {
    return customizedMenuFids.includes(String(getCookie('fid')))
}

const jsonToFormData = (data) => {
    let fd = new FormData()
    for (let key in data) {
        fd.append(key, data[key])
    }
    return fd
}

// 超链接点击下载 非同源url download属性失效
const hrefClickDownload = (url, fileName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    a.click();
}

// 上传文件
const uploadFileUtil = ({isMirror, fileData, uploadProgressFn, signal}) => {
    // 非镜像单位使用云盘上传接口
    if(!isMirror) {
        return cloudUploadFile(fileData, uploadProgressFn, signal)
    }
    return uploadFile(fileData, uploadProgressFn, signal)
}

const downloadBlobUtil = (blobInfo, fileName) => {
    const link = document.createElement('a')
    let blob = new Blob([blobInfo], { type: 'text/plain' })
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 是否为空对象
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
}

// 根据数组二的值，排序数组一, attr为排序 arr1 的对象参数
const sortByArr2 = (arr1, arr2, attr) => {
    const arr2Index = arr2.map(item => item[attr])
    // 创建一个Map，存储arr2中元素的索引  
    const indexMap = new Map(arr2Index.map((value, index) => [value, index]));  
  
    // 根据Map中的索引对arr1进行排序  
    return arr1.sort((a, b) => {  
        // 如果dataIndex在Map中不存在，则给予一个很大的索引值（例如Infinity），确保它们被放在排序后的数组末尾  
        const indexA = indexMap.has(a[attr]) ? indexMap.get(a[attr]) : Infinity;  
        const indexB = indexMap.has(b[attr]) ? indexMap.get(b[attr]) : Infinity;  
        // 比较索引值  
        return indexA - indexB;  
    }); 
}

// 自定义对称加密算法
const simpleEncrypt = (str, key) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// 数字转中文
const numberToChinese = (num) => {
    var units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿'];
    var digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var result = '';
   
    var numArray = String(num).split('').reverse(); // 将数字转为倒序的数组
    for (var i = 0; i < numArray.length; i++) {
      var digit = numArray[i]; // 当前位的数字
      var unit = units[i]; // 当前位的单位
   
      // 对于0的处理
      if (digit === '0') {
        // 如果是连续的多个0，只保留一个零
        if (result[0] === '零') {
          result = result.substring(1);
        }
        // 如果不是最末尾的0，添加一个零
        if (i !== numArray.length - 1) { 
          result = '零' + result;
        }
        continue;
      }
   
      result = digits[digit] + unit + result;
    }
    return result;
}

// 根据属性查重数组，并返回过滤后的数组
const filterArrByProperty = (arr, ...properties) => {
    const seenValues = new Set();
    const filteredArr = [];
    arr.forEach(item => {
        let keyStr = ''
        properties.forEach(p => {
            keyStr += item[p]
        })
        if (!seenValues.has(keyStr)) {
            seenValues.add(keyStr);
            filteredArr.push(item);
        }
    });
    return filteredArr;
};

// 获取对象base64字符串
const getObjectBase64Str = (obj) => {
    let base64Str = ''
    try {
        base64Str = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
    } catch(e) {
        console.log('object to base64 str error', e)
        return ''
    }
    return base64Str
}

// 处理html标签内容 导出使用
const handleExportHtmlStr = (html) => {
    // code标签内的标签 不让浏览器进行解析
    let tags = ['groupId', 'dependency', 'artifactId', 'version']
    tags.forEach(tag => {
        html = html.replaceAll(`<${tag}>`, `&lt;${tag}&gt;`).replaceAll(`</${tag}>`, `&lt;/${tag}&gt;`)
    })
    // 返回完整html代码 通过meta指定字符集 避免出现乱码问题
    return  `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Document</title>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `
}

export {
    getimgType,
    getTableSvg,
    getIconSrc,
    getTypeIconSvg,
    getTypeIconClassName,
    isJSON,
    getTableImg,
    formatTime,
    formatTimeToSecond,
    getCodeType,
    getFileSize,
    IsObject,
    IsArray,
    getUrlParam,
    getCookie,
    parseUpdatePolicy,
    getPath,
    isNumber,
    isUrl,
    fileExport,
    standardExport,
    apiSymbolKey,
    isCustomizedMenuFid,
    jsonToFormData,
    getHashParam,
    hrefClickDownload,
    uploadFileUtil,
    downloadBlobUtil,
    isEmptyObject,
    sortByArr2,
    simpleEncrypt,
    numberToChinese,
    filterArrByProperty,
    getObjectBase64Str,
    handleExportHtmlStr
}