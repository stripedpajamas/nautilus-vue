import Vue from 'vue';
import axios from 'axios';
import {
  ADD_ERROR,
  ADD_SUCCESS,
  UPDATE_DNS_USER_LIST,
  SET_NEW_DNS_USER_NAME,
  SET_NEW_DNS_USER_PASSWORD,
  ADD_NEW_DNS_USER,
  SET_DNS_USER_TO_UPDATE,
  UPDATE_DNS_USER_NAME,
  UPDATE_DNS_USER_PASSWORD,
  UPDATE_DNS_USER,
  CANCEL_UPDATE_DNS_USER,
  SET_DNS_USER_TO_REMOVE,
  CANCEL_REMOVE_DNS_USER,
  REMOVE_DNS_USER,
} from './types';

export default {
  state: {
    DNSUsers: [],
    newDNSUser: {
      username: '',
      password: '',
    },
    DNSUserToUpdate: {},
    DNSUserToRemove: {},
  },
  getters: {
    DNSUsernames: state => state.DNSUsers.map(u => u.username).sort(),
  },
  mutations: {
    [UPDATE_DNS_USER_LIST](state, { users }) {
      Vue.set(state, 'DNSUsers', users);
    },
    [SET_NEW_DNS_USER_NAME](state, { username }) {
      Vue.set(state.newDNSUser, 'username', username);
    },
    [SET_NEW_DNS_USER_PASSWORD](state, { password }) {
      Vue.set(state.newDNSUser, 'password', password);
    },
    [ADD_NEW_DNS_USER](state) {
      // resets state
      Vue.set(state, 'newDNSUser', {
        username: '',
        password: '',
      });
    },
    [SET_DNS_USER_TO_UPDATE](state, { user }) {
      Vue.set(state, 'DNSUserToUpdate', user);
    },
    [UPDATE_DNS_USER_NAME](state, { username }) {
      Vue.set(state.DNSUserToUpdate, 'username', username);
    },
    [UPDATE_DNS_USER_PASSWORD](state, { password }) {
      Vue.set(state.DNSUserToUpdate, 'password', password);
    },
    [CANCEL_UPDATE_DNS_USER](state) {
      Vue.set(state, 'DNSUserToUpdate', {});
    },
    [CANCEL_REMOVE_DNS_USER](state) {
      Vue.set(state, 'DNSUserToRemove', {});
    },
    [UPDATE_DNS_USER](state) {
      Vue.set(state, 'DNSUserToUpdate', {});
    },
    [SET_DNS_USER_TO_REMOVE](state, { user }) {
      Vue.set(state, 'DNSUserToRemove', user);
    },
    [REMOVE_DNS_USER](state) {
      Vue.set(state, 'DNSUserToRemove', {});
    },
  },
  actions: {
    [UPDATE_DNS_USER_LIST]({ commit, state, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/dns`;
      if (state.isAuthenticated && state.user.isAdmin) {
        axios.get(url, {
          headers: { Authorization: `Bearer ${rootState.main.token}` },
        }).then((res) => {
          if (res.status === 200 && res.data.ok) {
            commit(UPDATE_DNS_USER_LIST, { users: res.data.data });
          } else {
            commit(ADD_ERROR, { message: `API call failed: ${res.status}` });
          }
        }).catch((e) => {
          commit(ADD_ERROR, { message: `API call failed: ${e.message}` });
        });
      }
    },
    [SET_NEW_DNS_USER_NAME]({ commit }, { username }) {
      commit(SET_NEW_DNS_USER_NAME, { username });
    },
    [SET_NEW_DNS_USER_PASSWORD]({ commit }, { password }) {
      commit(SET_NEW_DNS_USER_PASSWORD, { password });
    },
    [ADD_NEW_DNS_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/dns`;
      axios.post(url, { ...state.newDNSUser }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(ADD_NEW_DNS_USER);
          commit(ADD_SUCCESS, { message: 'User added successfully!' });
          dispatch(UPDATE_DNS_USER_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to add user: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to add user: ${e.message}` });
      });
    },
    [SET_DNS_USER_TO_UPDATE]({ commit, state }, { username }) {
      const user = state.DNSUsers.find(u => u.username === username);
      if (user) commit(SET_DNS_USER_TO_UPDATE, { user: Object.assign({}, user) });
    },
    [UPDATE_DNS_USER_NAME]({ commit }, { username }) {
      commit(UPDATE_DNS_USER_NAME, { username });
    },
    [UPDATE_DNS_USER_PASSWORD]({ commit }, { password }) {
      commit(UPDATE_DNS_USER_PASSWORD, { password });
    },
    [CANCEL_UPDATE_DNS_USER]({ commit }) {
      commit(CANCEL_UPDATE_DNS_USER);
    },
    [CANCEL_REMOVE_DNS_USER]({ commit }) {
      commit(CANCEL_REMOVE_DNS_USER);
    },
    [UPDATE_DNS_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/dns/${state.DNSUserToUpdate._id}`;
      const { username, password } = state.DNSUserToUpdate;
      axios.put(url, { username, password }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(UPDATE_DNS_USER);
          commit(ADD_SUCCESS, { message: 'User updated successfully!' });
          dispatch(UPDATE_DNS_USER_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to update user: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to update user: ${e.message}` });
      });
    },
    [SET_DNS_USER_TO_REMOVE]({ commit, state }, { username }) {
      const user = state.DNSUsers.find(u => u.username === username);
      if (user) {
        commit(SET_DNS_USER_TO_REMOVE, { user });
      }
    },
    [REMOVE_DNS_USER]({ commit, state, dispatch, rootState }) {
      const url = `${rootState.main.apiHost}/api/users/dns/${state.DNSUserToRemove._id}`;
      axios.delete(url, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      })
        .then((res) => {
          if (res.status === 200) {
            commit(REMOVE_DNS_USER);
            commit(ADD_SUCCESS, { message: 'User removed successfully!' });
            dispatch(UPDATE_DNS_USER_LIST);
          } else {
            commit(ADD_ERROR, { message: `Failed to remove user: ${res.status}` });
          }
        }).catch((e) => {
          commit(ADD_ERROR, { message: `Failed to remove user: ${e.message}` });
        });
    },
  },
};
