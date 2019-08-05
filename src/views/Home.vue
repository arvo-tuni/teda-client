<template lang="pug">
  #home.container
    list(prompt="Select a test" :items="tests" @selected="load")

    .fixed-footer
      message(type="error" :message="errorMessage")
      message(type="success" :message="successMessage"  auto-hide=true)

    .tile
      article.tile.is-child.is-2
        trials(v-if="testName" @selected="selectTrial")

      article.tile.is-child
        visualizations(v-show="!!trialID" @tab="selectVisualization")
          fixations-plot(v-if="isVisualizationSelected( visualizations.fixplot )" :trial="trialID")
          statistics(v-if="isVisualizationSelected( visualizations.statistics )" :trial="trialID")

    waiting(v-show="isLoading" is-modal=true)

</template>

<script lang="ts">
import Vue from 'vue';

import List from '@/components/List.vue';
import Message from '@/components/Message.vue';
import Waiting from '@/components/Waiting.vue';
import Trials from '@/components/Trials.vue';
import Visualizations from '@/components/Visuzalitions.vue';
import FixationsPlot from '@/components/FixationsPlot.vue';
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
  visualizationName: string;
  trialID: string;
}

export default Vue.extend({
  name: 'home',
  
  components: {
    List,
    Message,
    Waiting,
    Trials,
    Visualizations,
    FixationsPlot,
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
      visualizationName: '',
      trialID: '',
    };
    return r;
  },

  methods: {
    showError( err: Data.RequestResult | any ) {
      if (!err) {
        this.errorMessage = 'unknown error';
      }
      else {
        this.errorMessage = err.message || JSON.stringify( err );
      }
    },

    load( testName: string ) {

      this.successMessage = '';
      this.errorMessage = '';

      if (this.testName !== testName) {
        this.isLoading = true;

        Data.load( testName )
          .then( (respond: Data.RequestResult) => {
            if (respond.message === 'OK') {
              this.successMessage = 'Success';
              this.testName = testName;
              return Promise.resolve();
            }
            else {
              return Promise.reject();
            }
          })
          .catch( (err: Data.RequestResult | any) => {
            this.showError( err );
          })
          .finally( () => {
            this.isLoading = false;
          });
      }
    },

    isVisualizationSelected( name: string ): boolean {
      return this.visualizationName === name;
    },

    selectVisualization( name: string ) {
      this.visualizationName = name;
    },

    selectTrial( id: string ) {
      this.trialID = id;
    },
  },

  mounted() {
    Data.tests()
      .then( (tests: string[]) => {
        this.tests = tests;
      })
      .catch( (err: Data.RequestResult | any) => {
        this.showError( err );
      });
  },
});
</script>

<style scoped lang="less">
#home {
  padding: 1em 0;
}
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 5vw;
  width: 90vw;
}
</style>
