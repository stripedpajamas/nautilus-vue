// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
// import Cookies from 'js-cookie';
import '../node_modules/vuetify/dist/vuetify.min.css';
import App from './App';
import router from './router';
import modules from './store';

Vue.use(Vuex);
Vue.use(Vuetify);
Vue.config.productionTip = false;
const store = new Vuex.Store({
  modules,
});
sync(store, router);

/* Require authentication route guard */
router.beforeEach((to, from, next) => {
  // if we aren't logging in
  if (to.path !== '/login') {
    // and we aren't authenticated
    if (!store.state.user.isAuthenticated) {
      // redirect to the login
      return next({ path: '/login' });
    }
  }
  return next();
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
