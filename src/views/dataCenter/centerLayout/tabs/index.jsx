import { defineComponent, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { mainStore } from '@/Stores/mainStore';
import { configStore } from '@/Stores/configStore';
import closeImg from '@/assets/icons/tabclose.png'
import './index.less'
import { Tooltip } from 'ant-design-vue';


export default defineComponent({
    name: 'tabs',
    setup() {
        const useMainStore = mainStore()
        const useConfigStore = configStore()
        const { tabsList, activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)
        const activeTableId = computed(() => {
            let activeData = {}
            if (indexTableActiveId.value.length) {
                activeData = indexTableActiveId.value.find(i => i.tabId === activeTabKey.value)
            }
            if (activeData) {
                return activeData.id
            } 
            return ''
        })
        const onClose = (e, tab) => {
            e.stopPropagation()
            if (tabsList.value.length === 1) return
            const tabIndex = tabsList.value.findIndex(i => i.id === tab.id)
            useMainStore.changeTabsList(tab, 'close')
            useConfigStore.updateConfigUniqueData(tab.id, 'delete')
            // 如果关闭tab页类型为更新记录类型 展示主页
            let lastTab = tabsList.value[tabIndex] ? tabsList.value[tabIndex] : tabsList.value[tabsList.value.length-1]
            if(lastTab.type === 'updateRecord') {
                // 更新记录tab页id
                useMainStore.setUpdateRecordTabId(lastTab.tableId)
            }
            if (lastTab.type === 'updateRecord' || lastTab.type === 'pageConfig' || lastTab.type === 'pageBin') {
                // 切换展示页
                useMainStore.setPageId(lastTab.type)
            } else if(lastTab.type === 'dataDictionary') {
                useMainStore.setDataDictionaryTabId(lastTab.tableId)
                useMainStore.setPageId('dataDictionary')
            } else if(lastTab.type === 'bloodRelation') {
                useMainStore.setPageId('bloodRelation')
            } else{
                useMainStore.setPageId('pageTable')
            }
            const activeData = indexTableActiveId.value.find(i => i.tabId === lastTab.id)
            // 如果该分组下有被选中的表，切换到的时候对表格进行初始化
            if (activeData) {
                useMainStore.getIndexTable({
                    id: activeData.id
                })
            }
        }
        const changeActiveKey = (e, tab) => {
            e.preventDefault()
            if (activeTabKey.value === tab.id) return
            useMainStore.selectTabs(tab)

            // 如果tab页类型为更新记录类型 展示更新记录页
            if(tab.type === 'updateRecord'){
                // 更新记录tab页id
                useMainStore.setUpdateRecordTabId(tab.tableId)
                // 切换展示页
                useMainStore.setPageId('updateRecord')
            } else if (tab.type === 'pageConfig' || tab.type === 'pageBin') {
                useMainStore.setPageId(tab.type)
            } else if(tab.type === 'dataDictionary'){   
                //数据字典tab页
                // 更新记录tab页id
                useMainStore.setDataDictionaryTabId(tab.tableId)
                // 切换展示页
                useMainStore.setPageId('dataDictionary')
            }  else if(tab.type === 'bloodRelation'){
                useMainStore.setPageId('bloodRelation')
            }else {
                // 如果该分组下有被选中的表，切换到的时候对表格进行初始化
                if (activeTableId.value) {
                    useMainStore.getIndexTable({
                        id: activeTableId.value
                    })
                }
                useConfigStore.goBack(activeTabKey.value)
                useMainStore.setPageId('pageTable')
            }
        }
        return {
            tabsList,
            activeTabKey,
            onClose,
            changeActiveKey
        }
    },
    render() {
        const { tabsList, activeTabKey } = this
        const { onClose, changeActiveKey } = this
        return (
            <div className='toptabs'>
                {
                    tabsList.length ? tabsList.map(item => (
                        <Tooltip 
                            title={item.name} 
                            getPopupContainer={(triggerNode) => triggerNode.parentNode} placement={'top'}
                        >
                            <div>
                                <div 
                                    onClick={(e) => changeActiveKey(e, item)} 
                                    className={activeTabKey === item.id ? 'tab' : 'tab shadow'} 
                                    key={item.id}
                                >
                                    <div className='text'>
                                        {item.name}
                                    </div>
                                    {
                                        tabsList.length > 1 ?
                                        <img onClick={e => onClose(e, item)} src={closeImg} alt="" /> : null
                                    }
                                    
                                </div>
                            </div>
                        </Tooltip>
                    )) : null
                }
            </div>
        )
    }
})
