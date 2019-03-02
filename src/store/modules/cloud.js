import API from "@/middleware/api.js";

export default {
    namespaced: true,

    state: {
        entries: []
    },

    mutations: {
        SET_FILES_LIST(state, entries) {
            state.entries = entries;
        }
    },

    actions: {
        async connect({ commit }) {
            await API.connect();
        },

        async updateEntries({ commit }) {
            let entries = await API.getFilesList();
            commit("SET_FILES_LIST", entries);
        },

        async createFolder({ commit, dispatch }, payload) {
            await API.createFolder(payload.name, payload.destination);
            await dispatch("updateEntries");
        },

        async download({ commit }, entry) {
            await API.download(entry);
        },

        async upload({ commit, dispatch }, payload) {
            await API.uploadFiles(payload.files, payload.destination);
            await dispatch("updateEntries");
        },

        async moveEntries({ commit, dispatch }, payload) {
            await API.moveEntries(payload.entries, payload.destination);
            await dispatch("updateEntries");
        },

        async copyEntries({ commit, dispatch }, payload) {
            await API.copyEntries(payload.entries, payload.destination);
            await dispatch("updateEntries");
        },

        async renameEntries({ commit, dispatch }, payload) {
            await API.renameEntries(payload.entries, payload.names);
            await dispatch("updateEntries");
        },

        async deleteEntries({ commit, dispatch }, entriesPaths) {
            await API.deleteEntries(entriesPaths);
            await dispatch("updateEntries");
        }
    },

    getters: {
        folderByLink: (state) => (link = "") => {
            return state.entries.find(entry => {
                return API.Helpers.isFolder(entry) && entry.link === link;
            });
        }
    }
};
