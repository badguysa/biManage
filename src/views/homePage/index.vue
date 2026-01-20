<template>
    <div class="mainWrapper">
        <leftMenu />
        <div class="containerWrapper">
            <topTabs />
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
        <modalGroup />
    </div>
</template>

<script setup>
import leftMenu from './components/leftMenu'
import topTabs from './components/topTabs'
import modalGroup from './components/modalGroup.vue';

const useMainStore = mainStore()
const router = useRouter()
onMounted(() => {
    useMainStore.isDataMarketVisitor && router.push('/dataBoard/dataMarket')
})
</script>

<style lang="less" scoped>
.mainWrapper {
    width: 100vw;
    height: calc(100vh - 60px);
    display: flex;

    .containerWrapper {
        width: calc(100vw - 200px);
        padding: 12px;
        background-color: #f2f4fa;
    }
}
</style>