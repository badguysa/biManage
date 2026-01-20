import { message, Tooltip } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import './index.less'
import { getIconSrc } from '@/utils/utils'
import sortup_img from '@/assets/icons/sort_up.png'
import sortdown_img from '@/assets/icons/sort_down.png'
import safe_img from '@/assets/icons/safety.png'
import notsafe_img from '@/assets/icons/not-safe.png'
import useChangeColWidth from '@/hooks/dataCenter/useChangeColWidth'

export default defineComponent({
    name: 'myTable',
    props: {
        tableData: {
            type: Array
        },
        tableColumns: {
            type: Array
        },
        height: {},
        flag: {
            default: ''
        },
        missingFields: {    // 丢失字段
            type: Boolean,
            default: false
        },
        //是否显示表头气泡
        showHeadTooltip: {
            type: Boolean,
            default: false
        },
    },
    emits: ["desensitize"],
    setup(props, { emit }) {
        const { t } = useI18n()
        const state = reactive({
            data: [],
            tableInfo: []
        })

        const tableRef = ref(null)

        // 拖拽列宽逻辑处理
        useChangeColWidth(tableRef)
        
        onMounted(() => {
            state.tableInfo = props.tableData
        })
        watch(props, (newValue) => {
            state.tableInfo = newValue.tableData
        })
        const sortFunc = record => {
            if (record.itemSort === 1) {
                state.tableInfo.sort((a, b) => Number(b[record.dataIndex]) - Number(a[record.dataIndex]))
                record.itemSort = 2
            } else {
                state.tableInfo.sort((a, b) => Number(a[record.dataIndex]) - Number(b[record.dataIndex]))
                record.itemSort = 1
                let data = props.tableColumns.filter(item => item.dataIndex !== record.dataIndex)
                data.forEach(item => {
                    item.itemSort = 2
                })
            }
        }
        const desensitize = (headItem) => {
            emit('desensitize', headItem)
        }
        const copyText = (text) => {
            const input = document.createElement("input")
            input.setAttribute("value", text)     
            document.body.appendChild(input)
            input.select()      
            document.execCommand("copy")       
            document.body.removeChild(input)
            message.success(t('otherConfig.copySuccess'))
        }

        // 表头元素
        const tableHeadElm= (headItem) => (
            <th key={headItem.dataIndex}>
                <div className="cellWrap">
                    <div className="contentWrap">
                        {
                            headItem.imgType!== 'noImg'?
                            <img src={getIconSrc(headItem)} alt="" /> :null
                        }
                        
                        <span className='text' title={headItem.columnAlias || headItem.columnName}>
                            {headItem.columnAlias || headItem.columnName}
                        </span>
                        {
                            props.flag === 'desensitize' ? (
                                headItem.sensitiveConfig && headItem.sensitiveConfig.rule !== 'none' ? <img onClick={() => desensitize(headItem)} className='desensitize-img' src={safe_img} />
                                : <img onClick={() => desensitize(headItem)} className='desensitize-img' src={notsafe_img} />
                            )
                            : null
                        }
                        {
                            headItem.imgType == 'numImg' ? 
                                <img 
                                    className='sort-img' 
                                    onClick={() => sortFunc(headItem)} 
                                    src={headItem.itemSort == 1 ? sortup_img : sortdown_img} 
                                />
                            : null
                        }
                    </div>
                    <div className="resizerWrap">
                        <span className="resizer"></span>
                    </div>
                </div>
            </th>
        )

        const tableHeadCmp = (column) => {
            // 是否显示表头气泡
            if(!props.showHeadTooltip) 
                return tableHeadElm(column) 
           
            return (
                <Tooltip placement="topLeft">
                    {{
                        title: () => (
                            <div className='head-tooltip'>
                                <span>物理字段名：{column.columnName ?? '-'}</span>
                                <span>名称：{column.columnAlias ? column.columnAlias : '-'}</span>
                                <span>字段描述：{column.columnDesc ? column.columnDesc : '-'}</span>
                            </div>
                        ),
                        default:() => tableHeadElm(column) 
                    }}
                </Tooltip>
            )
        }

        return {
            tableRef,
            copyText,
            sortFunc,
            desensitize,
            tableHeadCmp,
            ...toRefs(state),
            ...toRefs(props)
        }
    },
    render() {
        const { tableColumns,  tableInfo, copyText,  tableHeadCmp, missingFields} = this

        return (
            missingFields ?
            <div className="missFields">
                <div className="inner">
                    <div className="bgTips"></div>
                    <span>字段丢失，无法预览数据</span>
                </div>
            </div> :
            <table ref="tableRef" className="mytable">
                <colgroup>
                    {tableColumns.map(it=> <col width="130" key={it.id}></col>)}
                </colgroup>
                <thead>
                    <tr>
                        {
                            tableColumns.length > 0 ? tableColumns.map(column => (
                                tableHeadCmp(column)
                            )) : null
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableInfo.length > 0 ? tableInfo.map((item, i) => (
                            <tr key={item} className={i % 2 !== 0 ? 'blue' : ''}>
                                {
                                    tableColumns.length > 0 ? tableColumns.map((info,index) => (
                                        <td key={index}>
                                            <div className='text' onDblclick={() => copyText(item[info.dataIndex])} title={item[info.dataIndex]}>
                                                {item[info.dataIndex]}
                                            </div>
                                        </td>
                                    )) : null
                                }
                            </tr>
                        )) : null
                    }
                </tbody>
            </table>
        )
    }
})