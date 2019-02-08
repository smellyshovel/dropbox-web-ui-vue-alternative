import API from "@/middleware/api.js";

export default {
    namespaced: true,
    state: {
        fatalError: null,
        excusableError: null,
        loading: true,

        filesList: [],
        filesTree: {}
    },
    mutations: {
        SET_FATAL_ERROR(state, err) {
            state.fatalError = err;
            state.loading = false;
        },

        UPDATE_FILES_LIST(state, filesList) {
            state.filesList = filesList;
        },

        UPDATE_FILES_TREE(state, filesTree) {
            state.filesTree = filesTree;
            state.loading = false;
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
        fatalError: state => state.fatalError,
        excusableError: state => state.excusableError,
        loading: state => state.loading,

        filesList: state => state.filesList,
        filesTree: state => state.filesTree,

        folderByLink: (state, getters) => (link = "") => {
            return getters.filesList.find(entry => {
                return entry[".tag"] === "folder" && entry.link === link;
            });
        }
    }
};
