<template lang="pug">
  .home
    list(prompt="Select a test" :items="tests" @selected="load")

    message(type="error" :message="errorMessage")
    message(type="success" :message="successMessage")

    visualizations(v-show="true || !!testName" @tab="setVisualization")
      fixations-plot(v-if="isVisualizationSelected( visualizations.fixplot )")
      statistics(v-if="isVisualizationSelected( visualizations.statistics )")

    waiting(v-show="isLoading" is-modal=true)

</template>

<script lang="ts">
import Vue from 'vue';

import List from '@/components/List.vue';
import Message from '@/components/Message.vue';
import Waiting from '@/components/Waiting.vue';
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
}

export default Vue.extend({
  name: 'home',
  
  components: {
    List,
    Message,
    Waiting,
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

    setVisualization( name: string ) {
      this.visualizationName = name;
    }
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
