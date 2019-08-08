<template lang="pug">
  input.slider(type="range" :min="min" :max="max" :value="value" @input="setInput")
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'slider',

  props: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    value: {
      type: Number,
      default: 50,
    },
    size: {
      type: String,
      default: '2.25em',
    },
  },

  methods: {
    setInput( e: Event ) {
      this.$emit( 'input', (e.target as HTMLInputElement).value );
    }
  },

  mounted() {
    (this.$el as HTMLElement).style.setProperty( '--size', this.size );
  },
});
</script>

<style scoped lang="less">
.slider {
  --size: 1.25em;
  --color: hsl(0, 0%, 21%);

  -webkit-appearance: none;
  width: 100%;
  height: var(--size);
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &:hover {
    opacity: 1;
  }

  &.is-round {
    border-radius: calc( var(--size) / 2 );
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--size);
    height: var(--size);
    background: var(--color);
    cursor: pointer;
  }

  &.is-round::-webkit-slider-thumb {
    border-radius: 50%;
  }

  ::-moz-range-thumb {
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--color);
    cursor: pointer;
  }

  &.is-round::-moz-slider-thumb {
    border-radius: 50%;
  }

  &.is-primary {
    --color: hsl(171, 100%, 41%);
  }

  &.is-info {
    --color: hsl(204, 86%, 53%);
  }

  &.is-link {
    --color: hsl(217, 71%, 53%);
  }

  &.is-success {
    --color: hsl(141, 71%, 48%);
  }

  &.is-warning {
    --color: hsl(48, 100%, 67%);
  }

  &.is-danger {
    --color: hsl(348, 100%, 61%);
  }
}
</style>
