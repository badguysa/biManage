import num_img from '@/assets/icons/number.png'
import text_img from '@/assets/icons/text.png'
import time_img from '@/assets/icons/time.png'
import C_img from '@/assets/icons/C.png'
import N_img from '@/assets/icons/N.png'
import M_img from '@/assets/icons/M.png'
import B_img from '@/assets/icons/B.png'
import T_img from '@/assets/icons/T.png'
const fieldTypeList = [
    {
        label: 'dataStandard.text',
        value: 'CHARACTER',
        imgSrc: text_img
    },
    {
        label: 'dataStandard.number',
        value: 'NUMBER',
        imgSrc: num_img
    },
    {
        label: 'dataStandard.time',
        value: 'DATE_TIME',
        imgSrc: time_img
    },
]

const dateFormatList = [
    {
        label: '天（yyyyMMdd）',
        value: 'yyyyMMdd',
    },
    {
        label: '天（yyyy-MM-dd）',
        value: 'yyyy-MM-dd',
    },
    {
        label: '小时（yyyyMMddHH）',
        value: 'yyyyMMddHH',
    },
    {
        label: '时分秒（yyyyMMdd HHmmss）',
        value: 'yyyyMMdd HHmmss',
    },
]

const brainFieldTypeList = [
    {
        label: 'dataStandard.C',
        value: 'C',
        imgSrc: C_img
    },{
        label: 'dataStandard.N',
        value: 'N',
        imgSrc: N_img
    },{
        label: 'dataStandard.M',
        value: 'M',
        imgSrc: M_img
    },{
        label: 'dataStandard.B',
        value: 'B',
        imgSrc: B_img
    },{
        label: 'dataStandard.T',
        value: 'T',
        imgSrc: T_img
    },
]

export {
  fieldTypeList,
  dateFormatList,
  brainFieldTypeList,
}