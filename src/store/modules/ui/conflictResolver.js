export default {
    namespaced: true,

    state: {
        show: false,
        conflict: null,
        remainingConflictsNumber: 0,
        resolutionStrategy: null,
        sameForTheRest: false,
        resolver: null
    },

    mutations: {
        SHOW_NAME_PICKER(state) {
            state.show = true;
        },

        SET_INITIALS(state, { conflict, remainingConflictsNumber }) {
            state.conflict = conflict;
            state.remainingConflictsNumber = remainingConflictsNumber;
        },

        SET_RESOLUTION_STRATEGY(state, strategy) {
            state.resolutionStrategy = strategy;
        },

        SET_SAME_FOR_THE_REST(state, sameForTheRest) {
            state.sameForTheRest = sameForTheRest;
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
            state.remainingConflictsNumber = 0;
            state.resolutionStrategy = null;
            state.sameForTheRest = false;
            state.resolver = null;
        }
    },

    actions: {
        async resolveConflict({ commit, getters }, { conflict, remainingConflictsNumber }) {
            commit("SET_INITIALS", { conflict, remainingConflictsNumber });

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

        changeSameForTheRest({ commit }, sameForTheRest) {
            commit("SET_SAME_FOR_THE_REST", sameForTheRest);
        },

        resolve({ commit }) {
            commit("RESOLVE_PROMISE");
        },

        reject({ commit }) {
            commit("CANCEL");
        }
    }
};
