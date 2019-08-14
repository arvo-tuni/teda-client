<template lang="pug">
  #heatmap
    .settings(v-if="hasData")
      .field.is-horizontal
        .field.is-horizontal.one-line.stacked-horz
          .field-label
            label Fixation size
          .field-body
            p.control.stacked-horz.pixelsPerSecond
              vue-slider(
                :min="5" 
                :max="200"
                width="240" 
                :tooltip-formatter="pixelsPerSecondFormatter" 
                v-model="pixelsPerSecond"
              )
          .field-label
            label Intensity
          .field-body
            p.control.stacked-horz.pixelsPerSecond
              vue-slider(
                :min="5" 
                :max="800"
                width="240" 
                :tooltip-formatter="intensityFormatter" 
                v-model="intensity"
              )
      .field.has-addons.one-line
        label.stacked-horz Time range
        p.control.is-expanded
          vue-slider.is-fullwidth(
            v-model="timeRange" 
            :min="0" 
            :max="duration"
            :tooltip-formatter="timeRangeFormatter" 
          )

    .canvas-container(v-if="hasData" :style="canvasContainerStyle")
      canvas.static(ref="targets" :width="canvasWidth" :height="canvasHeight" :style="canvasStyle")
      canvas.static(ref="heatmap" :width="canvasWidth" :height="canvasHeight" :style="canvasStyle")
    
    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import * as Transform from '@/core/transform';
import { Target, Painter } from '@/core/painter';
import { secToTime } from '@/core/format';
import { Heatmap } from '@/core/heatmap';

import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';
import { Gaze } from '@server/tobii/log';

const MAX_CANVAS_WIDTH = 1024;

interface CompData {
  painter: Painter | null;
  heatmap: Heatmap | null;
  meta: Defs.TrialMetaExt;
  targets: WebLog.Clickable[] | null;
  events: WebLog.TestEvent[] | null;
  fixations: Transform.Fixation[] | null;
  pixelsPerSecond: number;
  intensity: number;
  timeRange: number[];
  errorMessage: string;
}

export default Vue.extend({
  name: 'heatmap',

  components: {
    Waiting,
    Message,
    VueSlider,
  },

  data() {
    return {
      painter: null,
      heatmap: null,
      meta: new Defs.TrialMetaExt(),
      targets: null,
      events: null,
      fixations: null,
      pixelsPerSecond: 100,
      intensity: 200,
      timeRange: [0, 1],
      errorMessage: '',
    } as CompData;
  },

  props: {
    trial: {
      type: String,
      required: true,
    },
  },

  computed: {
    hasData(): boolean {
      return this.meta.duration > 0 && !!this.targets && !!this.events && !!this.fixations;
    },

    canvasHeight(): number {
      if (!this.meta.contentArea.height) {
        return 576;
      }
      else {
        const ratio = this.meta.contentArea.height / this.meta.contentArea.width;
        return this.canvasWidth * ratio;
      }
    },

    canvasWidth(): number {
      if (!this.meta.contentArea.width) {
        return 1024;
      }
      else {
        return Math.min( this.meta.contentArea.width, MAX_CANVAS_WIDTH );
      }
    },

    duration(): number {
      return this.meta.duration ? Math.round( this.meta.duration / 1000 + 1 ) : 1;
    },

    pixelsPerSecondFormatter(): string {
      return '{value} px/sec';
    },

    intensityFormatter(): any {
      return (value: number) => (value / 1000).toFixed( 2 );
    },

    timeRangeFormatter(): any {
      return (value: number)  => secToTime( value );
    },

    canvasParentWidth(): number {
      const style = window.getComputedStyle( this.$el );
      return Number.parseFloat( style.width || '' );
    },

    canvasContainerStyle(): string {
      return `height: ${this.canvasHeight}px`;
    },

    canvasStyle(): string {
      return `left: ${(this.canvasParentWidth - this.canvasWidth) / 2}px`;
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
          return Data.events( this.trial );
        })
        .then( (events: WebLog.TestEvent[]) => {
          this.events = events;
          return Data.fixations( this.trial );
        })
        .then( (fixations: GazeEvent.Fixation[]) => {
          this.fixations = Transform.fixations(
            fixations as GazeEvent.Fixation[],
            this.events as WebLog.TestEvent[],
          );
          return this.$nextTick();
        })
        .then( () => {
          this.timeRange = [0, Math.round( this.meta.duration / 1000 + 1 )];
          // this.loadWebGLHeatmapScript();
        })
        .then( () => {
          this.drawTargets( this.$refs.targets as HTMLCanvasElement );
          this.drawHeatmap( this.$refs.heatmap as HTMLCanvasElement );
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },

    // loadWebGLHeatmapScript() {
    //   const webGLHeatmapEl = window.document.createElement( 'script' );
    //   webGLHeatmapEl.src = './webgl-heatmap.js';
    //   webGLHeatmapEl.addEventListener( 'load', () => {
    //     this.drawHeatmap( this.$refs.heatmap as HTMLCanvasElement );
    //   });
    //   window.document.body.appendChild( webGLHeatmapEl );
    // },

    drawTargets( canvas?: HTMLCanvasElement ) {
      if (!this.painter) {
        if (!canvas) {
          return;
        }
        this.painter = new Painter( canvas, this.meta.contentArea );
      }

      if (!!this.targets) {
        const drawingTargets = this.targets.map( target => {
          return new Target( target.bounds, target.clicked, true );
        });
        this.painter.drawTargets( drawingTargets );
      }
    },

    drawHeatmap( canvas?: HTMLCanvasElement ) {
      if (!this.heatmap) {
        if (!canvas) {
          return;
        }
        this.heatmap = new Heatmap( canvas, this.meta.contentArea );
      }

      if (this.fixations) {
        this.heatmap.draw( this.fixations, {
          pixelsPerSecond: this.pixelsPerSecond,
          intensity: this.intensity,
          timeRange: this.timeRange.map( item => item * 1000 ),
        });
      }
    },

    updateHeatmap() {
      if (!!this.heatmap) {
        this.heatmap.reset( this.meta.contentArea );
        this.drawHeatmap();
      }
    },
  },

  mounted() {
    this.loadData();
  },

  watch: {
    pixelsPerSecond( value: number ) {
      this.updateHeatmap();
    },

    intensity( value: number ) {
      this.updateHeatmap();
    },

    timeRange( value: number[] ) {
      this.updateHeatmap();
    },
  },
});

</script>

<style scoped lang="less">
#heatmap {
  margin: 1em;
}
.stacked-horz {
  margin-right: 1em;
}
.one-line {
  white-space: nowrap;
}
.pixelsPerSecond {
  width: 100px;
}
.canvas-container {
  position: relative;
  width: 100%;
}
canvas.static {
  position: absolute;
  top: 0;
}
.field-body {
  margin-right: 2em;
}
</style>
