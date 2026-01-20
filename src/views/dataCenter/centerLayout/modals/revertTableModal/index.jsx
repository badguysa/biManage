import { defineComponent, ref } from 'vue'
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import closeImg from '@/assets/icons/close.png'
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'
import { updateExcelGroup } from '@/apis/excel'
import myButton from '../../../../../components/buttons/myButton'
import './index.less'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
    name: '',
    components: {
        myButton,
    },
    props:{
        tableInfo: {
            default: {}
        },
        isBatchRevert: {
            type: Boolean,
            default: false
        },
        selectedList: {
            type: Array,
            default: []
        }
    },
    emits: ['refreshData'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const useModalStore = modalStore()
        const useMainStore = mainStore()
        const { leftMenuList } = storeToRefs(useMainStore)
        const currentSelectMenu = ref(null) // 当前选中菜单
        const cancel = () => {
            useModalStore.changeRevertModalVisible()
        }
        const onExpand = (record) => {
            record.isRevertExpand = !record.isRevertExpand
            onSelect(record)
        }
        const onSelect = (record) => {
            currentSelectMenu.value = record
        }
        const removeHandle = () => {
            if (!currentSelectMenu.value) {
                return message.warning(t('indexPage.moveItem'))
            }
            let ids = ''
            if (props.isBatchRevert) {
                ids = props.selectedList.map(item => item.id).join(',')
            } else {
                ids = props.tableInfo.id
            }
            updateExcelGroup({ids, groupId: currentSelectMenu.value.id}).then((res) => {
                if (res.code) {
                    message.success(res.message)
                    useModalStore.changeRevertModalVisible()
                    emit('refreshData')
                } else{
                    message.error(res.message)
                }
            })
        }

        return {
            cancel,
            onExpand,
            onSelect,
            currentSelectMenu,
            leftMenuList,
            removeHandle,
            t
        }
    },
    render() {
        const {
            cancel,
            onExpand,
            onSelect,
            currentSelectMenu,
            leftMenuList,
            removeHandle,
            t
        } = this
        return (
            <div className="revertTableModal">
                <div class="maskLayer"></div>
                <div class="popDiv wid472">
                    <div class="popuHead">
                        <span class="popClose fr" onClick={cancel}>
                            <img style={{ width: '16px' }} src={closeImg} />
                        </span>
                        <p class="fl colorDeep">{ t('common.revertTo') }</p>
                    </div>
                    <div className="modalBody">
                        <ul className="outUl">
                            {leftMenuList.length && leftMenuList.map((item, index) => (<>
                                <li
                                    className={
                                        currentSelectMenu && currentSelectMenu.id === item.id
                                            ? 'outLi active'
                                            : 'outLi'
                                    }
                                    onClick={() => onExpand(item)}
                                >
                                    {item.subList.length ? (
                                        <img
                                            className="lefticon"
                                            src={item.isRevertExpand ? downImg : openImg}
                                        />
                                    ) : null}
                                    <span className="text">{item.name}</span>
                                </li>
                                {item.subList.length && item.isRevertExpand ? (
                                    <ul className="innerUl">
                                        {item.subList.map((subItem) => (
                                            <li
                                                className={
                                                    currentSelectMenu && currentSelectMenu.id === subItem.id
                                                        ? 'innerLi active'
                                                        : 'innerLi'
                                                }
                                                onClick={() => {
                                                    onSelect(subItem)
                                                }}
                                            >
                                                <span className="text">{subItem.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </>))}
                        </ul>
                    </div>

                    <div class="popuBottom shadowBox">
                            <myButton class="fr mr25" onClick={cancel}>
                                { t('common.cancel') }
                            </myButton>
                            <myButton class="fr mr25" type="primary" onClick={removeHandle}>
                                { t('indexPage.move') }
                            </myButton>
                    </div>
                </div>
            </div>
        )
    },
})
