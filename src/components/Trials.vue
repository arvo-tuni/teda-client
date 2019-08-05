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
      .trial
        .trial-info.is-flex
          span.name {{ trial.participant }}
          span.type {{ trial.type }}
        .timestamp {{ formatDate( trial.timestamp ) }}
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';

interface Data {
  trials: Data.TrialMeta[];
  selected: Data.TrialMeta | null;
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
    isSelected( trial: Data.TrialMeta ) {
      return this.selected === trial;
    },

    formatDate( value: string ) {
      const d = new Date( value );
      const yyyymmdd = [
        this.twoDigits(d.getDate()),
        this.twoDigits(d.getMonth()+1),
        d.getFullYear(),
      ];
      const hhmmss = [
        this.twoDigits(d.getHours()),
        this.twoDigits(d.getMinutes()),
        this.twoDigits(d.getSeconds()),
      ]
      return `${yyyymmdd.join('.')} ${hhmmss.join(':')}`;
    },

    twoDigits( value: number ): string {
      return value < 10 ? `0${value}` : value.toString();
    },

    select( trial: Data.TrialMeta ) {
      this.selected = trial;
      this.$emit( 'selected', trial._id );
    },
  },

  created() {
    Data.trials()
      .then( (trials: Data.TrialMeta[]) => {
        this.trials = trials;
      });
  }
});

</script>

<style scoped lang="less">
#trials {
  margin: 1em auto;
}
.trial {
  text-align: left;
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
.type {
  font-weight: bold;
}
</style>
