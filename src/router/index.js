import Vue from 'vue';
import Router from 'vue-router';
import Shell from '@/components/Shell';
import Admin from '@/components/Admin';
import Login from '@/components/Login';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
    {
      path: '/shell',
      name: 'Shell',
      component: Shell,
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
    },
  ],
});
