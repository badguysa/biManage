<script setup>
import TestInput from './components/TestInput'
import TestButton from './components/TestButton'
import TestTable from './components/TestTable'
import TestTree from './components/TestTree'
import TestTableTree from './components/TestTableTree.vue'
import TestCheckbox from './components/TestCheckbox.vue'
import TestFilterColumn from './components/TestFilterColumn.vue'
</script>

<template>
  <div class="main-wrap">
    <!-- <TestInput /> -->
    <!-- <TestButton/> -->
    <TestTable />
    <!-- <TestTree /> -->
    <!-- <TestCheckbox /> -->
    <!-- <TestFilterColumn /> -->
     <TestTableTree/>
  </div>
</template>

<style lang="less" scoped>
.main-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 50px;
  .input1 {
    width: 400px;
  }
  .cpn-wrap {
    margin-bottom: 50px;
  }
}
</style>
