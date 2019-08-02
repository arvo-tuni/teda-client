<template lang="pug">
  article.message(v-if="enabled" :class="cls")
    .message-header
      p {{ message }}
      button.delete(aria-label="delete" @click="close()")
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'message',

  props: {
    type: {
      type: String,
      require: true,
    },

    message: {
      type: String,
      require: true,
    },
  },

  data() {
    return {
      enabled: !!this.message,
    };
  },

  computed: {
    cls(): any {
      return { 
        'is-danger': this.type === 'error',
        'is-success': this.type === 'success',
      }
    },
  },

  methods: {
    close() {
      this.enabled = false;
    }
  },

  watch: {
    message( val ) {
      this.enabled = !!val;
    },
  },
});

</script>

<style scoped lang="less">
.message {
  margin: 1em 0;
}
</style>
