export const ADD_ERROR = 'ADD_ERROR';

export default {
  state: {
    errors: [],
  },
  mutations: {
    [ADD_ERROR](state, { error }) {
      state.errors.push(error);
    },
  },
  actions: {
    [ADD_ERROR]({ commit }, { error }) {
      commit(ADD_ERROR, { error });
    },
  },
};
