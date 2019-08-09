<template lang="pug">
  #stimuli
    canvas(v-if="hasData" ref="targets" width="800" height="600")
    
    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)
</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import { Target, Painter } from '@/core/painter';

import * as WebLog from '@server/web/log';

interface CompData {
  meta: Defs.TrialMetaExt;
  targets: WebLog.Clickable[];
  marksCorrect: number[] | null;
  marksWrong: number[] | null;
  errorMessage: string;
}

export default Vue.extend({
  name: 'stimuli',

  components: {
    Waiting,
    Message,
  },

  data() {
    return {
      meta: new Defs.TrialMetaExt(),
      targets: [],
      marksCorrect: null,
      marksWrong: null,
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
      return this.meta.duration > 0 && this.targets.length > 0 && !!this.marksCorrect && !!this.marksWrong;
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
          if (!targets.length) {
            return Promise.reject( new Error( 'this trial has no targets' ) );
          }
          else {
            this.targets = targets;
            return Data.marksCorrect( this.trial );
          }
        })
        .then( (marks: number[]) => {
          this.marksCorrect = marks;
          return Data.marksWrong( this.trial );
        })
        .then( (marks: number[]) => {
          this.marksWrong = marks;
          return this.$nextTick();
        })
        .then( () => {
          this.drawTargets( this.$refs.targets as HTMLCanvasElement );
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },

    drawTargets( canvas: HTMLCanvasElement ) {
      const painter = new Painter( canvas, this.meta.contentArea );
      const drawingTargets = this.targets.map( target => {
        let isCorrectClick = true;
        if (this.marksCorrect && this.marksWrong) {
          isCorrectClick = !this.marksWrong.includes( target.index );
        }
        return new Target( target.bounds, target.clicked, isCorrectClick );
      });
      painter.drawTargets( drawingTargets );
    },
  },

  created() {
    this.loadData();
    // events
    // headData
  },
});

</script>

<style scoped lang="less">
#stimuli {
  margin: 1em;
}
</style>
