import { defineComponent, computed, toRefs } from 'vue' 
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { configStore } from '@/Stores/configStore';
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
        const useConfigStore = configStore()
        const { deleteProgressVisible } = storeToRefs(useModalStore)
        const { deleteData, activeTabKey } = storeToRefs(useMainStore)
        const { configUniqueData } = storeToRefs(useConfigStore)
        const configData = computed(() => {
            return configUniqueData.value.find(i => i.uniqueId === activeTabKey.value)
        })
        const { operationList, operActiveId } = toRefs(configData.value)
        const cancel = () => {
            useModalStore.changeDeleteProgressVisible()
        }

        const updateOperateProgress = (operTempList ) => {
            let deleteIndex = deleteData.value.deleteIndex
            // 删除中间步骤
            if(deleteIndex > -1) {
                let targetIndex = operTempList.findIndex(it => it.uuid === operActiveId.value)
                // console.log('deleteIndex, targetIndex', deleteIndex, targetIndex)
                // 删除当前选中步骤 默认定位到删除位置下一步
                if(targetIndex < 0) {
                    useConfigStore.setOperActiveId(operTempList[deleteIndex].uuid, 1, activeTabKey.value)
                    useConfigStore.setShowType(operTempList[deleteIndex].id, activeTabKey.value)
                } else {
                    useConfigStore.setOperActiveId(operActiveId.value, 1, activeTabKey.value)
                }
            } else {
                // 删除最后一步
                useConfigStore.setOperActiveId(operTempList[operTempList.length - 1].uuid, 1, activeTabKey.value)
                useConfigStore.setShowType(operTempList[operTempList.length - 1].id, activeTabKey.value)
            }
            useConfigStore.editClickOperActiveId(activeTabKey.value)
            useModalStore.changeDeleteProgressVisible()
            useMainStore.setDeleteData({})
        }

        const onOk = () => {
            // TODO: 删除步骤在异常步骤之前 更新异常步骤
            useConfigStore.deleteErrorOperate(deleteData.value, activeTabKey.value)
            const operTempList = operationList.value.filter(item => item.uuid !== deleteData.value.uuid)
            useConfigStore.changeOperationList(operTempList, activeTabKey.value)
            useConfigStore.setSelfConfig(deleteData.value, 'delete', activeTabKey.value)
            useConfigStore.setTableSource(deleteData.value, 'delete', activeTabKey.value)
            useConfigStore.deleteAllConfigData(deleteData.value, activeTabKey.value)
            updateOperateProgress(operTempList)
        }
        return {
            cancel,
            onOk,
            t,
            deleteProgressVisible
        }
    },
    render() {
        const { cancel, onOk, t, deleteProgressVisible } = this
        return (
            deleteProgressVisible ? 
            <div className='delModal'>
                <div class="maskLayer"></div>
                <div class="popDiv wid400">
                    <div class="popHead">
                        <span class="popClose fr" onClick={cancel}><img style={{width: '16px'}} src={closeImg} /></span>
                        <p class="fl colorDeep">{ t('common.tip') }</p>
                    </div>
                    
                    <div className='modalBody'>
                        <span>{ t('common.confirmDelete') }</span>
                    </div>

                    <div class="popBottom shadowBox">
                    <myButton class="fr mr25" onClick={onOk} type="primary">{ t('common.delete') }</myButton>
                    <myButton class="fr mr25" onClick={cancel}>{ t('common.cancel') }</myButton>
                    </div>
                </div>
            </div> 
            : null
        )
    }
})