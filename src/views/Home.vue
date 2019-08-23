<template lang="pug">
  #home
    template
      list(v-if="tests.length" prompt="Select a test" :items="tests" @selected="load")
      waiting(v-else is-modal=false is-bar=false)

    .fixed-footer
      message(type="error" :message="errorMessage")
      message(type="success" :message="successMessage"  auto-hide=true)

    .tile
      article.tile.is-child.is-2
        trials(v-if="testName" @selected="selectTrial")

      article.tile.is-child
        visualizations(v-show="hasTrialID" @tab="selectVisualization")
          meta-ext(v-if="isVisualizationSelected( visualizations.meta )" :trial="trialID")
          stimuli(v-if="isVisualizationSelected( visualizations.stimuli )" :trial="trialID")
          fixations-plot(v-if="isVisualizationSelected( visualizations.fixplot )" :trial="trialID")
          heatmap(v-if="isVisualizationSelected( visualizations.heatmap )" :trial="trialID")
          statistics(v-if="isVisualizationSelected( visualizations.statistics )" :trial="trialID")

    waiting(v-show="isLoading" is-modal=true is-bar=true)

</template>

<script lang="ts">
import Vue from 'vue';

import List from '@/components/List.vue';
import Message from '@/components/Message.vue';
import Waiting from '@/components/Waiting.vue';
import Trials from '@/components/Trials.vue';
import Visualizations from '@/components/Visuzalitions.vue';
import MetaExt from '@/components/MetaExt.vue';
import Stimuli from '@/components/Stimuli.vue';
import FixationsPlot from '@/components/FixationsPlot.vue';
import Heatmap from '@/components/Heatmap.vue';
import Statistics from '@/components/Statistics.vue';

import * as Data from '@/core/data';
import VISUALIZATIONS from '@/core/visualizations';


interface Data {
  tests: string[];
  testName: string;
  errorMessage: string;
  successMessage: string;
  isLoading: boolean;
  visualizations: any;
}

export default Vue.extend({
  name: 'home',

  components: {
    List,
    Message,
    Waiting,
    Trials,
    Visualizations,
    MetaExt,
    Stimuli,
    FixationsPlot,
    Heatmap,
    Statistics,
  },

  data() {
    const r: Data = {
      tests: [],
      testName: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false,
      visualizations: VISUALIZATIONS,
    };
    return r;
  },

  computed: {
    trialID(): string {
      return this.$store.state.trialID;
    },

    hasTrialID(): boolean {
      return !!this.$store.state.trialID;
    },
  },

  methods: {
    showError( err: Error ) {
      if (!err) {
        this.errorMessage = 'unknown error';
      }
      else {
        this.errorMessage = err.message || JSON.stringify( err );
      }
    },

    load( testName: string ) {

      if (this.testName === testName) {
        return;
      }

      this.$store.commit( 'visualization', '' );
      this.$store.commit( 'trial', '' );

      this.testName = '';
      this.successMessage = '';
      this.errorMessage = '';

      this.isLoading = true;

      Data.load( testName )
        .then( (respond: Error) => {
          if (respond.message === 'OK') {
            this.successMessage = 'Success';
            this.testName = testName;
            return Promise.resolve();
          }
          else {
            return Promise.reject();
          }
        })
        .catch( (err: Error) => {
          this.showError( err );
        })
        .finally( () => {
          this.isLoading = false;
        });
    },

    isVisualizationSelected( name: string ): boolean {
      return this.$store.state.visualizationName === name;
    },

    selectVisualization( name: string ) {
      this.$store.commit( 'visualization', name );
    },

    selectTrial( id: string ) {
      const restoreVisualizationName = this.$store.state.visualizationName;

      this.$store.commit( 'visualization', '' );
      this.$store.commit( 'trial', id );

      if (!!restoreVisualizationName) {
        this.$nextTick().then( () => {
          this.$store.commit( 'visualization', restoreVisualizationName );
        });
      }
    },
  },

  mounted() {
    Data.tests()
      .then( (tests: string[]) => {
        this.tests = tests;
      })
      .catch( (err: Error) => {
        this.showError( err );
      });
  },
});
</script>

<style scoped lang="less">
#home {
  padding: 1em;
}
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 5vw;
  width: 90vw;
}
</style>
