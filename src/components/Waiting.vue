<template lang="pug">
    .modal.is-active
      .modal-background
      .modal-content
        p.image
          .gif(src="../assets/wait.gif")
</template>

<script>
export default {
  name: 'waiting',

  props: {
    isModal: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="less" scoped>
    .gif {
      background: url("../assets/wait.gif") no-repeat center;
      width: 64px;
      height: 64px;
      margin: 0 auto;
    }
</style>