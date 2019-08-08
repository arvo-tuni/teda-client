<template lang="pug">
  .bulma-checkbox(@click="toggle")
    .button.is-primary.is-inverted(:disabled="disabled")
      .icon(v-show="checked")
        i.fa.fa-check
    label(:disabled="disabled") {{ label }}
</template>

<script lang="ts">
/**
 * @fires input
 */
export default {
  name: 'bulma-checkbox',

  data() {
    return {
      checked: !!this.value || false,
    };
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '2.25em',
    },
  },

  methods: {
    /** @param {Event} e */
    toggle( e ) {
      if ( this.disabled ) {
        return;
      }

      this.checked = !this.checked;
      this.$emit( 'input', this.checked );
    },

  },

  watch: {
    value( val: boolean ) {
      this.checked = val;
    }
  },

  mounted() {
    (this.$el as HTMLElement).style.setProperty( '--size', this.size );
  },
};
</script>

<style lang="less" scoped>
  .bulma-checkbox {
    --size: 2.25em;

    position: relative;
    line-height: var(--size);
    height: var(--size);

    .button {
      position: absolute;
      left: 0;
      top: 0;
      height: var(--size);
      width: var(--size);

      border: 1px solid #dbdbdb;
      border-radius: 3px;

      &[disabled] {
        cursor: not-allowed;
        background-color: white;
        border-color: #dbdbdb;
        box-shadow: none;
        opacity: 0.5;
      }
    }

    label {
      display: inline-block;

      line-height: calc( var(--size) - 0.5em );
      padding: 0.25em 0.5em 0.25em calc( var(--size) + 0.25em );
      cursor: pointer;

      &[disabled] {
        cursor: not-allowed;
        color: #7a7a7a;
      }
    }
  }

</style>
