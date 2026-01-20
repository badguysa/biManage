import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
//数据中心目录菜单
const menu_out_ImgHoverList = [{
    mid: 'fadd',
    text: 'group.addPeerGroup'
},{
    mid: 'cadd',
    text: 'group.addChildGroup'
},{
    mid: 'fedit',
    text: 'common.rename'
},{
    mid: 'fdelete',
    text: 'common.delete'
}]
//系统管理数据标准分组
const out_ImgHoverList = [{
    mid: 'fadd',
    text: 'group.addPeerGroup'
},{
    mid: 'cadd',
    text: 'group.addChildGroup'
},{
    mid: 'fedit',
    text: 'common.rename'
},{
    mid: 'fexport',
    text: 'common.export'
},{
    mid: 'fdelete',
    text: 'common.delete'
}]
//数据中心目录二级菜单
const menu_inner_ImgHoverList = [{
    mid: 'cedit',
    text: 'common.rename'
},{
    mid: 'cdelete',
    text: 'common.delete'
}]
//系统管理数据标准二级分组
const inner_ImgHoverList = [{
    mid: 'cadd',
    text: 'group.addPeerGroup'
},{
    mid: 'gadd',
    text: 'group.addChildGroup'
},{
    mid: 'cedit',
    text: 'common.rename'
},{
    mid: 'cdelete',
    text: 'common.delete'
}]
//系统管理数据标准三级分组
const inner_inner_ImgHoverList = [{
    mid: 'gedit',
    text: 'common.rename'
},{
    mid: 'gdelete',
    text: 'common.delete'
}]

const typeList = [{
    key: 'string',
    text: 'selfConfig.string',
    imgSrc: text_img
},{
    key: 'datetime',
    text: 'selfConfig.datetime',
    imgSrc: time_img
}, {
    key: 'date',
    text: 'selfConfig.date',
    imgSrc: time_img
},{
    key: 'time',
    text: 'selfConfig.time',
    imgSrc: time_img
},{
    key: 'numeric',
    text: 'selfConfig.numeric',
    imgSrc: num_img
}, {
    key: 'bigint',
    text: 'selfConfig.bigint',
    imgSrc: num_img
}]

const apiImportTypeList = [{
    id: 'textImg',
    value: 0,
    label: 'selfConfig.string',
    imgSrc: text_img
},{
    id: 'timeImg',
    value: 2,
    label: 'selfConfig.time',
    imgSrc: time_img
},{
    id: 'numImg',
    value: 1,
    label: 'api.decimals',
    imgSrc: num_img
},{
    id: 'numImg',
    value: 3,
    label: 'api.integer',
    imgSrc: num_img
}]

export {
    menu_out_ImgHoverList,
    out_ImgHoverList,
    menu_inner_ImgHoverList,
    inner_ImgHoverList,
    inner_inner_ImgHoverList,
    typeList,
    apiImportTypeList
}