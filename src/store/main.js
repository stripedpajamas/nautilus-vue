import Vue from 'vue';
import {
  ADD_ERROR,
  ADD_SUCCESS,
  CLEAR_ERROR,
  CLEAR_SUCCESS,
  SET_TOKEN,
  CLEAR_TOKEN,
} from './types';

export default {
  state: {
    apiHost: process.env.NODE_ENV === 'development' ? 'http://localhost:9090' : '',
    wsHost: `ws://${window.location.hostname}:6993`,
    token: '',
    success: '',
    error: '',
  },
  mutations: {
    [ADD_ERROR](state, { message }) {
      Vue.set(state, 'error', message);
    },
    [ADD_SUCCESS](state, { message }) {
      Vue.set(state, 'success', message);
    },
    [CLEAR_ERROR](state) {
      Vue.set(state, 'error', '');
    },
    [CLEAR_SUCCESS](state) {
      Vue.set(state, 'success', '');
    },
    [SET_TOKEN](state, { token }) {
      Vue.set(state, 'token', token);
    },
    [CLEAR_TOKEN](state) {
      Vue.set(state, 'token', '');
    },
  },
  actions: {
    [ADD_ERROR]({ commit }, { message }) {
      commit(ADD_ERROR, { message });
    },
    [ADD_SUCCESS]({ commit }, { message }) {
      commit(ADD_SUCCESS, { message });
    },
    [CLEAR_ERROR]({ commit }) {
      commit(CLEAR_ERROR);
    },
    [CLEAR_SUCCESS]({ commit }) {
      commit(CLEAR_SUCCESS);
    },
    [SET_TOKEN]({ commit }, { token }) {
      commit(SET_TOKEN, { token });
    },
    [CLEAR_TOKEN]({ commit }) {
      commit(CLEAR_TOKEN);
    },
  },
};
