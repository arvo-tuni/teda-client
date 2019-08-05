<template lang="pug">
  #fixplot
    button.button fixplot
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';

interface Data {
}

export default Vue.extend({
  name: 'fixations-plot',

  data() {
    const r: Data = {
    };
    return r;
  },

  computed: {
  },

  methods: {
  },

  created() {
    Data
  }
});

</script>

<style scoped lang="less">
#fixplot {
  margin: 1em;
}
</style>
