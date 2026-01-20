<script setup>

</script>

<template>
  <div class="cpn-wrap">
    <span>button测试</span><br/>
    <BiButton>确定</BiButton>
    <BiButton type="primary" size="large">
      <template #icon>
        <BiIcon name="form" color="#fff"/>
      </template>
      确定
    </BiButton>
    <BiButton size="large">确定</BiButton>
  </div>
</template>