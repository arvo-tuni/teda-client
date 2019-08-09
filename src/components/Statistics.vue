<template lang="pug">
  #statistics
    p not implemented
</template>

<script lang="ts">
import Vue from 'vue';

import * as Transform from '@/core/transform';

interface CompData {
  fixations: Transform.Fixation[] | null;
}

export default Vue.extend({
  name: 'statistics',

  data() {
    return {
      fixations: null,
    } as CompData;
  },

  computed: {
  },

  methods: {
  },
});

</script>

<style scoped lang="less">
#statistics {
  margin: 1em;
}
</style>
