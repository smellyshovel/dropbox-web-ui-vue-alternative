import API from "@/middleware/api.js";

export default {
    namespaced: true,

    state: {
        loading: null,
        fatalError: null,
        excusableError: null,

        list: [],
        tree: {}
    },

    mutations: {
        SET_LOADING(state, status) {
            state.loading = status;
        },

        STOP_LOADING(state, status) {
            state.loading = false;
        },

        SET_FATAL_ERROR(state, err) {
            state.fatalError = err;
        },

        SET_EXCUSABLE_ERROR(state, err) {
            state.excusableError = err;
        },

        SET_LIST(state, list) {
            state.list = list;
        },

        SET_TREE(state, tree) {
            state.tree = tree;
        }
    },

    actions: {
        setLoading({ commit }, status) {
            commit("SET_LOADING", status);
        },

        stopLoading({ commit }) {
            commit("STOP_LOADING");
        },

        connect({ commit }) {
            let i = 0;
            while (i < 1000000) {
                i++;
            }
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

                let tree = API.Helpers.buildTree(list);
                commit("SET_TREE", tree);
            } catch (err) {
                console.error(err);
                commit("SET_FATAL_ERROR", err);
            }
        },

        async download({ commit }, entry) {
            try {
                await API.download(entry);
            } catch (err) {
                console.error(err);
                commit("SET_EXCUSABLE_ERROR", err);
            }
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
