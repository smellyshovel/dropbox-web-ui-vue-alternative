import API from "@/middleware/api.js";

export default {
    namespaced: true,
    state: {
        fatalError: null,
        excusableError: null,
        loading: true,
        filesList: []
    },
    mutations: {
        SET_FATAL_ERROR(state, err) {
            state.fatalError = err;
            state.loading = false;
        },

        UPDATE_FILES_LIST(state, filesList) {
            state.filesList = filesList;
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

        async updateFilesList({ commit }) {
            try {
                let filesList = await API.getFilesList();
                commit("UPDATE_FILES_LIST", filesList);
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

        tree: state => {
            return API.Helpers.buildTree(state.filesList);
        },

        folderByPath: (state, getters) => (path = "") => {
            if (path === "") {
                return {
                    name: "Home",
                    path_lower: "/",
                    path_display: "/",
                    children: getters.tree
                };
            } else {
                return state.filesList.find(entry => {
                    return entry[".tag"] === "folder" && entry.path_lower === "/" + path;
                });
            }
        }
    }
};
