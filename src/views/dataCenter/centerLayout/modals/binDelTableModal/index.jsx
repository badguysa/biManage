import { defineComponent, toRefs } from 'vue' 
import { modalStore } from '@/Stores/modalStore';
import closeImg from '@/assets/icons/close.png'
import { deleteBinTable } from '@/apis/config'
import { clearRecycle } from '@/apis/group';
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import './index.less'

export default defineComponent({
    name: '',
    components: {
        myButton
    },
    props: {
        isBatchDel: {
            type: Boolean,
            default: false
        },
        tableInfo: {
            type: Object,
            default: {}
        },
        selectedList: {
            type: Array,
            default: []
        },
        flag: {
            type: String,
            default: ''
        }
    },
    emits: ['refreshData'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const useModalStore = modalStore()
        const cancel = () => {
            useModalStore.changeBinDelTableModalVisible()
        }
        const onOk = () => {
            if (props.flag === 'clear') {
                clearRecycle().then(res => {
                    if (res.code == 1) {
                        emit('refreshData')
                        message.success(res.message)
                    } else {
                        message.error(res.message)
                    }
                    useModalStore.changeBinDelTableModalVisible()
                })
            } else {
                let ids = ''
                if (props.isBatchDel) {
                    ids = props.selectedList.map(item => item.id).join(',')
                } else {
                    ids = props.tableInfo.id
                }
                deleteBinTable({
                    ids
                }).then(res => {
                    if (res.code == 1) {
                        emit('refreshData')
                        message.success(res.message)
                    } else {
                        message.error(res.message)
                    }
                    useModalStore.changeBinDelTableModalVisible()
                })
            }
        }
        return {
            cancel,
            onOk,
            t,
            ...toRefs(props)
        }
    },
    render() {
        const { cancel, onOk, t, tableInfo, isBatchDel, flag } = this
        return (
            <div className='binDelModal'>
                <div class="maskLayer"></div>
                <div class="popDiv wid400">
                    <div class="popuHead">
                        <span class="popClose fr" onClick={cancel}><img style={{width: '16px'}} src={closeImg} /></span>
                        <p class="fl colorDeep">{ t('common.tip') }</p>
                    </div>
                    <div className='modalBody'>
                        {
                           flag === 'clear' ? 
                           <span>{t('bin.clearAllTip')}</span>
                           : isBatchDel ? 
                           <span>{t('bin.batchDelTip')}</span> :
                           <span>{t('bin.singleDelTip')}"<span className='strong'>{tableInfo.tableAlias}</span>"?</span>
                        }
                    </div>

                    <div class="popuBottom shadowBox">
                        <myButton class="fr mr25" onClick={onOk} type="primary">{ flag === 'clear' ? t('bin.clearAll') : t('common.delete') }</myButton>
                        <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                    </div>
                </div>
            </div> 
        )
    }
})