import Vue from 'vue';
import axios from 'axios';
import {
  UPDATE_CLIENT_LIST,
  SET_NEW_CLIENT_NAME,
  SET_NEW_CLIENT_DOMAIN,
  SET_NEW_CLIENT_CREDS,
  SET_CLIENT_TO_UPDATE,
  UPDATE_CLIENT_NAME,
  UPDATE_CLIENT_DOMAIN,
  UPDATE_CLIENT_CREDS,
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
    selectedClient: {},
    newClient: {
      name: '',
      domain: '',
      defaultCreds: true,
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
    [SET_NEW_CLIENT_NAME](state, { name }) {
      Vue.set(state.newClient, 'name', name);
    },
    [SET_NEW_CLIENT_DOMAIN](state, { domain }) {
      Vue.set(state.newClient, 'domain', domain);
    },
    [SET_NEW_CLIENT_CREDS](state, { defaultCreds }) {
      Vue.set(state.newClient, 'defaultCreds', defaultCreds);
    },
    [SET_CLIENT_TO_UPDATE](state, { client }) {
      Vue.set(state, 'clientToUpdate', client);
    },
    [UPDATE_CLIENT_NAME](state, { name }) {
      Vue.set(state.clientToUpdate, 'name', name);
    },
    [UPDATE_CLIENT_DOMAIN](state, { domain }) {
      Vue.set(state.clientToUpdate, 'domain', domain);
    },
    [UPDATE_CLIENT_CREDS](state, { defaultCreds }) {
      Vue.set(state.clientToUpdate, 'defaultCreds', defaultCreds);
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
    [SET_NEW_CLIENT_NAME]({ commit }, { name }) {
      commit(SET_NEW_CLIENT_NAME, { name });
    },
    [SET_NEW_CLIENT_DOMAIN]({ commit }, { domain }) {
      commit(SET_NEW_CLIENT_DOMAIN, { domain });
    },
    [SET_NEW_CLIENT_CREDS]({ commit }, { defaultCreds }) {
      commit(SET_NEW_CLIENT_CREDS, { defaultCreds });
    },
    [SET_CLIENT_TO_UPDATE]({ commit, state }, { clientName }) {
      const client = state.clients.find(c => c.name === clientName);
      if (client) commit(SET_CLIENT_TO_UPDATE, { client: Object.assign({}, client) });
    },
    [UPDATE_CLIENT_NAME]({ commit }, { name }) {
      commit(UPDATE_CLIENT_NAME, { name });
    },
    [UPDATE_CLIENT_DOMAIN]({ commit }, { domain }) {
      commit(UPDATE_CLIENT_DOMAIN, { domain });
    },
    [UPDATE_CLIENT_CREDS]({ commit }, { defaultCreds }) {
      commit(UPDATE_CLIENT_CREDS, { defaultCreds });
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
      const { name, domain, defaultCreds } = state.clientToUpdate;
      axios.put(url, { name, domain, defaultCreds }, {
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
