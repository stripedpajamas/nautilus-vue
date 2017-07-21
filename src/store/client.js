import Vue from 'vue';
// import {
//   ADD_ERROR,
// } from './main';

export const UPDATE_CLIENT_LIST = 'UPDATE_CLIENT_LIST';

export default {
  state: {
    clients: {},
  },
  mutations: {
    [UPDATE_CLIENT_LIST](state, { clientList }) {
      Vue.set(state, 'clients', clientList);
    },
  },
  actions: {
    /**
     * Gets current list of clients from database
     */
    [UPDATE_CLIENT_LIST]() {
      console.log('Fired update client list');
    },
  },
};
