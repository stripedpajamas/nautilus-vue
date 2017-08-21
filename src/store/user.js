import Vue from 'vue';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import {
  ADD_ERROR,
  ADD_SUCCESS,
  CHECK_COOKIE,
  AUTHENTICATE_USER,
  AUTH_DUO,
  CONFIGURE_DUO,
  SET_NEEDS_DUO,
  SET_LOGIN_USERNAME,
  SET_LOGIN_PASSWORD,
  SET_TOKEN,
  CLEAR_TOKEN,
  LOGOUT,
  UPDATE_CLIENT_LIST,
  UPDATE_USER_LIST,
  SET_NEW_USER_NAME,
  SET_NEW_USER_PASSWORD,
  SET_NEW_USER_FULLNAME,
  SET_NEW_USER_ADMIN,
  ADD_NEW_USER,
  SET_USER_TO_UPDATE,
  UPDATE_USER_NAME,
  UPDATE_USER_PASSWORD,
  UPDATE_USER_FULLNAME,
  UPDATE_USER_ADMIN,
  UPDATE_USER,
  CANCEL_UPDATE_USER,
  SET_USER_TO_REMOVE,
  REMOVE_USER,
} from './types';

export default {
  state: {
    loginUsername: '',
    loginPassword: '',
    isAuthenticated: false,
    authedNeedsDuo: false,
    duo: {
      api: '',
      signedReq: '',
      signedRes: '',
    },
    user: {},
    users: [],
    newUser: {
      fullName: '',
      username: '',
      password: '',
      isAdmin: false,
    },
    userToUpdate: {},
    userToRemove: {},
  },
  getters: {
    usernames: state => state.users.map(user => user.username).sort(),
  },
  mutations: {
    [AUTHENTICATE_USER](state, { user }) {
      Vue.set(state, 'loginUsername', '');
      Vue.set(state, 'loginPassword', '');
      Vue.set(state, 'duo', { api: '', signedReq: '', signedRes: '' });
      Vue.set(state, 'authedNeedsDuo', false);
      Vue.set(state, 'isAuthenticated', true);
      Vue.set(state, 'user', user);
    },
    [CONFIGURE_DUO](state, { key, value }) {
      Vue.set(state.duo, key, value);
    },
    [SET_NEEDS_DUO](state, { value }) {
      Vue.set(state, 'authedNeedsDuo', value);
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
    [UPDATE_USER_LIST](state, { users }) {
      Vue.set(state, 'users', users);
    },
    [SET_NEW_USER_NAME](state, { username }) {
      Vue.set(state.newUser, 'username', username);
    },
    [SET_NEW_USER_PASSWORD](state, { password }) {
      Vue.set(state.newUser, 'password', password);
    },
    [SET_NEW_USER_FULLNAME](state, { fullName }) {
      Vue.set(state.newUser, 'fullName', fullName);
    },
    [SET_NEW_USER_ADMIN](state, { isAdmin }) {
      Vue.set(state.newUser, 'isAdmin', isAdmin);
    },
    [ADD_NEW_USER](state) {
      Vue.set(state, 'newUser', {
        fullName: '',
        username: '',
        password: '',
        isAdmin: false,
      });
    },
    [SET_USER_TO_UPDATE](state, { user }) {
      Vue.set(state, 'userToUpdate', user);
    },
    [UPDATE_USER_NAME](state, { username }) {
      Vue.set(state.userToUpdate, 'username', username);
    },
    [UPDATE_USER_PASSWORD](state, { password }) {
      Vue.set(state.userToUpdate, 'password', password);
    },
    [UPDATE_USER_FULLNAME](state, { fullName }) {
      Vue.set(state.userToUpdate, 'fullName', fullName);
    },
    [UPDATE_USER_ADMIN](state, { isAdmin }) {
      Vue.set(state.userToUpdate, 'isAdmin', isAdmin);
    },
    [CANCEL_UPDATE_USER](state) {
      Vue.set(state, 'userToUpdate', {});
    },
    [UPDATE_USER](state) {
      Vue.set(state, 'userToUpdate', {});
    },
    [SET_USER_TO_REMOVE](state, { user }) {
      Vue.set(state, 'userToRemove', user);
    },
    [REMOVE_USER](state) {
      Vue.set(state, 'userToRemove', {});
    },
  },
  actions: {
    [CHECK_COOKIE]({ commit, dispatch, rootState }) {
      const cookie = Cookies.get('nautilus');
      if (cookie) {
        axios.get(`${rootState.main.apiHost}/api/check`, {
          headers: { Authorization: `Bearer ${cookie}` },
        }).then((res) => {
          if (res.status === 200) {
            const user = jwt.decode(cookie).data;
            commit(AUTHENTICATE_USER, { user });
            commit(SET_TOKEN, { token: cookie });
            dispatch(UPDATE_CLIENT_LIST);
          } else {
            Cookies.remove('nautilus');
          }
        });
      }
    },
    [SET_LOGIN_USERNAME]({ commit }, { username }) {
      commit(SET_LOGIN_USERNAME, { username });
    },
    [SET_LOGIN_PASSWORD]({ commit }, { password }) {
      commit(SET_LOGIN_PASSWORD, { password });
    },
    [CONFIGURE_DUO]({ commit }, { key, value }) {
      commit(CONFIGURE_DUO, { key, value });
    },
    [AUTHENTICATE_USER]({ commit, state, rootState }) {
      axios.post(`${rootState.main.apiHost}/api/users/login`, {
        username: state.loginUsername,
        password: state.loginPassword,
      }).then((res) => {
        if (res.status === 200 && res.data.ok) {
          const { signedReq, api } = res.data;
          commit(CONFIGURE_DUO, { key: 'api', value: api });
          commit(CONFIGURE_DUO, { key: 'signedReq', value: signedReq });
          commit(SET_NEEDS_DUO, { value: true });
        } else {
          commit(ADD_ERROR, { message: `Failed to authenticate: ${res.status}` });
          commit(SET_LOGIN_PASSWORD, { password: '' });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to authenticate: ${e.message}` });
        commit(SET_LOGIN_PASSWORD, { password: '' });
      });
    },
    [AUTH_DUO]({ commit, dispatch, state, rootState }) {
      axios.post(`${rootState.main.apiHost}/api/users/login/duo`, {
        signedRes: state.duo.signedRes,
      }).then((res) => {
        if (res.status === 200 && res.data.ok) {
          Cookies.set('nautilus', res.data.jwt, { expires: 1 });
          const user = jwt.decode(res.data.jwt).data;
          commit(AUTHENTICATE_USER, { user });
          commit(SET_TOKEN, { token: res.data.jwt });
          dispatch(UPDATE_CLIENT_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to authenticate: ${res.status}` });
          commit(CONFIGURE_DUO, { key: 'signedRes', value: '' });
          commit(CONFIGURE_DUO, { key: 'signedReq', value: '' });
          commit(CONFIGURE_DUO, { key: 'api', value: '' });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to authenticate: ${e.message}` });
        commit(CONFIGURE_DUO, { key: 'signedRes', value: '' });
        commit(CONFIGURE_DUO, { key: 'signedReq', value: '' });
        commit(CONFIGURE_DUO, { key: 'api', value: '' });
      });
    },
    [SET_NEEDS_DUO]({ commit }, { value }) {
      commit(SET_NEEDS_DUO, { value });
    },
    [LOGOUT]({ commit, dispatch }) {
      Cookies.remove('nautilus');
      dispatch(CLEAR_TOKEN);
      commit(LOGOUT);
    },
    [UPDATE_USER_LIST]({ commit, state, rootState }) {
      const url = `${rootState.main.apiHost}/api/users`;
      if (state.isAuthenticated && state.user.isAdmin) {
        axios.get(url, {
          headers: { Authorization: `Bearer ${rootState.main.token}` },
        }).then((res) => {
          if (res.status === 200 && res.data.ok) {
            commit(UPDATE_USER_LIST, { users: res.data.data });
          } else {
            commit(ADD_ERROR, { message: `API call failed: ${res.status}` });
          }
        }).catch((e) => {
          commit(ADD_ERROR, { message: `API call failed: ${e.message}` });
        });
      }
    },
    [SET_NEW_USER_NAME]({ commit }, { username }) {
      commit(SET_NEW_USER_NAME, { username });
    },
    [SET_NEW_USER_PASSWORD]({ commit }, { password }) {
      commit(SET_NEW_USER_PASSWORD, { password });
    },
    [SET_NEW_USER_FULLNAME]({ commit }, { fullName }) {
      commit(SET_NEW_USER_FULLNAME, { fullName });
    },
    [SET_NEW_USER_ADMIN]({ commit }, { isAdmin }) {
      commit(SET_NEW_USER_ADMIN, { isAdmin });
    },
    [ADD_NEW_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users`;
      axios.post(url, { ...state.newUser }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(ADD_NEW_USER);
          commit(ADD_SUCCESS, { message: 'User added successfully!' });
          dispatch(UPDATE_USER_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to add user: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to add user: ${e.message}` });
      });
    },
    [SET_USER_TO_UPDATE]({ commit, state }, { username }) {
      if (username === 'self') {
        const user = state.user;
        commit(SET_USER_TO_UPDATE, { user: Object.assign({}, user) });
      } else {
        const user = state.users.find(u => u.username === username);
        if (user) commit(SET_USER_TO_UPDATE, { user: Object.assign({}, user) });
      }
    },
    [UPDATE_USER_NAME]({ commit }, { username }) {
      commit(UPDATE_USER_NAME, { username });
    },
    [UPDATE_USER_PASSWORD]({ commit }, { password }) {
      commit(UPDATE_USER_PASSWORD, { password });
    },
    [UPDATE_USER_FULLNAME]({ commit }, { fullName }) {
      commit(UPDATE_USER_FULLNAME, { fullName });
    },
    [UPDATE_USER_ADMIN]({ commit }, { isAdmin }) {
      commit(UPDATE_USER_ADMIN, { isAdmin });
    },
    [CANCEL_UPDATE_USER]({ commit }) {
      commit(CANCEL_UPDATE_USER);
    },
    [UPDATE_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/${state.userToUpdate._id}`;
      const { fullName, username, password, isAdmin } = state.userToUpdate;
      axios.put(url, { fullName, username, password, isAdmin }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(UPDATE_USER);
          commit(ADD_SUCCESS, { message: 'User updated successfully!' });
          dispatch(UPDATE_USER_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to update user: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to update user: ${e.message}` });
      });
    },
    [SET_USER_TO_REMOVE]({ commit, state }, { username }) {
      const user = state.users.find(u => u.username === username);
      if (user && user.username === state.user.username) {
        commit(ADD_ERROR, { message: 'You can\'t delete yourself!' });
        commit(SET_USER_TO_REMOVE, { user: {} });
      } else if (user) {
        commit(SET_USER_TO_REMOVE, { user });
      }
    },
    [REMOVE_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/${state.userToRemove._id}`;
      axios.delete(url, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      })
        .then((res) => {
          if (res.status === 200) {
            commit(REMOVE_USER);
            commit(ADD_SUCCESS, { message: 'User removed successfully!' });
            dispatch(UPDATE_USER_LIST);
          } else {
            commit(ADD_ERROR, { message: `Failed to remove user: ${res.status}` });
          }
        }).catch((e) => {
          commit(ADD_ERROR, { message: `Failed to remove user: ${e.message}` });
        });
    },
  },
};
