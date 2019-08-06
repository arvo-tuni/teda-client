import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    visualizationName: '',
    trialID: '',
  },

  mutations: {
    visualization( state, name ) {
      state.visualizationName = name;
    },
    trial( state, id ) {
      state.trialID = id;
    },
  },

  actions: {

  },
});
