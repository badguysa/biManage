import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { modalStore } from '@/Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { storeToRefs } from 'pinia'
import { addGroupApi } from '@/apis/group'
import { updateExcelGroup } from '@/apis/excel'
import closeImg from '@/assets/icons/close.png'
import openImg from '@/assets/icons/openright.png'
import downImg from '@/assets/icons/downone.png'
import myButton from '../../../../../components/buttons/myButton'
import okImg from '@/assets/icons/sureEdit.png'
import cancelImg from '@/assets/icons/cancelEdit.png'
import addImg from '@/assets/icons/add_relation.png'
import './index.less'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
    name: 'moveTableModal',
    components: {
        myButton,
    },
    setup() {
        const { t } = useI18n()
        const useModalStore = modalStore()
        const { moveTableModalVisible, moveItem } = storeToRefs(useModalStore)
        const useMainStore = mainStore()
        const { leftMenuList, activeTabKey, indexTableActiveId } = storeToRefs(useMainStore)

        const newGroupName = ref(t('group.newGroup'))
        const newGroupChildName = ref(t('group.newGroup'))

        const isShowNewGroup = ref(false)
        const isShowNewChildGroup = ref(false)

        const currentSelectMenu = ref(null) // 当前选中菜单

        const currentSelectChildIndex = ref(-1) // 当前选中子菜单父级索引

        onMounted(() => {
            // console.log('moveItem', moveItem)
            // console.log('leftMenuList', leftMenuList)
            document.body.style.overflow = 'hidden'
        })
        onBeforeUnmount(() => {
            document.body.style.overflow = ''
        })
        const cancel = () => {
            useModalStore.changeMoveTableModalVisible()
        }
        const onExpand = (record) => {
            record.isModalExpanded = !record.isModalExpanded
            onSelect(record)
        }
        const onSelect = (record) => {
            currentSelectMenu.value = record
        }
        const onRename = (record, type) => {
            console.log('.......')
            // if (type === 1) {
            //     record.isModalRename = !record.isModalRename
            // } else {
            //     record.isModalChildRename = true
            // }
        }

        const removeHandle = () => {
            if (!currentSelectMenu.value) {
                return message.warning(t('indexPage.moveItem'))
            }

            updateExcelGroup({ids: moveItem.value.id, groupId: currentSelectMenu.value.id}).then((res) => {

                // 重置当前tab页选中表id
                let currentTab = indexTableActiveId.value.find(it => it.tabId === activeTabKey.value)
                if(currentTab) {
                    currentTab.id = ''
                }

                if (res.code) {
                    message.success(res.message)
                    useMainStore.loadLeftMenuList()
                    useMainStore.selectTabs({
                        id: activeTabKey.value,
                    })
                    useModalStore.changeMoveTableModalVisible()
                } else{
                    message.error(res.message)
                }
            })
        }

        // 添加同级分组
        const addGroup = () => {
            // 判断当前是否未选中菜单或者选中菜单是否为根菜单
            let isRoot = !currentSelectMenu.value || currentSelectMenu.value.pid === '-1'

            // 展示一级菜单新增分组
            if (isRoot) {
                isShowNewGroup.value = true
            } else {
                // 查找当前选中子菜单父级菜单索引
                currentSelectChildIndex.value = leftMenuList.value.findIndex(
                    (menu) => menu.id === currentSelectMenu.value.pid
                )
                // 展示子级菜单新增分组
                isShowNewChildGroup.value = true
            }
        }

        // 添加子级分组
        const addChildGroup = () => {
            // 更新索引
            currentSelectChildIndex.value = leftMenuList.value.findIndex(
                (menu) => menu.id === currentSelectMenu.value.id
            )
            // 展示子级菜单新增分组
            isShowNewChildGroup.value = true
            // 展开一级菜单
            currentSelectMenu.value.isModalExpanded = true
        }

        const nameChangeHandle = (type, e) => {
            let value = e.target.value
            if (type === 'root') {
                newGroupName.value = value
            } else {
                newGroupChildName.value = value
            }
            // console.log(type, value)
        }

        // 确定编辑回调
        const confirmEdit = (type) => {
            // 新增小组接口传参
            const addConfig = {
                icon: '',
                name: '',
                pid: '-1',
                sort: '0',
                xpath: '-1',
            }

            if (type === 'root') {
                addConfig.name = newGroupName.value.trim()
            } else {
                // 如果当前选中菜单为一级菜单 pid就为当前选中菜单id
                let pid =
                    currentSelectMenu.value.pid === '-1' ? currentSelectMenu.value.id : currentSelectMenu.value.pid
                addConfig.name = newGroupChildName.value.trim()
                addConfig.pid = pid
                addConfig.xpath = `-1/${pid}`
            }

            if (!addConfig.name) {
                return message.warning(t('group.enterGroupName'))
            }

            addGroupApi(addConfig)
                .then((res) => {
                    if (res.code == 1) {
                        message.success(res.message)
                        useMainStore.loadLeftMenuList()
                    } else {
                        message.error(res.message)
                    }
                })
                .finally(() => {
                    // 关闭新增分组
                    if (type === 'root') {
                        isShowNewGroup.value = false
                    } else {
                        isShowNewChildGroup.value = false
                    }
                })
        }

        // 取消编辑回调
        const cancelEdit = (type) => {
            if (type === 'root') {
                isShowNewGroup.value = false
            } else {
                isShowNewChildGroup.value = false
            }
        }

        // 判断是否展示一级菜单新增分组
        const showNewGroup = () => {
            if (isShowNewGroup.value) {
                return (
                    <div className="newGroupItem">
                        <input
                            type="text"
                            value={newGroupName.value}
                            onInput={(e) => {
                                nameChangeHandle('root', e)
                            }}
                        />
                        <img
                            src={okImg}
                            alt="confirm"
                            onClick={() => {
                                confirmEdit('root')
                            }}
                        />
                        <img
                            src={cancelImg}
                            alt="cancel"
                            onClick={() => {
                                cancelEdit('root')
                            }}
                        />
                    </div>
                )
            }
        }

        //判断是否展示子级菜单新增分组
        const showNewChildGroup = (index) => {
            // 显示子菜单新增分组 并且父级索引和当前选中子菜单父级索引相同
            let flag = isShowNewChildGroup.value && currentSelectChildIndex.value === index
            if (flag) {
                return (
                    <div className="newGroupItem">
                        <input
                            type="text"
                            value={newGroupChildName.value}
                            onInput={(e) => {
                                nameChangeHandle('child', e)
                            }}
                        />
                        <img
                            src={okImg}
                            alt="confirm"
                            onClick={() => {
                                confirmEdit('child')
                            }}
                        />
                        <img
                            src={cancelImg}
                            alt="cancel"
                            onClick={() => {
                                cancelEdit('child')
                            }}
                        />
                    </div>
                )
            }
        }

        return {
            cancel,
            onExpand,
            onSelect,
            onRename,
            moveTableModalVisible,
            currentSelectMenu,
            isShowNewGroup,
            leftMenuList,
            addGroup,
            newGroupName,
            newGroupChildName,
            addChildGroup,
            removeHandle,
            nameChangeHandle,
            confirmEdit,
            cancelEdit,
            showNewGroup,
            showNewChildGroup,
            t
        }
    },
    render() {
        const {
            cancel,
            onExpand,
            onSelect,
            onRename,
            moveTableModalVisible,
            currentSelectMenu,
            isShowNewGroup,
            leftMenuList,
            addGroup,
            newGroupName,
            newGroupChildName,
            addChildGroup,
            removeHandle,
            nameChangeHandle,
            confirmEdit,
            cancelEdit,
            showNewGroup,
            showNewChildGroup,
            t
        } = this
        return moveTableModalVisible ? (
            <div className="moveTableModal">
                <div class="maskLayer"></div>
                <div class="popDiv wid472">
                    <div class="popuHead">
                        <span class="popClose fr" onClick={cancel}>
                            <img style={{ width: '16px' }} src={closeImg} />
                        </span>
                        <p class="fl colorDeep">{ t('indexPage.moveTo') }</p>
                    </div>
                    <div className="modalBody">
                        <ul className="outUl">
                            {/* 展示一级菜单新增分组 */}
                            {showNewGroup()}
                            {leftMenuList.length
                                ? leftMenuList.map((item, index) => (
                                      <>
                                          <li
                                              className={
                                                  currentSelectMenu && currentSelectMenu.id === item.id
                                                      ? 'outLi active'
                                                      : 'outLi'
                                              }
                                              onClick={() => onExpand(item)}
                                              onDblclick={() => {
                                                  onRename(item, 1)
                                              }}
                                          >
                                              {item.subList.length ? (
                                                  <img
                                                      className="lefticon"
                                                      src={item.isModalExpanded ? downImg : openImg}
                                                  />
                                              ) : null}
                                              {item.isModalRename ? (
                                                  <span>
                                                      <input type="text" name="" id="" /> <img src={okImg} alt="" />
                                                      <img src={cancelImg} alt="" />
                                                  </span>
                                              ) : (
                                                  <span className="text">{item.name}</span>
                                              )}
                                          </li>
                                          {item.subList.length && item.isModalExpanded ? (
                                              <ul className="innerUl">
                                                  {/* 展示子菜单新增分组 */}
                                                  {showNewChildGroup(index)}
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
                                                          onDblclick={() => {
                                                              onRename(subItem)
                                                          }}
                                                      >
                                                          <span className="text">{subItem.name}</span>
                                                      </li>
                                                  ))}
                                              </ul>
                                          ) : null}
                                          {/* 不含子菜单的一级菜单添加二级菜单 */}
                                          {!item.subList.length ? showNewChildGroup(index):''}
                                      </>
                                  ))
                                : null}
                        </ul>
                    </div>

                    <div class="popuBottom shadowBox">
                        <div className="addGroup">
                            <div className="addItem" onClick={addGroup}>
                                <img src={addImg} alt="new" />
                                <span>{ t('group.peerGroup') }</span>
                            </div>
                            <div
                                className={
                                    currentSelectMenu && currentSelectMenu.pid === '-1'
                                        ? 'addItem'
                                        : 'addItem addItemDisabled'
                                }
                                onClick={addChildGroup}
                            >
                                <img src={addImg} alt="new" />
                                <span>{ t('group.childGroup') }</span>
                            </div>
                        </div>
                        <span>
                            <myButton class="fr mr25" type="primary" onClick={removeHandle}>
                                { t('indexPage.move') }
                            </myButton>
                            <myButton class="fr mr25" onClick={cancel}>
                                { t('common.cancel') }
                            </myButton>
                        </span>
                    </div>
                </div>
            </div>
        ) : null
    },
})
