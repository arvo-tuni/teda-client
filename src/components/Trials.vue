<template lang="pug">
  nav#trials.panel
    p.panel-heading trials
    a.panel-block(
      v-for="trial in trials" 
      :key="trial._id" 
      :class="{'is-active': isSelected( trial ), 'is-active-bg': isSelected( trial )}"
      @click="select( trial )"
    )
      .panel-icon
        i.fas.fa-book(aria-hidden="true")
      .has-text-left
        .trial-info.is-flex
          span {{ trial.participant }}
          span.has-text-weight-bold {{ trial.type }}
        .timestamp {{ formatDate( trial.timestamp ) }}
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import { toDate } from '@/core/format';

interface Data {
  trials: Defs.TrialMeta[];
  selected: Defs.TrialMeta | null;
}

/// Emits:
///   selected( trial.id )
export default Vue.extend({
  name: 'trials',

  data() {
    const r: Data = {
      trials: [],
      selected: null,
    };
    return r;
  },

  methods: {
    isSelected( trial: Defs.TrialMeta ) {
      return this.selected === trial;
    },

    formatDate( value: string ) {
      return toDate( value );
    },

    select( trial: Defs.TrialMeta ) {
      this.selected = trial;
      this.$emit( 'selected', trial._id );
    },
  },

  created() {
    Data.trials()
      .then( (trials: Defs.TrialMeta[]) => {
        this.trials = trials;
      });
  }
});

</script>

<style scoped lang="less">
#trials {
  margin: 1em auto;
}
.trial-info {
  span {
    margin: 0 1em 0 0;
  }
}
.is-active-bg {
  background-color: hsl(80, 80%, 80%);
}
.timestamp {
  font-style: italic;
  font-size: smaller;
}
</style>
