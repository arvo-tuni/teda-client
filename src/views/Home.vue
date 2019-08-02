<template lang="pug">
  .home
    list-of-tests(@selected="load")

    message(type="error" :message="errorMessage")
    message(type="success" :message="successMessage")

    waiting(v-show="isLoading" is-modal=true)

</template>

<script lang="ts">
import Vue from 'vue';
import ListOfTests from '@/components/ListOfTests.vue';
import Message from '@/components/Message.vue';
import Waiting from '@/components/Waiting.vue';

import WebTrial from '../../../../../_Node/ARVO/test-data-server/js/web/trial';

import * as Data from '@/core/data';

interface Data {
  testName: string;
  test: WebTrial[] | null;
  errorMessage: string;
  successMessage: string;
  isLoading: boolean;
}

export default Vue.extend({
  name: 'home',
  
  components: {
    ListOfTests,
    Message,
    Waiting,
  },

  data() {
    const r: Data = {
      testName: '',
      test: null,
      errorMessage: '',
      successMessage: '',
      isLoading: false,
    };
    return r;
  },

  methods: {
    load( testName: string ) {

      this.successMessage = '';
      this.errorMessage = '';

      if (this.testName !== testName) {
        this.isLoading = true;

        Data.load( this.testName, (res: any) => {
          this.isLoading = false;

          if (!res) {
            this.errorMessage = 'unknown error';
          }
          else if (res.message === 'OK') {
            this.successMessage = 'Success';
            this.testName = testName;
          }
          else {
            this.errorMessage = res.message || res;
          }
        });
      }
    },
  },
});
</script>
