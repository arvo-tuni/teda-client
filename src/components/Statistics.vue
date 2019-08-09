<template lang="pug">
  #statistics
    template(v-if="isLoaded")
      section.section(v-if="hasFixations")
        h3.title.is-3 Fixations
        h5.title.is-5 Duration histogram
        canvas(ref="fixDurations" width="1024" height="520")
        h5.title.is-5 Temporal average duration histogram
        canvas(ref="tempAvgFixDur" width="1024" height="520")
      section.section(v-if="hasHits")
        h3.title.is-3 Results
        h5.title.is-5 Hits histogram
        canvas(ref="hits" width="1024" height="520")

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import * as Transform from '@/core/transform';
import * as Charts from '@/core/charts';

import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';

interface CompData {
  isLoaded: boolean;
  meta: Defs.TrialMetaExt;
  targets: WebLog.Clickable[];
  events: WebLog.TestEvent[];
  fixations: Transform.Fixation[];
  saccades: Transform.Saccade[];
  hits: number[] | WebLog.WrongAndCorrect[];
  errorMessage: string;
  fixDurationsChart: Chart | null;
  hitsChart: Chart | null;
  tempAvgFixDurChart: Chart | null;
}

export default Vue.extend({
  name: 'statistics',

  components: {
    Waiting,
    Message,
  },

  data() {
    return {
      isLoaded: false,
      meta: new Defs.TrialMetaExt(),
      targets: [],
      events: [],
      fixations: [],
      saccades: [],
      hits: [],
      errorMessage: '',
      fixDurationsChart: null,
      hitsChart: null,
      tempAvgFixDurChart: null,
    } as CompData;
  },

  props: {
    trial: {
      type: String,
      required: true,
    },
  },

  computed: {
    hasFixations(): boolean {
      return this.fixations.length > 0;
    },
    hasHits(): boolean {
      return this.hits.length > 0;
    },
  },

  methods: {
    loadData() {
      this.errorMessage = '';

      Data.meta( this.trial )
        .then( (meta: Defs.TrialMetaExt) => {
          this.meta = meta;
          return Data.targets( this.trial );
        })
        .then( (targets: WebLog.Clickable[]) => {
          this.targets = targets;
          return Data.hits( this.trial );
        })
        .then( (hits: number[] | WebLog.WrongAndCorrect[]) => {
          this.hits = hits;
          return Data.events( this.trial );
        })
        .then( (events: WebLog.TestEvent[]) => {
          this.events = events;
          return Data.fixations( this.trial );
        })
        .then( (fixations: GazeEvent.Fixation[]) => {
          this.fixations = Transform.toScrolledFixations(
            fixations as GazeEvent.Fixation[],
            this.events as WebLog.TestEvent[],
          );
          this.saccades = Transform.getSaccades( fixations );
          return this.$nextTick();
        })
        .then( () => {
          this.isLoaded = true;
          return this.$nextTick();
        })
        .then( () => {
          this.createCharts();
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },

    createCharts() {
      this.fixDurationsChart = Charts.fixDurations( this.$refs.fixDurations as HTMLCanvasElement, this.fixations );
      this.tempAvgFixDurChart = Charts.tempAvgFixDur( this.$refs.tempAvgFixDur as HTMLCanvasElement, this.fixations );
      this.hitsChart = Charts.hits( this.$refs.hits as HTMLCanvasElement, this.hits );
    },
  },

  created() {
    this.loadData();
  },
});

</script>

<style scoped lang="less">
#statistics {
  margin: 1em;
}
.line {

}
</style>
