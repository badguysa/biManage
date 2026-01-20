import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'

export const typeList = [
  {
    key: 'string',
    text: 'selfConfig.string',
    imgSrc: text_img,
    iconName: 'text'
  },
  {
    key: 'datetime',
    text: 'selfConfig.datetime',
    imgSrc: time_img,
    iconName: 'time'
  },
  {
    key: 'date',
    text: 'selfConfig.date',
    imgSrc: time_img,
    iconName: 'time'
  },
  {
    key: 'time',
    text: 'selfConfig.time',
    imgSrc: time_img,
    iconName: 'time'
  },
  {
    key: 'numeric',
    text: 'selfConfig.numeric',
    imgSrc: num_img,
    iconName: 'number'
  },
  {
    key: 'bigint',
    text: 'selfConfig.bigint',
    imgSrc: num_img,
    iconName: 'number'
  }
]

export const columnTypeMap = {
  string: 'text',
  datetime: 'datetime',
  date: 'date',
  time: 'time',
  numeric: 'decimal(30, 3)',
  bigint: 'bigint',
}
