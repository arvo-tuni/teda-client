<template lang="pug">
  #fixplot
    .settings
      .field.is-horizontal
        .field.is-horizontal.one-line.stacked-horz
          .field-label
            label Pixels per second
          .field-body
            p.control.stacked-horz
              slider.is-primary.is-round(min="5" max="100" size="1.75em" v-model="pixelsPerSecond")
            p.control {{ pixelsPerSecond }}
        .field.stacked-horz
          checkbox(v-model="colorized" label="Colorized" size="1.5em")
        .field.stacked-horz
          checkbox(v-model="showSaccades" label="Saccades" size="1.5em")
        .field.stacked-horz
          checkbox(v-model="keepProportions" label="Keep proportions" size="1.5em")
      .field


    canvas(v-if="hasData" ref="plot" width="1280" :height="canvasHeight")
    
    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';
import Checkbox from '@/components/BulmaCheckbox.vue';
import Slider from '@/components/Slider.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import * as Transform from '@/core/transform';
import * as WebLog from '../../../test-data-server/js/web/log.js';
import * as GazeEvent from '../../../test-data-server/js/tobii/gaze-event';
import { Gaze } from '../../../test-data-server/js/tobii/log';

import { Target, Painter } from '@/core/painter';

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
  errorMessage: string;
}

export default Vue.extend({
  name: 'fixations-plot',

  components: {
    Waiting,
    Message,
    Checkbox,
    Slider,
  },

  data() {
    return {
      painter: null,
      meta: new Defs.TrialMetaExt(),
      targets: null,
      events: null,
      fixations: null,
      // saccades: null,
      pixelsPerSecond: 30,
      keepProportions: true,
      colorized: true,
      showSaccades: false,
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
        return 720;
      }
      else {
        const ratio = this.meta.contentArea.height / this.meta.contentArea.width;
        return 1280 * ratio;
      }
    }
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
          this.fixations = Transform.toScrolledFixations( 
            fixations as GazeEvent.Fixation[], 
            this.events as WebLog.TestEvent[]
          );
        //   return Data.saccades( this.trial );
        // })
        // .then( (saccades: GazeEvent.Saccade[]) => {
        //   this.saccades = saccades;
          return this.$nextTick();
        })
        .then( () => {
          this.drawPlot( this.$refs.plot as HTMLCanvasElement );
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: ' + (error ? error.message : 'unknown error') + '. Close this message to try again';
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
        });
      }
    },

    updatePlot() {
      if (!!this.painter) {
        this.painter.reset( this.meta.contentArea );
        this.drawPlot();
      }
    }
  },

  created() {
    this.loadData();
  },

  watch: {
    pixelsPerSecond( value: number ) {
      this.updatePlot();
    },

    colorized( value: boolean ) {
      this.updatePlot();
    },

    showSaccades( value: boolean ) {
      this.updatePlot();
    },

    keepProportions( value: boolean ) {
      this.$nextTick().then( () => {
        this.updatePlot();
      });
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
</style>
