<template lang="pug">
  #statistics
    template(v-if="isLoaded")
      .settings
        .field.is-horizontal
          .field.is-horizontal.one-line.stacked-horz
            .field-body
              p.control.stacked-horz.limited-width
                list(:items="chunkNames" :selected="selectedChunkName" @changed="selectChunk")
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
            h5.title.is-5(v-else-if="hasDrawing") Drawing and Mouse, timeline
            h5.title.is-5(v-else-if="hasMouse") Mouse, timeline
            canvas(ref="userEvents" width="640" height="320")

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';
import List from '@/components/List.vue';

import * as Data from '@/core/data';
import * as Transform from '@/core/transform';
import { msToTime } from '@/core/format';

import * as Charts from '@/charts';

import * as WebLog from '@server/web/log';
import { TrialMetaExt } from '@server/web/meta';
import * as GazeEvent from '@server/tobii/gaze-event';
import { ReferencedData as Statistics, Directions, Hits } from '@server/statistics/types';
import * as StatisticsParams from '@server/statistics/params';

const ALL_CHUNKS = 'All chunks';

interface CompData {
  isLoaded: boolean;
  meta: TrialMetaExt;
  targets: WebLog.Clickable[];
  events: WebLog.TestEvent[];
  vero: Transform.VeroEvents | null;
  drawing: Transform.DrawingEvents | null;
  clicks: Transform.TimedEvent[];
  scrolls: Transform.TimedEvent[];
  chunks: Transform.Chunk[];
  errorMessage: string;
  charts: Chart[];
  statistics: Statistics;
  chunk?: Transform.Chunk;
}

export default Vue.extend({
  name: 'statistics',

  components: {
    Waiting,
    Message,
    List,
  },

  data() {
    return {
      isLoaded: false,
      meta: new TrialMetaExt(),
      targets: [],
      events: [],
      vero: null,
      drawing: null,
      clicks: [],
      scrolls: [],
      chunks: [],
      errorMessage: '',
      charts: [],
      statistics: {} as Statistics,
      chunk: undefined,
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
      return !!this.statistics.data.fixations;
    },
    hasHits(): boolean {
      return this.statistics.data.hits.correct.length > 1;
    },
    hasVero(): boolean {
      if (!this.vero) {
        return false;
      }
      return this.vero.nav.length > 0 || this.vero.data.length > 0 || this.vero.ui.length > 0;
    },
    hasDrawing(): boolean {
      if (!this.drawing) {
        return false;
      }
      return this.drawing.instruction.length > 0
        || this.drawing.drawing.length > 0
        || this.drawing.sphere.length > 0
        || this.drawing.cross.length > 0;
    },
    hasMouse(): boolean {
      return this.clicks.length > 0 || this.scrolls.length > 0;
    },
    chunkNames(): string[] {
      return [
        ALL_CHUNKS,
        ...this.chunks.map( chunk => `${chunk.name} (${msToTime( chunk.start, 0 )} - ${msToTime( chunk.end, 0 )})` ),
      ];
    },
    selectedChunkName(): string {
      return this.chunk ? this.chunk.name : ALL_CHUNKS;
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
          this.drawing = Transform.drawing( events, this.meta.startTime );
          this.chunks = Transform.chunks( events, this.meta.startTime, this.meta.endTime );
          this.chunks.push( new Transform.Chunk(0, 60000, 'fake'));
          return Data.stats( this.trial );
        })
        .then( (statistics: Statistics) => {
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

    selectChunk( chunkName: string ) {
      if (chunkName === ALL_CHUNKS) {
        this.chunk = undefined;
      }
      else {
        this.chunk = this.chunks.find( c => c.name === chunkName );
      }

      const promise = this.chunk ? Data.chunkStats( this.trial, this.chunk ) : Data.stats( this.trial );
      promise
        .then( (statistics: Statistics) => {
          this.statistics = statistics;
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

      const refs = this.statistics.reference;
      const fixes = this.statistics.data.fixations;
      const saccs = this.statistics.data.saccades;

      if (this.hasFixations) {
        this.charts.push(
          Charts.fixDurationsRange(
            this.$refs.fixDurationsRange as HTMLCanvasElement,
            fixes.durationRanges,
            StatisticsParams.FIXATION_DURATION_RANGES,
            Transform.toRefNums( 'fixations.durationRanges', refs ),
          ),
          Charts.fixDurationsTime(
            this.$refs.fixDurationsTime as HTMLCanvasElement,
            fixes.durationTimes.values,
            fixes.durationTimes.itemDuration,
            Transform.toRefNums( 'fixations.durationTimes.values', refs ),
          ),
          Charts.saccadeDirections(
            this.$refs.saccadeDirections as HTMLCanvasElement,
            saccs.directions, {
              forward: Transform.toRefNums( 'saccades.directions.forward', refs ).means,
              backward: Transform.toRefNums( 'saccades.directions.backward', refs ).means,
              other: Transform.toRefNums( 'saccades.directions.other', refs ).means,
            } as Directions,
          ),
          Charts.saccadeRadar(
            this.$refs.saccadeDirectionRadar as HTMLCanvasElement,
            saccs.directionsRadar,
            Transform.toRefSet( 'saccades.directionsRadar', refs ),
          ),
          Charts.saccadeAmplitudeRange(
            this.$refs.saccadeAmplitudeRange as HTMLCanvasElement,
            saccs.amplitudeRanges,
            StatisticsParams.SACCADE_AMPLITUDE_RANGES, {
              forward: Transform.toRefNums( 'saccades.amplitudeRanges.forward', refs ).means,
              backward: Transform.toRefNums( 'saccades.amplitudeRanges.backward', refs ).means,
            } as Directions,
          ),
          Charts.saccadeAmplitudeTime(
            this.$refs.saccadeAmplitudeTime as HTMLCanvasElement,
            saccs.amplitudeTimes.values,
            saccs.amplitudeTimes.itemDuration,
            Transform.toRefNums( 'saccades.amplitudeTimes.values', refs ),
          ),
        );
      }

      if (this.hasHits) {
        this.charts.push( Charts.hits(
          this.$refs.hits as HTMLCanvasElement,
          this.statistics.data.hits, {
            correct: Transform.toRefNums( 'hits.correct', refs ).means,
            wrong: Transform.toRefNums( 'hits.wrong', refs ).means,
          } as Hits,
        ));
      }

      if (this.vero) {
        const events = {
          clicks: this.clicks,
          scrolls: this.scrolls,
          ...this.vero,
        };

        this.charts.push( Charts.userEvents(
          this.$refs.userEvents as HTMLCanvasElement,
          events,
        ));
      }

      if (this.drawing) {
        const events = {
          clicks: this.clicks,
          scrolls: this.scrolls,
          ...this.drawing,
        };

        this.charts.push( Charts.userEvents(
          this.$refs.userEvents as HTMLCanvasElement,
          events,
        ));
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

.settings {
  padding: 0 1.75em;
}
.stacked-horz {
  margin-right: 1em;
}
.one-line {
  white-space: nowrap;
}
.limited-width {
  width: 250px;
}

</style>
