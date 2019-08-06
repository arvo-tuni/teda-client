<template lang="pug">
  #fixplot
    p not implemented
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';

interface CompData {
}

export default Vue.extend({
  name: 'fixations-plot',

  data() {
    return {
    } as CompData;
  },

  props: {
    trial: {
      type: String,
      required: true,
    },
  },

  computed: {
  },

  methods: {
  },

  created() {
  },
});

</script>

<style scoped lang="less">
#fixplot {
  margin: 1em;
}
</style>
