<template lang="pug">
  #statistics
    template(v-if="isLoaded")
      section.section(v-if="hasFixations")
        h3.title.is-3 Fixations
        .charts.is-flex
          .chart-container
            h5.title.is-5 Duration histogram
            canvas(ref="fixDurationsRange" width="640" height="320")
          .chart-container
            h5.title.is-5 Average duration
            canvas(ref="fixDurationsTime" width="640" height="320")
        h3.title.is-3 Saccades
        .charts.is-flex
          .chart-container
            h5.title.is-5 Direction histogram
            canvas(ref="saccadeDirections" width="640" height="320")
          .chart-container
            h5.title.is-5 Direction radar
            canvas(ref="saccadeDirectionRadar" width="640" height="320")
          .chart-container
            h5.title.is-5 Amplitude histogram
            canvas(ref="saccadeAmplitudeRange" width="640" height="320")
          .chart-container
            h5.title.is-5 Average amplitude
            canvas(ref="saccadeAmplitudeTime" width="640" height="320")
      section.section
        h3.title.is-3 Results
        .charts.is-flex
          .chart-container(v-if="hasHits")
            h5.title.is-5 Hits histogram
            canvas(ref="hits" width="640" height="320")
          .chart-container(v-if="hasVero")
            h5.title.is-5 Vero, timeline
            canvas(ref="vero" width="640" height="320")
          .chart-container(v-else-if="hasMouse")
            h5.title.is-5 Mouse, timeline
            canvas(ref="mouse" width="640" height="320")

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
  vero: Transform.VeroEvents;
  clicks: Transform.TimedMouseEvent[];
  scrolls: Transform.TimedMouseEvent[];
  errorMessage: string;
  charts: Chart[];
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
      vero: {
        nav: [],
        data: [],
        ui: [],
      },
      clicks: [],
      scrolls: [],
      errorMessage: '',
      charts: [],
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
      return this.hits.length > 1;
    },
    hasVero(): boolean {
      return this.vero.nav.length > 0 || this.vero.data.length > 0 || this.vero.ui.length > 0;
    },
    hasMouse(): boolean {
      return this.clicks.length > 0 || this.scrolls.length > 0;
    },
  },

  methods: {
    loadData() {
      this.errorMessage = '';

      Data.meta( this.trial )
        .then( (meta: Defs.TrialMetaExt) => {
          this.meta = Transform.meta( meta );
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
          this.events = Transform.events( events );
          this.clicks = Transform.clicks( this.events, this.meta.startTime );
          this.scrolls = Transform.scrolls( this.events, this.meta.startTime );
          this.vero = Transform.vero( events, this.meta.startTime );
          return Data.fixations( this.trial );
        })
        .then( (fixations: GazeEvent.Fixation[]) => {
          this.fixations = Transform.fixations(
            fixations as GazeEvent.Fixation[],
            this.events as WebLog.TestEvent[],
          );
          this.saccades = Transform.saccades( fixations );
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
      this.charts = [];

      if (this.hasFixations) {
        this.charts.push(
          Charts.fixDurationsRange( this.$refs.fixDurationsRange as HTMLCanvasElement, this.fixations ),
          Charts.fixDurationsTime( this.$refs.fixDurationsTime as HTMLCanvasElement, this.fixations ),
          Charts.saccadeDirections( this.$refs.saccadeDirections as HTMLCanvasElement, this.saccades ),
          Charts.saccadeDirectionRadar( this.$refs.saccadeDirectionRadar as HTMLCanvasElement, this.saccades ),
          Charts.saccadeAmplitudeRange( this.$refs.saccadeAmplitudeRange as HTMLCanvasElement, this.saccades ),
          Charts.saccadeAmplitudeTime( this.$refs.saccadeAmplitudeTime as HTMLCanvasElement, this.saccades ),
        );
      }

      if (this.hasHits) {
        this.charts.push( Charts.hits( this.$refs.hits as HTMLCanvasElement, this.hits ) );
      }

      if (this.hasVero) {
        this.charts.push( Charts.vero(
          this.$refs.vero as HTMLCanvasElement,
          this.vero,
          this.clicks,
          this.scrolls,
        ) );
      }

      if (this.hasMouse) {
        this.charts.push( Charts.mouse(
          this.$refs.mouse as HTMLCanvasElement,
          this.clicks,
          this.scrolls,
        ) );
      }
    },
  },

  created() {
    this.loadData();
  },
});

</script>

<style scoped lang="less">
.charts {
  flex-wrap: wrap;
}
.chart-container {
  margin-bottom: 2em;
}
</style>
