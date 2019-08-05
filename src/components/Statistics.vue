<template lang="pug">
  #statistics
    button.button statistics
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
}

export default Vue.extend({
  name: 'statistics',

  data() {
    const r: Data = {
    };
    return r;
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
