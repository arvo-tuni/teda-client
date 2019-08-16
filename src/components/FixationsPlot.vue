<template lang="pug">
  #fixplot
    .settings(v-if="hasData")
      .field.is-horizontal
        .field.is-horizontal.one-line.stacked-horz
          .field-label
            label Fixation size
          .field-body
            p.control.stacked-horz.pixelsPerSecond
              //- slider.is-primary.is-round(:min.number="5" :max.number="100" size="1.75em" v-model="pixelsPerSecond")
              vue-slider(
                :min="5" 
                :max="100"
                width="140" 
                :tooltip-formatter="pixelsPerSecondFormatter" 
                v-model="pixelsPerSecond"
              )
            //- p.control {{ pixelsPerSecond }}
        .field.stacked-horz(@click="colorized = !colorized")
          input.is-checkradio(type="checkbox" name="colorized" :checked="colorized")
          label(for="colorized") Colorized
          //- checkbox(v-model="colorized" label="Colorized" size="1.5em")

        .field.stacked-horz(@click="showSaccades = !showSaccades")
          input.is-checkradio(type="checkbox" name="showSaccades" :checked="showSaccades")
          label(for="showSaccades") Saccades
          //- checkbox(v-model="showSaccades" label="Saccades" size="1.5em")
          
        .field.stacked-horz(@click="keepProportions = !keepProportions")
          input.is-checkradio(type="checkbox" name="keepProportions" :checked="keepProportions")
          label(for="keepProportions") Keep proportions
          //- checkbox(v-model="keepProportions" label="Keep proportions" size="1.5em")

      .field.has-addons.one-line
        label.stacked-horz Time range
        p.control.is-expanded
          vue-slider.is-fullwidth(
            v-model="timeRange" 
            :min="0" 
            :max="duration"
            :tooltip-formatter="timeRangeFormatter" 
          )

    canvas(v-if="hasData" ref="plot" :width="canvasWidth" :height="canvasHeight")
    
    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';
// import Checkbox from '@/components/Checkbox.vue';
// import Slider from '@/components/Slider.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import * as Transform from '@/core/transform';
import { Target, Painter } from '@/core/painter';
import { secToTime } from '@/core/format';

import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';
import { Gaze } from '@server/tobii/log';

const MAX_CANVAS_WIDTH = 1024;

interface CompData {
  painter: Painter | null;
  meta: Defs.TrialMetaExt;
  targets: WebLog.Clickable[] | null;
  events: WebLog.TestEvent[] | null;
  fixations: Transform.Fixation[] | null;
  // saccades: GazeEvent.Saccade[] | null;
  pixelsPerSecond: number;
  keepProportions: boolean;
  colorized: boolean;
  showSaccades: boolean;
  timeRange: number[];
  errorMessage: string;
}

export default Vue.extend({
  name: 'fixations-plot',

  components: {
    Waiting,
    Message,
    // Checkbox,
    // Slider,
    VueSlider,
  },

  data() {
    return {
      painter: null,
      meta: new Defs.TrialMetaExt(),
      targets: null,
      events: null,
      fixations: null,
      // saccades: null,
      pixelsPerSecond: this.$ls.get( 'fixplot_pixelsPerSecond', 30 ),
      keepProportions: this.$ls.get( 'fixplot_proportions', true ),
      colorized: this.$ls.get( 'fixplot_colorized', true ),
      showSaccades: this.$ls.get( 'fixplot_saccades', false ),
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
      if (!this.meta.contentArea.height || !this.keepProportions) {
        return 576;
      }
      else {
        const ratio = this.meta.contentArea.height / this.meta.contentArea.width;
        return this.canvasWidth * ratio;
      }
    },

    canvasWidth(): number {
      if (!this.meta.contentArea.width || !this.keepProportions) {
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

    timeRangeFormatter(): any {
      return (value: number)  => secToTime( value );
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
          return Data.events( this.trial );
        })
        .then( (events: WebLog.TestEvent[]) => {
          this.events = Transform.events( events );
          return Data.fixations( this.trial );
        })
        .then( (fixations: GazeEvent.Fixation[]) => {
          this.fixations = Transform.fixations(
            fixations as GazeEvent.Fixation[],
            this.events as WebLog.TestEvent[],
          );
        //   return Data.saccades( this.trial );
        // })
        // .then( (saccades: GazeEvent.Saccade[]) => {
        //   this.saccades = saccades;
          return this.$nextTick();
        })
        .then( () => {
          this.timeRange = [0, Math.round( this.meta.duration / 1000 + 1 )];
          this.drawPlot( this.$refs.plot as HTMLCanvasElement );
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },

    drawPlot( canvas?: HTMLCanvasElement ) {
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

      if (this.fixations) {
        this.painter.drawFixPlot( this.fixations, {
          pixelsPerSecond: this.pixelsPerSecond,
          colorized: this.colorized,
          saccades: this.showSaccades,
          timeRange: this.timeRange.map( item => item * 1000 ),
        });
      }
    },

    updatePlot() {
      if (!!this.painter) {
        this.painter.reset( this.meta.contentArea );
        this.drawPlot();
      }
    },
  },

  created() {
    this.loadData();
  },

  watch: {
    pixelsPerSecond( value: number ) {
      this.$ls.set( 'fixplot_pixelsPerSecond', value );
      this.updatePlot();
    },

    colorized( value: boolean ) {
      this.$ls.set( 'fixplot_colorized', value );
      this.updatePlot();
    },

    showSaccades( value: boolean ) {
      this.$ls.set( 'fixplot_saccades', value );
      this.updatePlot();
    },

    keepProportions( value: boolean ) {
      this.$ls.set( 'fixplot_proportions', value );
      this.$nextTick().then( () => {
        this.updatePlot();
      });
    },

    timeRange( value: number[] ) {
      this.updatePlot();
    },
  },
});

</script>

<style scoped lang="less">
#fixplot {
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
</style>
