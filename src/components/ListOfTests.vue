<template lang="pug">
  #list-of-test
    .dropdown(:class="{ 'is-active': isListShown }")
      .dropdown-trigger(@click.stop="")
        button.button(aria-haspopup="true" aria-controls="dropdown-menu" @click="toggleList()")
          span {{ testName }}
          span.icon.is-small
            i.fas.fa-angle-down(aria-hidden="true")
      .dropdown-menu(role="menu")
        .dropdown-content
          a.dropdown-item(
            v-for="test in tests" 
            href="#"
            :class="{ 'is-active': isSelected( test ) }"
            @click.stop="loadTest( test )"
          ) {{ test }}
</template>

<script lang="ts">
import Vue from 'vue';

import * as Data from '@/core/data';

interface Data {
  tests: string[];
  selectedTest: string;
  isListShown: boolean;
}

/// Emits:
///   selected( testName ) 

export default Vue.extend({
  name: 'ListOfTests',

  props: {
    test: {
      type: String,
      default: '',
      require: false,
    },
  },

  data() {
    const r: Data = {
      tests: [],

      selectedTest: this.test,

      isListShown: false,
    };
    return r;
  },

  computed: {
    testName(): string {
      return this.selectedTest ? this.selectedTest : 'Select a test';
    },
  },

  methods: {
    loadTest( test: string ) {
      this.hideList();
      this.selectedTest = test;

      this.$emit( 'selected', this.selectedTest );
    },

    toggleList() {
      this.isListShown = !this.isListShown;
    },

    hideList() {
      this.isListShown = false;
    },

    isSelected( test: string ): boolean {
      return this.selectedTest === test;
    },
  },

  created() {
    window.document.addEventListener( 'click', _ => this.hideList() );
  },

  mounted() {
    Data.getTests( (tests: string[]) => {
      this.tests = tests;
    });
  },

  destroyed() {
    window.document.removeEventListener( 'click', _ => this.hideList() );
  },
});
</script>

<style scoped lang="less">
.dropdown-trigger {
  .button {
    width: 20em;
  }
}
.dropdown-menu {
  width: 20em;
}
</style>
