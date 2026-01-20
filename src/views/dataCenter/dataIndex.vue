<template>
    <div class="main-center">
        <div class="left-menu">
            <div class="add" @click="showgroupModal">
                <img src="@/assets/icons/circle_Add.png" alt="" srcset="">
                <div class="text">{{ t('group.addgroup') }}</div>
            </div>
            <leftMenu v-if="renderLeftMenu"/>
        </div>
        <div>
            <mainPages />
        </div>
    </div>
</template>

<script setup>
import leftMenu from './leftLayout/leftMenu.vue';
import mainPages from './centerLayout/mainPages.vue';
import { storeToRefs } from 'pinia';
import { modalStore } from '../../Stores/modalStore'
import { mainStore } from '@/Stores/mainStore'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue';
const { t } = useI18n()
const useModalStore = modalStore()
const useMainStore = mainStore()
const { accessConfig } = storeToRefs(useMainStore)
const renderLeftMenu = ref(false)
const showgroupModal = () => {
    if (accessConfig.value.addGroupAuth) {
        if (accessConfig.value.addGroupAuth.use == 0) {
            return message.error(t('common.noAuth'))
        }
    }
    useModalStore.changeGroupModalVisible('default')
}

onMounted(async () => {
    // 参数数据获取完毕之后 渲染菜单组件
    try{
        await useMainStore.loadLeftMenuList()
        renderLeftMenu.value = true
    } catch(e) {
        console.log('e', e)
    } finally {
        renderLeftMenu.value = true
    }
    useMainStore.loadRecylceData()
})
</script>

<style lang="less" scoped>
.main-center {
    display: grid;
    grid-template-columns: 200px auto;

    .left-menu {
        background: url(../../assets/images/leftback.png);
        background-size: cover;
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        align-items: center;

        .add {
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 8px 16px;
            gap: 8px;
            height: 32px;
            width: 164px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            flex: none;
            order: 0;
            flex-grow: 0;
            cursor: pointer;

            img {
                width: 16px;
            }

            .text {
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;
                color: #FFFFFF;
                flex: none;
                order: 1;
                flex-grow: 0;
            }
        }

        .add:hover {
            width: 164px;
            height: 32px;
            cursor: pointer;
            opacity: 0.9;
        }
    }
}
</style>