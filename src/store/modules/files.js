import API from "@/middleware/api.js";

export default {
    namespaced: true,

    state: {
        list: [],
        tree: []
    },

    mutations: {
        SET_LIST(state, list) {
            state.list = list;
        },

        SET_TREE(state, tree) {
            state.tree = tree;
        }
    },

    actions: {
        async connect({ commit }) {
            await API.connect();
        },

        async update({ commit }) {
            let list = await API.getFilesList();
            commit("SET_LIST", list);

            let tree = API.Helpers.buildTree(list);
            commit("SET_TREE", tree);
        },

        async download({ commit }, entry) {
            await API.download(entry);
        }
    },

    getters: {
        folderByLink: (state) => (link = "") => {
            return state.list.find(entry => {
                return API.Helpers.isFolder(entry) && entry.link === link;
            });
        }
    }
};
