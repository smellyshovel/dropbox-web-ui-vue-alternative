import API from "@/middleware/api.js";

export default {
    namespaced: true,
    state: {
        fatalError: null,
        excusableError: null,

        filesList: [],
        filesTree: {}
    },
    mutations: {
        SET_FATAL_ERROR(state, err) {
            state.fatalError = err;
        },

        UPDATE_FILES_LIST(state, filesList) {
            state.filesList = filesList;
        },

        UPDATE_FILES_TREE(state, filesTree) {
            state.filesTree = filesTree;
        }
    },
    actions: {
        connect({ commit }) {
            try {
                API.connect();
            } catch (err) {
                console.error(err);
                commit("SET_FATAL_ERROR", err);
            }
        },

        async updateFiles({ commit }) {
            try {
                let filesList = await API.getFilesList();
                commit("UPDATE_FILES_LIST", filesList);

                let filesTree = API.Helpers.buildTree(filesList);
                commit("UPDATE_FILES_TREE", filesTree);
            } catch (err) {
                console.error(err);
                commit("SET_FATAL_ERROR", err);
            }
        }
    },
    getters: {
        folderByLink: (state) => (link = "") => {
            return state.filesList.find(entry => {
                return entry[".tag"] === "folder" && entry.link === link;
            });
        }
    }
};
