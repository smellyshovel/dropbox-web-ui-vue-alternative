import API from "@/middleware/api.js";

export default {
    namespaced: true,

    state: {
        filesList: []
    },

    mutations: {
        SET_FILES_LIST(state, filesList) {
            state.filesList = filesList;
        }
    },

    actions: {
        async connect({ commit }) {
            await API.connect();
        },

        async updateFilesList({ commit }) {
            let filesList = await API.getFilesList();
            commit("SET_FILES_LIST", filesList);
        },

        async createFolder({ commit, dispatch }, payload) {
            await API.createFolder(payload.name, payload.destination);
            await dispatch("updateFilesList");
        },

        async download({ commit }, entry) {
            await API.download(entry);
        },

        async upload({ commit, dispatch }, payload) {
            await API.uploadFiles(payload.files, payload.destination);
            await dispatch("updateFilesList");
        },

        async moveEntries({ commit, dispatch }, payload) {
            await API.moveEntries(payload.entries, payload.destination);
            await dispatch("updateFilesList");
        },

        async copyEntries({ commit, dispatch }, payload) {
            await API.copyEntries(payload.entries, payload.destination);
            await dispatch("updateFilesList");
        },

        async renameEntries({ commit, dispatch }, payload) {
            await API.renameEntries(payload.entries, payload.names);
            await dispatch("updateFilesList");
        },

        async deleteEntries({ commit, dispatch }, entriesPaths) {
            await API.deleteEntries(entriesPaths);
            await dispatch("updateFilesList");
        }
    },

    getters: {
        folderByLink: (state) => (link = "") => {
            return state.filesList.find(entry => {
                return API.Helpers.isFolder(entry) && entry.link === link;
            });
        }
    }
};
