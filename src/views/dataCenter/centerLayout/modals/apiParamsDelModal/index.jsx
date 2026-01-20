import { defineComponent, onUnmounted, nextTick } from 'vue' 
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import myButton from '../../../../../components/buttons/myButton'
import './index.less'
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: '',
    components: {
        myButton
    },
    setup() {
        const { t } = useI18n()
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const { apiParamsDelModalVisible } = storeToRefs(useModalStore)
        const { deleteData, paramSettingType, basciParamList, headParamList, pageFieldList, fieldIsEnc, secondFieldEnc, bodyParamList } = storeToRefs(useMainStore)

        const cancel = () => {
            useModalStore.changeApiParamsDelModalVisible()
        }
        const onOk = async () => {
            if (paramSettingType.value === 'headParamDel') {
                useMainStore.setHeadParamList(deleteData.value, 'del')
            } else if (paramSettingType.value === 'basicParamDel') {
                useMainStore.setBasciParamList(deleteData.value, 'del')
            } else if (paramSettingType.value === 'bodyParamDel') {
                useMainStore.setBodyParamList(deleteData.value, 'del')
            }

            await nextTick()

            let array = [] // 存放uuid

            const allList = [...basciParamList.value, ...headParamList.value, ...pageFieldList.value, ...bodyParamList.value] // 找到所有的参数

            allList.forEach(li => { // 遍历所有参数
                if (li.type === "encryption" && li.encryptionValue.values.length) {
                    const arr = li.encryptionValue.values.map(o => o.uuid)
                    array = [...array, ...arr] // 将所有被当作加密参数的uuid存起来
                }
            })

            // 如果是加密参数删除时，释放其被做为加密参数的isEnc
            if (deleteData.value.type === "encryption" && deleteData.value.encryptionValue.values.length) {
                deleteData.value.encryptionValue.values.forEach(item => {
                    allList.forEach(al => {
                        if (al.uuid === item.uuid) { // 找到被当作加密参数的参数al;
                            if (!array.includes(al.uuid)) { // 如果没有其他加密参数以这个参数加密
                                al.isEnc = false // 释放这个参数可被删除的权限
                                if (al.uuid === '123') {
                                    fieldIsEnc.value = false
                                } else if (al.uuid === '456') {
                                    secondFieldEnc.value = false
                                }
                            }
                        }
                    })
                })
            }

            useModalStore.changeApiParamsDelModalVisible()

        }
        onUnmounted(() => {
            useMainStore.setDeleteData({})
        })
        return {
            cancel,
            onOk,
            t,
            apiParamsDelModalVisible
        }
    },
    render() {
        const { cancel, onOk, t, apiParamsDelModalVisible } = this
        return (
            apiParamsDelModalVisible ? 
            <div className='apiParamsDelModal'>
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