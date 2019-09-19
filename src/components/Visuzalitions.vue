<template lang="pug">
  #viualizations
    .tabs.is-centered
      ul
        li(
          v-for="tab in tabs" 
          :class="{'is-active': isTabActive( tab )}"
          @click="setTab( tab )"
        ) 
          a {{ tab }}

    slot.content

</template>

<script lang="ts">
import Vue from 'vue';

import VISUALIZATIONS from '@/core/visualizations';

interface CompData {
  tabs: {[x: string]: string};
}

/// Emits:
///   tab( name )
export default Vue.extend({
  name: 'viualizations',

  data() {
    return {
      tabs: VISUALIZATIONS,
    } as CompData;
  },

  computed: {
    activeTab(): string {
      return this.$store.state.visualizationName;
    },
  },

  methods: {
    isTabActive( tab: string ): boolean {
      return tab === this.$store.state.visualizationName;
    },

    setTab( tab: string ) {
      this.$emit( 'tab', tab );
    },
  },
});

</script>

<style scoped lang="less">
</style>
