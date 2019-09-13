<template lang="pug">
  nav#trials.panel
    p.panel-heading trials
    section.accordions
      article.accordion(v-for="group in groups" :key="group.name" :class="{ 'is-active': isGroupSelected( group ) }")
        .accordion-header.toggle(@click="selectGroup( group )")
          p {{ group.name }}
        .accordion-body
          .accordion-content
            a.panel-block(
              v-for="trial in group.trials" 
              :key="trial._id" 
              :class="{'is-active': isTrialSelected( trial ), 'is-active-bg': isTrialSelected( trial )}"
              @click="selectTrial( trial )"
            )
              .panel-icon
                i.fas.fa-book(aria-hidden="true")
              .has-text-left
                .trial-info.is-flex
                  span(v-if="trial.participant") {{ trial.participant }}
                  span.has-text-weight-bold {{ trial.type }}
                .timestamp {{ formatDate( trial.timestamp ) }}
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';
import * as Transform from '@/core/transform';
import { toDate } from '@/core/format';

import { TrialMeta } from '@server/web/meta';

interface CompData {
  trials: TrialMeta[];
  groups: Transform.Group[];
  selectedTrial: TrialMeta | null;
  selectedGroup: Transform.Group | null;
}

/// Emits:
///   selected( trial.id )
export default Vue.extend({
  name: 'trials',

  data() {
    return {
      trials: [],
      groups: [],
      selectedTrial: null,
      selectedGroup: null,
    } as CompData;
  },

  methods: {
    isTrialSelected( trial: TrialMeta ) {
      return this.selectedTrial === trial;
    },

    isGroupSelected( group: Transform.Group ) {
      return this.selectedGroup === group;
    },

    formatDate( value: string ) {
      return toDate( value );
    },

    selectTrial( trial: TrialMeta ) {
      this.selectedTrial = trial;
      this.$emit( 'selected', trial._id );
    },

    selectGroup(group: Transform.Group ) {
      this.selectedGroup = group;
    },
  },

  created() {
    Data.trials()
      .then( (trials: TrialMeta[]) => {
        this.trials = Transform.trials( trials );
        this.groups = Transform.groups( this.trials );
        this.selectedGroup = this.groups[0];
      });
  },
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

.accordions .accordion a:not(.button):not(.tag) {
  text-decoration: inherit;
}
.accordion-content {
  padding: 0 !important;
}
</style>
