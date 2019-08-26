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
          .chart-container
            h5.title.is-5(v-if="hasVero") Vero and Mouse, timeline
            h5.title.is-5(v-else-if="hasMouse") Mouse, timeline
            canvas(ref="userEvents" width="640" height="320")

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Transform from '@/core/transform';
import * as Charts from '@/core/charts';

import * as WebLog from '@server/web/log';
import { TrialMetaExt } from '@server/web/meta';
import * as GazeEvent from '@server/tobii/gaze-event';
import * as Statistics from '@server/statistics/types';
import * as StatisticsParams from '@server/statistics/params';

interface CompData {
  isLoaded: boolean;
  meta: TrialMetaExt;
  targets: WebLog.Clickable[];
  events: WebLog.TestEvent[];
  vero: Transform.VeroEvents;
  clicks: Transform.TimedEvent[];
  scrolls: Transform.TimedEvent[];
  errorMessage: string;
  charts: Chart[];
  statistics: Statistics.Data;
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
      meta: new TrialMetaExt(),
      targets: [],
      events: [],
      vero: {
        nav: [],
        data: [],
        ui: [],
      },
      clicks: [],
      scrolls: [],
      errorMessage: '',
      charts: [],
      statistics: {} as Statistics.Data,
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
      return !!this.statistics.fixations;
    },
    hasHits(): boolean {
      return this.statistics.hits.correct.length > 1;
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
        .then( (meta: TrialMetaExt) => {
          this.meta = Transform.meta( meta );
          return Data.targets( this.trial );
        })
        .then( (targets: WebLog.Clickable[]) => {
          this.targets = targets;
          return Data.events( this.trial );
        })
        .then( (events: WebLog.TestEvent[]) => {
          this.events = Transform.events( events );
          this.clicks = Transform.clicks( this.events, this.meta.startTime );
          this.scrolls = Transform.scrolls( this.events, this.meta.startTime );
          this.vero = Transform.vero( events, this.meta.startTime );
          return Data.stats( this.trial );
        })
        .then( (statistics: Statistics.Data) => {
          this.statistics = statistics;
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
          Charts.fixDurationsRange(
            this.$refs.fixDurationsRange as HTMLCanvasElement,
            this.statistics.fixations.durationRanges,
            StatisticsParams.FIXATION_DURATION_RANGES ),
          Charts.fixDurationsTime(
            this.$refs.fixDurationsTime as HTMLCanvasElement,
            this.statistics.fixations.durationTimes.values,
            this.statistics.fixations.durationTimes.itemDuration ),
          Charts.saccadeDirections(
            this.$refs.saccadeDirections as HTMLCanvasElement,
            this.statistics.saccades.directions ),
          Charts.saccadeDirectionRadar(
            this.$refs.saccadeDirectionRadar as HTMLCanvasElement,
            this.statistics.saccades.directionsRadar ),
          Charts.saccadeAmplitudeRange(
            this.$refs.saccadeAmplitudeRange as HTMLCanvasElement,
            this.statistics.saccades.amplitudeRanges,
            StatisticsParams.SACCADE_AMPLITUDE_RANGES ),
          Charts.saccadeAmplitudeTime(
            this.$refs.saccadeAmplitudeTime as HTMLCanvasElement,
            this.statistics.saccades.amplitudeTimes.values,
            this.statistics.saccades.amplitudeTimes.itemDuration),
        );
      }

      if (this.hasHits) {
        this.charts.push( Charts.hits( this.$refs.hits as HTMLCanvasElement, this.statistics.hits ) );
      }

      this.charts.push( Charts.userEvents(
        this.$refs.userEvents as HTMLCanvasElement,
        this.vero,
        this.clicks,
        this.scrolls,
      ) );
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
