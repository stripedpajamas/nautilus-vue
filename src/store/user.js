import Vue from 'vue';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  ADD_ERROR,
  // ADD_SUCCESS,
  AUTHENTICATE_USER,
  SET_LOGIN_USERNAME,
  SET_LOGIN_PASSWORD,
  SET_TOKEN,
  CLEAR_TOKEN,
  LOGOUT,
  UPDATE_CLIENT_LIST,
} from './types';

export default {
  state: {
    loginUsername: '',
    loginPassword: '',
    isAuthenticated: false,
    user: {},
    newUser: {
      fullName: '',
      username: '',
      password: '',
      isAdmin: false,
    },
    userToUpdate: {},
    userToRemove: {},
  },
  mutations: {
    [AUTHENTICATE_USER](state, { user }) {
      Vue.set(state, 'loginUsername', '');
      Vue.set(state, 'loginPassword', '');
      Vue.set(state, 'isAuthenticated', true);
      Vue.set(state, 'user', user);
    },
    [SET_LOGIN_USERNAME](state, { username }) {
      Vue.set(state, 'loginUsername', username);
    },
    [SET_LOGIN_PASSWORD](state, { password }) {
      Vue.set(state, 'loginPassword', password);
    },
    [LOGOUT](state) {
      Vue.set(state, 'user', {});
      Vue.set(state, 'isAuthenticated', false);
    },
  },
  actions: {
    [SET_LOGIN_USERNAME]({ commit }, { username }) {
      commit(SET_LOGIN_USERNAME, { username });
    },
    [SET_LOGIN_PASSWORD]({ commit }, { password }) {
      commit(SET_LOGIN_PASSWORD, { password });
    },
    [AUTHENTICATE_USER]({ commit, dispatch, state, rootState }) {
      axios.post(`${rootState.main.apiHost}/api/users/login`, {
        username: state.loginUsername,
        password: state.loginPassword,
      }).then((res) => {
        if (res.status === 200 && res.data.ok) {
          const user = jwt.decode(res.data.jwt).data;
          commit(AUTHENTICATE_USER, { user });
          commit(SET_TOKEN, { token: res.data.jwt });
          dispatch(UPDATE_CLIENT_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to authenticate: ${res.status}` });
          commit(SET_LOGIN_PASSWORD, { password: '' });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to authenticate: ${e.message}` });
        commit(SET_LOGIN_PASSWORD, { password: '' });
      });
    },
    [LOGOUT]({ commit, dispatch }) {
      dispatch(CLEAR_TOKEN);
      commit(LOGOUT);
    },
  },
};
