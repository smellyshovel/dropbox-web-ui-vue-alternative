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

        async download({ commit }, entry) {
            await API.download(entry);
        },

        async upload({ commit, dispatch }, payload) {
            let files = payload.files;
            const dest = payload.destination;

            await API.uploadFiles(files, dest);
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
