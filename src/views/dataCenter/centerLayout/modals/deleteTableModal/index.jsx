import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { deleteTable, deleteBinTable } from '@/apis/config';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n';
import './index.less'

export default defineComponent({
    name: '',
    components: {
        myButton
    },
    setup() {
        const { t } = useI18n()
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const { deleteModalVisible } = storeToRefs(useModalStore)
        const { deleteData, activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)
        const cancel = () => {
            useModalStore.changeDeleteModalVisible()
        }
        const onOk = () => {
            const data = {
                ids: deleteData.value.id
            }
            if (indexTableActiveId.value.length) {
                const delKey = indexTableActiveId.value.find(i => i.id === deleteData.value.id)
                if (delKey) {
                    useMainStore.setIndexTableActiveId(delKey.id, activeTabKey.value, 'del')
                }
            }
            if (deleteData.value.isFromBin === 'yes') {
                deleteBinTable(data).then(res => {
                    if (res.code == 1) {
                        useMainStore.selectTabs({ id: activeTabKey.value })
                        useMainStore.setDeleteData({})
                        message.success(res.message)
                        useModalStore.changeDeleteModalVisible()
                    } else {
                        message.error(res.message)
                    }
                })
            } else {
                deleteTable(data).then(res => {
                    if (res.code == 1) {
                        useMainStore.selectTabs({ id: activeTabKey.value }, 'delete')
                        useMainStore.setDeleteData({})
                        message.success(res.message)
                        useModalStore.changeDeleteModalVisible()
                    } else {
                        message.error(res.message)
                    }
                })
            }
        }
        return {
            cancel,
            onOk,
            t,
            deleteModalVisible,
            deleteData
        }
    },
    render() {
        const { cancel, onOk, t, deleteModalVisible, deleteData } = this
        return (
            deleteModalVisible ?
                <div className='delTableModal'>
                    <div class="maskLayer"></div>
                    <div class="popDiv wid400">
                        <div class="popuHead">
                            <span class="popClose fr" onClick={cancel}><img style={{ width: '16px' }} src={closeImg} /></span>
                            <p class="fl colorDeep">{t('common.tip')}</p>
                        </div>
                        <div className='modalBody'>
                            {/* {
                                deleteData.mapperApi ?
                                    <div>
                                        { t('group.mapperTipleft') }:
                                        <span title={deleteData.mapperApi} className='text'>
                                            {deleteData.mapperApi.length > 14 ? deleteData.mapperApi.substring(0, 11) + deleteData.mapperApi.substring(11, 14) + '...'
                                                : deleteData.mapperApi
                                            }
                                            </span>
                                        ,{ t('group.mapperTipRight') }?
                                    </div>
                                    :
                                    deleteData.mapperPush ?
                                    <span style={{wordBreak: 'break-all'}}>
                                        { t('group.mapperPushTipRight') }:
                                        <span title={deleteData.mapperPush} className='text'>
                                            {deleteData.mapperPush.length > 14 ? deleteData.mapperPush.substring(0, 11) + deleteData.mapperPush.substring(11, 14) + '...'
                                                : deleteData.mapperPush
                                            }
                                            </span>
                                        ,{t('indexPage.deleteTable')}<span className='text'>{deleteData.tableAlias}</span>?
                                    </span>
                                    :
                                    <span style={{wordBreak: 'break-all'}}>{t('indexPage.deleteTable')}<span className='text'>{deleteData.tableAlias}</span>?</span>
                            } */}
                            {
                                deleteData.hasBlood ?
                                <div>
                                    { t('group.deleteBloodTip') }
                                    <span style={{wordBreak: 'break-all'}}>{t('indexPage.deleteTable')}<span className='text'>{deleteData.tableAlias}</span>?</span>
                                </div> 
                                :
                                <span style={{wordBreak: 'break-all'}}>{t('indexPage.deleteTable')}<span className='text'>{deleteData.tableAlias}</span>?</span>
                            }
                        </div>

                        <div class="popuBottom shadowBox">
                            <myButton class="fr mr25" onClick={onOk} type="primary">{t('common.confirm')}</myButton>
                            <myButton class="fr mr25" onClick={cancel}>{t('common.cancel')}</myButton>
                        </div>
                    </div>
                </div>
                : null
        )
    }
})