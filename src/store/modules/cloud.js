import API from "@/middleware/api.js";
import Errors from "@/middleware/errors.js";

export default {
    namespaced: true,

    state: {
        entries: []
    },

    mutations: {
        SET_ENTRIES(state, entries) {
            state.entries = entries;
        }
    },

    actions: {
        async connect() {
            await API.connect();
        },

        async updateEntries({ commit }) {
            let entries = await API.getEntries();
            commit("SET_ENTRIES", entries);
        },

        async createFolder({ dispatch, getters }, { name, destination }) {
            await API.createFolder(name, destination);
            await dispatch("updateEntries");
        },

        async moveEntries({ dispatch }, { entries, destination }) {
            await API.moveEntries(entries, destination);
            await dispatch("updateEntries");
        },

        async copyEntries({ dispatch }, { entries, destination }) {
            await API.copyEntries(entries, destination);
            await dispatch("updateEntries");
        },

        async renameEntry({ dispatch }, { entry, name }) {
            await API.renameEntry(entry, name);
            await dispatch("updateEntries");
        },

        async deleteEntries({ dispatch }, entries) {
            await API.deleteEntries(entries);
            await dispatch("updateEntries");
        },

        async download({ commit }, entry) {
            await API.download(entry);
        },

        async upload({ commit, dispatch }, payload) {
            await API.uploadFiles(payload.files, payload.destination);
            await dispatch("updateEntries");
        },
    },

    getters: {
        folderByLink: (state) => (link = "") => {
            return state.entries.find(entry => {
                return API.Helpers.isFolder(entry) && entry.link === link;
            });
        },

        entryByNameInFolder: (state) => (name, folder) => {
            if (folder.children) {
                return folder.children.find(child => {
                    return child.name === name;
                });
            }

            return null;
        }
    }
};
