<template lang="pug">
  article.message(v-if="enabled" :class="cls")
    .message-header
      p {{ message }}
      button.delete(v-if="!autoHide" aria-label="delete" @click="close()")
</template>

<script lang="ts">
import Vue from 'vue';

const AUTO_HIDE_INTERVAL = 3000; // ms

interface CompData {
  enabled: boolean;
  timer: NodeJS.Timeout | null;
}

/// Emits:
///   closed() - closed manually
export default Vue.extend({
  name: 'message',

  props: {
    type: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    autoHide: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  data() {
    return {
      enabled: !!this.message,
      timer: null,
    } as CompData;
  },

  computed: {
    cls(): any {
      return {
        'is-danger': this.type === 'error',
        'is-success': this.type === 'success',
      };
    },
  },

  methods: {
    close() {
      this.enabled = false;

      if (this.timer) {
        clearTimeout( this.timer );
        this.timer = null;
      }

      if (!this.autoHide) {
        this.$emit( 'closed' );
      }
    },
  },

  watch: {
    message( val ) {
      this.enabled = !!val;

      if (this.autoHide) {
        if (this.timer) {
          clearTimeout( this.timer );
          this.timer = null;
        }

        if (this.enabled) {
          this.timer = setTimeout( () => {
            this.enabled = false;
            this.timer = null;
          }, AUTO_HIDE_INTERVAL );
        }
      }
    },
  },
});

</script>

<style scoped lang="less">
.message {
  margin: 1em 0;
}
</style>
