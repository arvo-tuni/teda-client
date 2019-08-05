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

interface Data {
  tabs: any;
  activeTab: string;
}

/// Emits:
///   tab( name )
export default Vue.extend({
  name: 'viualizations',

  data() {
    const r: Data = {
      tabs: VISUALIZATIONS,
      activeTab: '',
    };
    return r;
  },

  computed: {
  },

  methods: {
    isTabActive( tab: string ): boolean {
      return tab === this.activeTab;
    },

    setTab( tab: string ) {
      this.activeTab = tab;
      this.$emit( 'tab', tab );
    },
  },
});

</script>

<style scoped lang="less">
#viualizations {
  margin: 1em;
}
</style>
