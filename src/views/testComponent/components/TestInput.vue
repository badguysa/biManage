<script setup>
const inputVal = ref('')

const searchFn = () => {
  console.log('search...', inputVal.value)
}

const inputFn = (val, e) => {
  console.log('input', val, e)
}

</script>

<template>
  
  <div class="cpn-wrap">
    <span>input测试</span>
    <span>{{ inputVal }}</span> <br/>
    <!-- <BiInput type="text" v-model="inputVal"/> -->
    <!-- <BiInput type="password" v-model="inputVal"/> -->
    <BiInput 
      class="input1" 
      placeholder="asdfasdfasdfasdf"
      v-model="inputVal" 
      canSearch
      size="large"
      @input="inputFn"
      @search="searchFn"
    />
  </div>
</template>

<style lang='less' scoped>
  .input1{
    width: 400px;
  }
</style>