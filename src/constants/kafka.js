import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'

// 字段类型下拉列表
export const FIELD_TYPE_LIST = [
  {
    id: 'textImg',
    value: 0,
    label: 'selfConfig.string',
    imgSrc: text_img,
  },
  {
    id: 'numImg',
    value: 1,
    label: 'api.decimals',
    imgSrc: num_img
  },
  {
    id: 'numImg',
    value: 3,
    label: 'api.integer',
    imgSrc: num_img
  },
  {
    id: 'timeImg',
    value: 2,
    label: 'selfConfig.time',
    imgSrc: time_img,
  },
]

// 字段类型 => value
export const FIELD_TYPE_MAP = {
  string: 0,
  decimalNumber: 1,
  integerNumber: 3,
  time: 2,
}

// 字段类型 => 图标
export const FIELD_ICON_MAP = {
  string: 'textImg',
  decimalNumber: 'numImg',
  integerNumber: 'numImg',
  time: 'timeImg',
}

// 字段类型 value => 图标
export const ICON_VALUE_MAP = {
  0: 'textImg',
  1: 'numImg',
  3: 'numImg',
  2: 'timeImg',
}
