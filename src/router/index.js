import Vue from 'vue';
import Router from 'vue-router';
import Shell from '@/components/Shell';
import ClientAdmin from '@/components/admin/Client';
import UserAdmin from '@/components/admin/User';
import Login from '@/components/Login';
import ClientSelect from '@/components/ClientSelect';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      name: 'Client Select',
      component: ClientSelect,
    },
    {
      path: '/shell',
      name: 'Shell',
      component: Shell,
    },
    {
      path: '/admin/clients',
      name: 'Client Management',
      component: ClientAdmin,
    },
    {
      path: '/admin/users',
      name: 'User Management',
      component: UserAdmin,
    },
  ],
});
