<template>
  <img class="loading" src="@/assets/icons/loading.png" alt="">
</template>

<style lang='less' scoped>
.loading{
  width: 20px;
  height: 20px;
  animation: animate .8s infinite linear;
  margin-right: 8px;
}

@keyframes animate {
  from{
    rotate: 0;
  }
  to{
    rotate: 360deg;
  }
}
</style>