import { defineComponent, onMounted, ref, onUnmounted, reactive, watch, nextTick } from 'vue' 
import { message } from 'ant-design-vue';
import { modalStore } from '@/Stores/modalStore';
import { mainStore } from '@/Stores/mainStore'
import { addGroupApi, updateGroupApi, deleteGroupApi } from '@/apis/group';
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import uploadImg from '@/assets/Iconlibrary/tubiaoku(18).png'
import myButton from '../../../../../components/buttons/myButton'
import { useI18n } from 'vue-i18n'
import { uploadFile } from '@/apis/cloud'
import * as _ from 'loadsh'
import './index.less'

export default defineComponent({
    name: 'groupModal',
    components: {
        myButton
    },
    setup() {
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const { t } = useI18n()

        const { groupModalVisible, groupModalStatus } = storeToRefs(useModalStore)
        const { groupObject, iconPreviewUrl, leftMenuList, uploadInfo } = storeToRefs(useMainStore)
        const groupName = ref(groupModalStatus.value == 'fedit' || groupModalStatus.value == 'fdelete' ? groupObject.value.outItem.name : (groupModalStatus.value == 'cedit' || groupModalStatus.value == 'cdelete' ? groupObject.value.innerItem.name : ''))
        const count = ref(3)
        // 启动倒计时的逻辑（在需要时调用）  
        let stopCountdown = null;  
        onUnmounted(() => {
            useMainStore.setIconPreviewUrl('')
        })
        watch(() => groupModalVisible.value ,async (newVal)=>{
            if(newVal && (groupModalStatus.value == 'fdelete' || groupModalStatus.value == 'cdelete')){
                // 清除之前的倒计时（如果有的话）  
                if (stopCountdown) {  
                    stopCountdown();  
                }  
                // 启动新的倒计时  
                await nextTick()
                stopCountdown = countdown();
            }
        },{
            immediate: true
        })
        const countdown = () => {  
            // 显示当前倒计时的函数  
            function displayCount() {  
                // 如果倒计时还没有结束，继续倒计时  
                if (count.value > 0) {  
                    count.value--;
                } else {  
                    // 倒计时结束，清除定时器  
                    clearInterval(timer);  
                }  
            }  
            // 创建一个定时器，每秒执行一次displayCount函数  
            let timer = setInterval(displayCount, 1000);  
            // 返回一个函数来清除定时器（如果需要的话）  
            return function stopCountdown() {  
                clearInterval(timer);  
            };  
        }  
        const cancel = () => {
            useModalStore.changeGroupModalVisible('')
        }
        const showIconModal = () => {
            useModalStore.changeIconModalVisible()
        }
        const onOK = _.debounce(() => {
            if (!groupName.value && groupModalStatus.value.indexOf('delete') === -1) return message.warn(t('group.enterGroupName'))
            const v = groupModalStatus.value
            if (v == 'default' || v == 'fadd') {
                let itemSort = ''
                if (leftMenuList.value.length > 0) {
                    if (leftMenuList.value[leftMenuList.value.length - 1]) {
                        itemSort = leftMenuList.value[leftMenuList.value.length - 1].sort
                    }
                } else {
                    itemSort = 1
                }
                // console.log('父级添加');
                const jsonData = {
                    icon: iconPreviewUrl.value,
                    name: groupName.value,
                    pid: '-1',
                    sort: Number(itemSort) + 1,
                    xpath: `-1`
                }
                addGroupApi(jsonData).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useMainStore.loadLeftMenuList('update')
                        useModalStore.changeGroupModalVisible('')
                    } else {
                        message.error(res.message)
                    }
                })
            } else if (v == 'cadd') {
                // 子级添加
                const jsonData = {
                    icon: '',
                    name: groupName.value,
                    pid: groupObject.value.outItem.id,
                    sort: groupObject.value.outItem.subList.length + 1,
                    xpath: `-1/${groupObject.value.outItem.id}`
                }
                addGroupApi(jsonData).then(async (res) => {
                    if (res.code == 1) {
                        message.success(res.message)
                        await useMainStore.loadLeftMenuList('update')
                        // 添加子级分组 传递 ADD_CHILD_CB
                        useModalStore.changeGroupModalVisible('', 'ADD_CHILD_CB')
                    } else {
                        message.error(res.message)
                    }
                })
            } else if (v == 'fedit') {
                // console.log('父级修改');
                const jsonData = {
                    icon: iconPreviewUrl.value || groupObject.value.outItem.icon,
                    name: groupName.value,
                    id: groupObject.value.outItem.id,
                    pid: '-1',
                    sort: groupObject.value.outItem.sort,
                    xpath: `-1`
                }
                updateGroupApi(jsonData).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useMainStore.loadLeftMenuList('update')
                        useModalStore.changeGroupModalVisible('')
                    } else {
                        message.error(res.message)
                    }
                })
            } else if (v == 'fdelete' || v == 'cdelete') {
                let jsonData = { }
                if (v == 'fdelete') {
                    jsonData = {
                        ids: groupObject.value.outItem.id
                    }
                } else {
                    jsonData = {
                        ids: groupObject.value.innerItem.id
                    }
                }
                deleteGroupApi(jsonData).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useMainStore.loadLeftMenuList('update')
                        useModalStore.changeGroupModalVisible('')
                        useMainStore.changeTabsList({
                            id: jsonData.ids
                        }, 'close')
                    } else {
                        message.error(res.message)
                    }
                })
                console.log('删除', );
            } else if (v == 'cedit') {
                // console.log('子级修改');
                const jsonData = {
                    icon: '',
                    name: groupName.value,
                    id: groupObject.value.innerItem.id,
                    pid: groupObject.value.innerItem.pid,
                    sort: groupObject.value.innerItem.sort,
                    xpath: `-1/${groupObject.value.innerItem.pid}`
                }
                updateGroupApi(jsonData).then(res => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useMainStore.loadLeftMenuList('update')
                        useModalStore.changeGroupModalVisible('')
                    } else {
                        message.error(res.message)
                    }
                })
            }
        },300, {
            leading: true,  // 延迟开始前调用
            trailing: false // 延迟结束后调用
        })
        const iptChange = (e) => {
            groupName.value = e.target.value.trim()
        }
        const showUploadPage = () => {
            document.getElementById('uploadIpt').click()
        }
        const uploadInputChange = (event) => {
            if (!event.target.files[0].type.includes('image')) return message.warn(t('group.uploadImg'))
            const formData = new FormData()
            const jsonData = {
                puid: uploadInfo.value.puid,
                _token: uploadInfo.value.token,
            }
            for (let key in jsonData) {
                formData.append(key, jsonData[key])
            }
            formData.append('file', event.target.files[0])
            uploadFile(formData)
                .then((res) => {
                    if (res.data && res.data.result) {
                        useMainStore.setIconPreviewUrl(res.data.data.previewUrl)
                    }
                })
                .catch((e) => {
                    console.log(e)
                })
        }
        return {
            groupModalVisible,
            groupModalStatus,
            groupObject,
            iconPreviewUrl,
            groupName,
            count,
            cancel,
            showIconModal,
            onOK,
            iptChange,
            showUploadPage,
            uploadInputChange,
            t
        }
    },
    render() {
        const { groupModalVisible, groupModalStatus, groupObject, iconPreviewUrl, groupName, count } = this
        const { cancel, showIconModal, onOK, iptChange, showUploadPage, uploadInputChange, t } = this
        return (
            groupModalVisible ? 
            <div className='groupModal'>
                <div class="maskLayer"></div>
                <div class={ (groupModalStatus.indexOf('delete') > -1) ? "popDiv wid400" : "popDiv wid480"}>
                    <div class="popHead">
                        <span class="popClose fr" onClick={cancel}><img style={{width: '16px'}} src={closeImg} /></span>
                        <p class="fl fs18 colorDeep">{ (groupModalStatus.indexOf('delete') > -1) ? t('common.delete') : ((groupModalStatus.indexOf('edit') > -1) ? t('group.editGroup') : t('group.addgroup'))}</p>
                    </div>
                    {
                        (groupModalStatus.indexOf('delete') > -1) ? 
                        <div className='delbox'> { t('group.deleteGroupTip') }{ t('group.deleteGroup')}<span className='text'>{groupName}</span>?</div> :
                        <div className='modalBody'>
                            { (groupModalStatus == 'fadd' || groupModalStatus == 'fedit' || groupModalStatus == 'default') ?
                            <><div className='row'>
                                <div className='col1'>{t('group.groupIcon')}</div>
                                <div className='col2'>
                                    <div className='iconImg' onClick={showIconModal}><img  style={{width: '32px', height: '32px', cursor: 'pointer'}} src={ (groupModalStatus == 'fedit' && !iconPreviewUrl ) ?  groupObject.outItem.icon || (iconPreviewUrl || uploadImg) : (iconPreviewUrl || uploadImg) } alt="" /></div>
                                    <myButton onClick={showIconModal} class="ml20 iconBtn">{t('group.iconLib')}</myButton>
                                    <myButton onClick={showUploadPage} class="ml20 uploadBtn">{ t('common.upload') }</myButton>
                                    <input onChange={uploadInputChange} type="file" accept="image/png,image/gif,image/jpeg" name="" id="uploadIpt" style={{ display: 'none' }} />
                                </div>
                            </div>
                            <div className='row mt10mb16'>
                                <div></div>
                                <div>{ t('group.iconTip') }</div>
                            </div></>
                            : null
                            }
                            <div className='row'>
                                <div className='col1'>{ t('group.groupName') }</div>
                                <div className='col2'>
                                    <input type="text" onChange={iptChange} value={groupName}  placeholder={t('common.pleaseEnter')} />
                                </div>
                            </div>
                        </div>
                    }

                    <div class="popBottom shadowBox">
                    {
                        groupModalStatus == 'fdelete' || groupModalStatus == 'cdelete' ?
                        <myButton class="fr mr25" disabled={count>0 ? true : false}  onClick={onOK} type="primary">{ count ? `${t('common.confirm')} (${count})`: `${t('common.confirm')}` }</myButton>
                        :
                        <myButton class="fr mr25" onClick={onOK} type="primary">{`${t('common.confirm')}` }</myButton>
                    }
                    <myButton class="fr mr25"  onClick={cancel}>{  t('common.cancel')}</myButton>
                    </div>
                </div>
            </div> 
            : null
        )
    }
})