export default {
    namespaced: true,

    state: {
        show: false,
        purpose: "",
        entryType: "",
        currentName: "",
        newName: "",
        resolver: null
    },

    mutations: {
        SHOW_NAME_PICKER(state) {
            state.show = true;
        },

        SET_INITIALS(state, { purpose, currentName, entryType }) {
            state.purpose = purpose;
            state.currentName = currentName;
            state.entryType = entryType;
        },

        SET_NEW_NAME(state, name) {
            state.newName = name;
        },

        SAVE_PROMISE(state, { resolve, reject }) {
            state.promise = {
                resolve,
                reject
            };
        },

        RESOLVE_PROMISE(state) {
            if (state.newName.length && state.currentName !== state.newName) {
                state.promise.resolve(state.newName);
            }
        },

        REJECT_PROMISE(state) {
            state.promise.reject("name_picker_cancel");
        },

        CLEAR_STATE(state) {
            state.show = false;
            state.purpose = "";
            state.currentName = "";
            state.newName = "";
            state.resolver = null;
        }
    },

    actions: {
        async pickName({ commit, getters }, { purpose, currentName, entryType }) {
            commit("SET_INITIALS", { purpose, currentName, entryType });
            commit("SET_NEW_NAME", currentName);

            commit("SHOW_NAME_PICKER");

            return new Promise((resolve, reject) => {
                commit("SAVE_PROMISE", { resolve, reject });
            })
                .finally(() => {
                    commit("CLEAR_STATE");
                });
        },

        changeName({ commit }, name) {
            commit("SET_NEW_NAME", name);
        },

        resolve({ commit }) {
            commit("RESOLVE_PROMISE");
        },

        reject({ commit }) {
            commit("REJECT_PROMISE");
        }
    }
};
