import Vue from 'vue';
import {
  SELECT_CLIENT,
  END_SESSION,
  SET_CUSTOM_USERNAME,
  SET_CUSTOM_PASSWORD,
  INITIALIZE,
  SEND_COMMAND,
  ADD_RESPONSE,
} from './types';

export default {
  state: {
    selectedClient: {},
    socket: null,
    response: [],
  },
  mutations: {
    [SELECT_CLIENT](state, { client }) {
      Vue.set(state, 'selectedClient', client);
    },
    [END_SESSION](state) {
      Vue.set(state, 'selectedClient', {});
      Vue.set(state, 'socket', null);
      Vue.set(state, 'response', []);
    },
    [SET_CUSTOM_USERNAME](state, { username }) {
      Vue.set(state.selectedClient, 'username', username);
    },
    [SET_CUSTOM_PASSWORD](state, { password }) {
      Vue.set(state.selectedClient, 'password', password);
    },
    [INITIALIZE](state, { socket }) {
      Vue.set(state, 'socket', socket);
    },
    [ADD_RESPONSE](state, { response }) {
      state.response.push(response);
    },
  },
  actions: {
    [SELECT_CLIENT]({ commit, state, rootState }, { clientName }) {
      const client = rootState.client.clients.find(c => c.name === clientName);
      commit(SELECT_CLIENT, { client: Object.assign({}, client) });
    },
    [SET_CUSTOM_USERNAME]({ commit }, { username }) {
      commit(SET_CUSTOM_USERNAME, { username });
    },
    [SET_CUSTOM_PASSWORD]({ commit }, { password }) {
      commit(SET_CUSTOM_PASSWORD, { password });
    },
    [END_SESSION]({ commit, state }) {
      const payload = {
        type: 'command',
        data: 'exit',
      };
      if (state.socket) {
        state.socket.send(JSON.stringify(payload));
        state.socket.close();
      }
      commit(END_SESSION);
    },
    [INITIALIZE]({ commit, state, rootState }) {
      const socket = new WebSocket(rootState.main.wsHost, rootState.main.token);

      // send init payload
      const payload = {
        type: 'init',
        data: state.selectedClient,
      };
      socket.onopen = () => {
        socket.send(JSON.stringify(payload));
      };
      socket.onmessage = (message) => {
        const response = {
          from: 'server',
          data: message.data,
        };
        commit(ADD_RESPONSE, { response });
      };
      commit(INITIALIZE, { socket });
    },
    [SEND_COMMAND]({ commit, state }, { command }) {
      const payload = {
        type: 'command',
        data: command.toLowerCase(),
      };
      state.socket.send(JSON.stringify(payload));
      const response = {
        from: 'self',
        data: command,
      };
      commit(ADD_RESPONSE, { response });
    },
  },
};
