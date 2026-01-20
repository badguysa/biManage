<template>
    <div class="mainWrapper">
        <leftMenu />
        <div class="containerWrapper">
            <topTabs />
            <!-- <router-view/> -->
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>

<script setup>
import leftMenu from './components/leftMenu.vue'
import topTabs from './components/topTabs.vue'

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
