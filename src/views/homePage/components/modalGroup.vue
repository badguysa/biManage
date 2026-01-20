<template>
    <childrenDataModal v-if="childrenDataModalVisible" />
    <tableTrendModal v-if="tableTrendModalVisible" />
    <collectionModal v-if="collectionModalVisible" />
    <interfaceDetailModal v-if="interfaceDetailModalVisible" />
</template>

<script setup>
import { storeToRefs } from 'pinia';
import childrenDataModal from './childrenDataModal'
import tableTrendModal from './tableTrendModal';
import collectionModal from './collectionModal'
import interfaceDetailModal from './interfaceDetailModal'
import { modalStore } from '@/Stores/modalStore'
const useModalStore = modalStore()
const { 
    childrenDataModalVisible, 
    tableTrendModalVisible, 
    collectionModalVisible,
    interfaceDetailModalVisible
} = storeToRefs(useModalStore)
</script>