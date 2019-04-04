export default {
    namespaced: true,

    state: {
        show: false,
        conflict: null,
        totalNumberOfConflicts: 0,
        resolutionStrategy: null,
        sameForTheRest: null,
        resolver: null
    },

    mutations: {
        SHOW_NAME_PICKER(state) {
            state.show = true;
        },

        SET_INITIALS(state, { conflict, totalNumberOfConflicts }) {
            state.conflict = conflict;
            state.totalNumberOfConflicts = totalNumberOfConflicts;
        },

        SET_RESOLUTION_STRATEGY(state, strategy) {
            state.resolutionStrategy = strategy;
        },

        SAVE_PROMISE(state, { resolve, reject }) {
            state.promise = {
                resolve,
                reject
            };
        },

        RESOLVE_PROMISE(state) {
            state.promise.resolve({
                strategy: state.resolutionStrategy,
                sameForTheRest: state.sameForTheRest
            });
        },

        CANCEL(state) {
            state.promise.resolve({ strategy: "cancel" });
        },

        CLEAR_STATE(state) {
            state.show = false;
            state.conflict = null;
            state.totalNumberOfConflicts = 0;
            state.resolutionStrategy = null;
            state.resolver = null;
        }
    },

    actions: {
        async resolveConflict({ commit, getters }, { conflict, totalNumberOfConflicts }) {
            commit("SET_INITIALS", { conflict, totalNumberOfConflicts });

            commit("SHOW_NAME_PICKER");

            return new Promise((resolve, reject) => {
                commit("SAVE_PROMISE", { resolve, reject });
            })
                .finally(() => {
                    commit("CLEAR_STATE");
                });
        },

        changeStrategy({ commit }, strategy) {
            commit("SET_RESOLUTION_STRATEGY", strategy);
        },

        resolve({ commit }) {
            commit("RESOLVE_PROMISE");
        },

        reject({ commit }) {
            commit("CANCEL");
        }
    }
};
