import Vue from 'vue';
import { VueStorage, Options as VueStorageOptions } from 'vue-ls';

import App from './App.vue';
import router from './router';
import store from './store';

import 'bulma/css/bulma.min.css';
import 'bulma-extensions/bulma-checkradio/dist/css/bulma-checkradio.min.css';
import 'bulma-extensions/bulma-accordion/dist/css/bulma-accordion.min.css';

const storageOptions = {
  namespace: 'arvo__',
  name: 'ls',
  storage: 'local',   // storage name: session, local, memory
} as VueStorageOptions;

Vue.use( VueStorage, storageOptions );

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
