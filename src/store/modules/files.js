import API from "@/middleware/api.js";

export default {
    namespaced: true,

    state: {
        fatalError: null,
        excusableError: null,

        list: [],
        tree: {}
    },

    mutations: {
        SET_FATAL_ERROR(state, err) {
            state.fatalError = err;
        },

        SET_EXCUSABLE_ERROR(state, err) {
            // 
        },

        SET_LIST(state, list) {
            state.list = list;
        },

        BUILD_TREE(state, list) {
            state.tree = API.Helpers.buildTree(list);
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

        async update({ commit }) {
            try {
                let list = await API.getFilesList();

                commit("SET_LIST", list);
                commit("BUILD_TREE", list);
            } catch (err) {
                console.error(err);
                commit("SET_FATAL_ERROR", err);
            }
        }
    },

    getters: {
        folderByLink: (state) => (link = "") => {
            return state.list.find(entry => {
                return entry[".tag"] === "folder" && entry.link === link;
            });
        }
    }
};
