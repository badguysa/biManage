import { defineComponent, reactive, toRefs } from 'vue' 
import { message } from 'ant-design-vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import { storeToRefs } from 'pinia'
import { addBlankTable } from '@/apis/group';
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n';
import './index.less'

export default defineComponent({
    name: 'addTableModal',
    components: {
        myButton
    },
    setup() {
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const useConfigStore = configStore()
        const { addTableModalVisible } = storeToRefs(useModalStore)
        const { activeTabKey } = storeToRefs(useMainStore)
        const { t } = useI18n()
        const state = reactive({
            tableName: '',
            tableDesc: ''
        })
        const cancel = () => {
            useModalStore.changeAddTableModalVisible()
        }
        const onOk = () => {
            if (!state.tableName) {
                message.warn(t('otherConfig.blankTableTip'))
                return
            }
            const tableProperties = {
                groupId: activeTabKey.value,
                tableAlias: state.tableName,
                description: state.tableDesc,
                tableType: 0,
            }
            addBlankTable(tableProperties).then(res => {
                if (res.code == 1) {
                    const obj = {
                        id: activeTabKey.value
                    }
                    useMainStore.selectTabs(obj)
                    message.success(res.message)
                    useModalStore.changeAddTableModalVisible()
                } else {
                    message.error(res.message)
                    useModalStore.changeAddTableModalVisible()
                }
            })
        }
        const iptChange1 = e => {
            state.tableName = e.target.value.trim()
        }
        const iptChange2 = e => {
            state.tableDesc = e.target.value.trim()
        }
        return {
            cancel,
            onOk,
            iptChange1,
            iptChange2,
            t,
            addTableModalVisible,
            ...toRefs(state)
        }
    },
    render() {
        const { cancel, onOk, iptChange1, iptChange2, t, addTableModalVisible, tableDesc, tableName } = this
        return (
            addTableModalVisible ? 
            <div className='addTableModal'>
                <div class="maskLayer"></div>
                <div class="popDiv wid480">
                    <div class="popHead">
                        <span class="popClose fr" onClick={cancel}><img style={{width: '16px'}} src={closeImg} /></span>
                        <p class="fl colorDeep">{ t('common.addBlankTable') }</p>
                    </div>
                    
                    <div className='modalBody'>
                        <div className='row'>
                            <div className='col1'>{ t('common.tableName') }</div>
                            <div className='col2'>
                                <input onChange={ iptChange1 } type="text" placeholder={t('common.enterTableName')} />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col1'>{ t('common.desc') }</div>
                            <div className='col2'>
                                <input onChange={ iptChange2 } type="text" placeholder={t('common.tableDesc')} />
                            </div>
                        </div>
                    </div>

                    <div class="popBottom shadowBox">
                    <myButton class="fr mr25" onClick={onOk} type="primary">{ t('common.confirm') }</myButton>
                    <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                    </div>
                </div>
            </div> 
            : null
        )
    }
})