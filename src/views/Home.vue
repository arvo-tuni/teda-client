<template lang="pug">
  #home
    template
      .field.has-addons.top-row(v-if="tests.length")
        p.control.is-expanded
          list(prompt="Select a test" :items="tests" :selected="testName" @changed="load")
        p.control
          a.button.button-after-combo(@click="updateTestsList")
            span.icon
              i.fas.fa-redo-alt
        p.control(v-if="!!testName")
          a.button.button-after-combo(@click="downloadStatistics")
            span.icon
              i.fas.fa-download
      waiting(v-else-if="!errorMessage" is-modal=false is-bar=false)

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
import { s } from '@/core/format';
import { download } from '@/core/utils';

import { UpdateInfo, Tests } from '@server/respTypes';


interface CompData {
  tests: string[];
  testName: string;
  errorMessage: string;
  successMessage: string;
  isLoading: boolean;
  visualizations: {[x: string]: string};
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
    return {
      tests: [],
      testName: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false,
      visualizations: VISUALIZATIONS,
    } as CompData;
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
      const isFetchSucceeded = err.message.endsWith(']');

      if (!err) {
        this.errorMessage = 'unknown error';
      }
      else {
        this.errorMessage =
          (err.message || JSON.stringify( err )) +
          (!isFetchSucceeded ? '. Is server running already?' : '');
      }
    },

    updateTestsList() {
      this.successMessage = '';
      this.errorMessage = '';

      this.isLoading = true;

      Data.updateTestsList()
        .then( (report: UpdateInfo) => {
          if (report.removed > 0 || report.appended > 0) {
            const msgs = [];

            if (report.removed) {
              msgs.push( `${report.removed} test${s(report.removed)} removed` );
            }
            if (report.appended) {
              msgs.push( `${report.appended} new test${s(report.appended)}` );
            }
            this.successMessage = msgs.join(', ');

            return Data.tests();
          }
          else {
            this.successMessage = 'No changes';
            return Promise.resolve({
              names: this.tests,
              current: this.testName,
            } as Tests);
          }
        })
        .then( (tests: Tests) => {
          this.tests = tests.names;
          if (tests.current) {
            this.testName = tests.current;
          }
        })
        .catch( (err: Error) => {
          this.showError( new Error( `Cannot update the list of tests: ${err.message}` ) );
        })
        .finally( () => {
          this.isLoading = false;
        });
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
            return Promise.reject( respond );
          }
        })
        .catch( (err: Error) => {
          this.showError( new Error( `Cannot load test trials: ${err.message}`) );
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

    downloadStatistics() {
      Data.downloadStatistics( this.testName )
        .then( (table: string) => {
          download( table, this.testName + '.csv' );
        })
        .catch( (err: Error) => {
          this.showError( new Error( `Cannot download the statistics: ${err.message}` ) );
        });
    },
  },

  mounted() {
    Data.tests()
      .then( (tests: Tests) => {
        this.tests = tests.names;
        if (tests.current) {
          this.testName = tests.current;
        }
      })
      .catch( (err: Error) => {
        this.showError( new Error( `Cannot retrieve the list of tests: ${err.message}` ) );
      });
  },
});
</script>

<style scoped lang="less">
#home {
  padding: 1em;
}
.top-row {
  max-width: 30em;
  margin: 0 auto;
}
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 5vw;
  width: 90vw;
}
.button-after-combo {
  box-shadow: 0 2px 3px rgba(10,10,10,.1), 0 0 0 1px rgba(10,10,10,.1);
}
</style>
