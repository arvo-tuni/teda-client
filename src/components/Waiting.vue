<template lang="pug">
  .modal.is-active(v-if="isModal")
    .modal-background
    .modal-content
      progress.progress.is-small.is-primary(v-if="isBar" max="100")
      .gif(v-else src="../assets/wait.gif")
  article.article(v-else)
    progress.progress.is-small.is-primary(v-if="isBar" max="100")
    .gif(v-else src="../assets/wait.gif")

</template>

<script>
export default {
  name: 'waiting',

  props: {
    isModal: {
      type: Boolean,
      default: false,
    },

    isBar: {
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
  margin: 2em auto;
}
progress {
  width: 100%;
}
</style>