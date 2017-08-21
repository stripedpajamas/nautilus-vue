import Vue from 'vue';
import axios from 'axios';
import {
  UPDATE_CLIENT_LIST,
  SET_NEW_CLIENT,
  SET_CLIENT_TO_UPDATE,
  UPDATE_CLIENT_INFO,
  SET_CLIENT_TO_REMOVE,
  ADD_NEW_CLIENT,
  UPDATE_CLIENT,
  REMOVE_CLIENT,
  CANCEL_UPDATE_CLIENT,
  ADD_ERROR,
  ADD_SUCCESS,
} from './types';

export default {
  state: {
    clients: [],
    newClient: {
      name: '',
      domain: '',
      defaultCreds: true,
      includeExpireCheck: true,
      includeLicenseCheck: true,
    },
    clientToUpdate: {},
    clientToRemove: {},
  },
  getters: {
    clientNames: state => state.clients.map(client => client.name).sort(),
  },
  mutations: {
    [UPDATE_CLIENT_LIST](state, { clientList }) {
      Vue.set(state, 'clients', clientList);
    },
    [SET_NEW_CLIENT](state, { key, value }) {
      Vue.set(state.newClient, key, value);
    },
    [SET_CLIENT_TO_UPDATE](state, { client }) {
      Vue.set(state, 'clientToUpdate', client);
    },
    [UPDATE_CLIENT_INFO](state, { key, value }) {
      Vue.set(state.clientToUpdate, key, value);
    },
    [SET_CLIENT_TO_REMOVE](state, { client }) {
      Vue.set(state, 'clientToRemove', client);
    },
    [ADD_NEW_CLIENT](state) {
      // reset state since action took care of actual addition
      Vue.set(state, 'newClient', {
        name: '',
        domain: '',
        defaultCreds: true,
      });
    },
    [UPDATE_CLIENT](state) {
      // reset state since action took care of actual update
      Vue.set(state, 'clientToUpdate', {});
    },
    [CANCEL_UPDATE_CLIENT](state) {
      Vue.set(state, 'clientToUpdate', {});
    },
    [REMOVE_CLIENT](state) {
      // reset state since action took care of actual removal
      Vue.set(state, 'clientToRemove', {});
    },
  },
  actions: {
    /**
     * Gets current list of clients from api
     */
    [UPDATE_CLIENT_LIST]({ commit, rootState }) {
      axios.get(`${rootState.main.apiHost}/api/clients`, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      })
        .then((res) => {
          if (res.status === 200 && res.data.ok) {
            commit(UPDATE_CLIENT_LIST, { clientList: res.data.data });
          } else {
            commit(ADD_ERROR, { message: `API call failed: ${res.status}` });
          }
        })
        .catch((e) => {
          commit(ADD_ERROR, { message: `API call failed: ${e.message}` });
        });
    },
    [SET_NEW_CLIENT]({ commit }, { key, value }) {
      commit(SET_NEW_CLIENT, { key, value });
    },
    [SET_CLIENT_TO_UPDATE]({ commit, state }, { clientName }) {
      const client = state.clients.find(c => c.name === clientName);
      if (client) commit(SET_CLIENT_TO_UPDATE, { client: Object.assign({}, client) });
    },
    [UPDATE_CLIENT_INFO]({ commit }, { key, value }) {
      commit(UPDATE_CLIENT_INFO, { key, value });
    },
    [SET_CLIENT_TO_REMOVE]({ commit, state }, { clientName }) {
      const client = state.clients.find(c => c.name === clientName);
      if (client) commit(SET_CLIENT_TO_REMOVE, { client: Object.assign({}, client) });
    },
    [CANCEL_UPDATE_CLIENT]({ commit }) {
      commit(CANCEL_UPDATE_CLIENT);
    },
    [ADD_NEW_CLIENT]({ commit, dispatch, state, rootState }) {
      const url = `${rootState.main.apiHost}/api/clients`;
      axios.post(url, { ...state.newClient }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(ADD_NEW_CLIENT);
          commit(ADD_SUCCESS, { message: 'Client added successfully!' });
          dispatch(UPDATE_CLIENT_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to add client: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to add client: ${e.message}` });
      });
    },
    [UPDATE_CLIENT]({ commit, dispatch, state, rootState }) {
      const url = `${rootState.main.apiHost}/api/clients/${state.clientToUpdate._id}`;
      const {
        name,
        domain,
        defaultCreds,
        includeExpireCheck,
        includeLicenseCheck,
      } = state.clientToUpdate;
      axios.put(url, {
        name,
        domain,
        defaultCreds,
        includeExpireCheck,
        includeLicenseCheck,
      }, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      }).then((res) => {
        if (res.status === 200) {
          commit(UPDATE_CLIENT);
          commit(ADD_SUCCESS, { message: 'Client updated successfully!' });
          dispatch(UPDATE_CLIENT_LIST);
        } else {
          commit(ADD_ERROR, { message: `Failed to update client: ${res.status}` });
        }
      }).catch((e) => {
        commit(ADD_ERROR, { message: `Failed to update client: ${e.message}` });
      });
    },
    [REMOVE_CLIENT]({ commit, dispatch, state, rootState }) {
      const url = `${rootState.main.apiHost}/api/clients/${state.clientToRemove._id}`;
      axios.delete(url, {
        headers: { Authorization: `Bearer ${rootState.main.token}` },
      })
        .then((res) => {
          if (res.status === 200) {
            commit(REMOVE_CLIENT);
            commit(ADD_SUCCESS, { message: 'Client removed successfully!' });
            dispatch(UPDATE_CLIENT_LIST);
          } else {
            commit(ADD_ERROR, { message: `Failed to remove client: ${res.status}` });
          }
        }).catch((e) => {
          commit(ADD_ERROR, { message: `Failed to remove client: ${e.message}` });
        });
    },
  },
};
