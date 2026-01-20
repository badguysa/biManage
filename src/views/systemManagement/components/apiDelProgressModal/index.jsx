import { defineComponent, computed, toRefs } from 'vue' 
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { apiConfigStore } from '@/Stores/apiConfigStore';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '@/components/buttons/myButton'
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
        const useApiConfigStore = apiConfigStore()
        const { deleteData } = storeToRefs(useMainStore)
        const { operationList, allConfigData, operActiveId } = storeToRefs(useApiConfigStore)

        const cancel = () => {
            useModalStore.changeApiDelProgressModalVisible()
        }

        const updateOperateProgress = (operTempList ) => {
            let deleteIndex = deleteData.value.deleteIndex
            // 删除中间步骤
            if(deleteIndex > -1) {
                let targetIndex = operTempList.findIndex(it => it.uuid === operActiveId.value)
                // console.log('deleteIndex, targetIndex', deleteIndex, targetIndex)
                // 删除当前选中步骤 默认定位到删除位置下一步
                if(targetIndex < 0) {
                    useApiConfigStore.setOperActiveId(operTempList[deleteIndex].uuid, 1)
                    useApiConfigStore.setShowType(operTempList[deleteIndex].id)
                } else {
                    useApiConfigStore.setOperActiveId(operActiveId.value, 1)
                }
            } else {
                // 删除最后一步
                useApiConfigStore.setOperActiveId(operTempList[operTempList.length - 1].uuid, 1)
                useApiConfigStore.setShowType(operTempList[operTempList.length - 1].id)
            }
            useApiConfigStore.editClickOperActiveId()
            useModalStore.changeApiDelProgressModalVisible()
            useMainStore.setDeleteData({})
        }
        const onOk = () => {
            useApiConfigStore.deleteErrorOperate(deleteData.value)
            const operTempList = operationList.value.filter(item => item.uuid !== deleteData.value.uuid)
            const allData = allConfigData.value.filter(item => item.uuid !== deleteData.value.uuid)
            useApiConfigStore.changeAllConfigData(allData)
            useApiConfigStore.changeOperationList(operTempList)
            useApiConfigStore.setSelfConfig(deleteData.value, 'delete')
            useApiConfigStore.setTableSource(deleteData.value, 'delete')
            // useApiConfigStore.setOperActiveId(operTempList[operTempList.length - 1].uuid)
            // useApiConfigStore.setShowType(operTempList[operTempList.length - 1].id)
            // useModalStore.changeApiDelProgressModalVisible()
            // useMainStore.setDeleteData({})
            updateOperateProgress(operTempList)
        }
        return {
            cancel,
            t,
            onOk,
        }
    },
    render() {
        const { cancel, onOk, t } = this
        return (
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
        )
    }
})