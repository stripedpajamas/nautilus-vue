import Vue from 'vue';
import {
  SELECT_CLIENT,
  END_SESSION,
} from './types';

export default {
  state: {
    selectedClient: {},
  },
  mutations: {
    [SELECT_CLIENT](state, { client }) {
      Vue.set(state, 'selectedClient', client);
    },
    [END_SESSION](state) {
      Vue.set(state, 'selectedClient', {});
    },
  },
  actions: {
    [SELECT_CLIENT]({ commit, state, rootState }, { clientName }) {
      const client = rootState.client.clients.find(c => c.name === clientName);
      commit(SELECT_CLIENT, { client });
    },
    [END_SESSION]({ commit }) {
      commit(END_SESSION);
    },
  },
};
