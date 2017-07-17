// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
import '../node_modules/vuetify/dist/vuetify.min.css';
import App from './App';
import router from './router';
import storeModules from './store';

Vue.use(Vuex);
Vue.use(Vuetify);
Vue.config.productionTip = false;
const store = new Vuex.Store({
  storeModules,
});
sync(store, router);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
