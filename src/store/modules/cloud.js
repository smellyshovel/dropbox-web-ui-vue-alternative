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

        async createFolders({ dispatch, getters }, { names, destination }) {
            names.forEach(name => {
                let exists = getters.entryByNameInFolder(name, destination)
                if (exists) {
                    throw new Errors.CreateFoldersError(Errors.CreateFoldersError.alreadyExists(exists));
                }

                if (!API.Helpers.nameIsCorrect(name)) {
                    throw new Errors.CreateFoldersError(Errors.CreateFoldersError.badName(name));
                }
            });

            await API.createFolders(names, destination);
            await dispatch("updateEntries");
        },

        async moveEntries({ commit, dispatch }, { entries, destination }) {
            await API.moveEntries(entries, destination);
            await dispatch("updateEntries");
        },

        async copyEntries({ commit, dispatch }, { entries, destination }) {
            await API.copyEntries(entries, destination);
            await dispatch("updateEntries");
        },

        async renameEntries({ commit, dispatch }, payload) {
            await API.renameEntries(payload.entries, payload.names);
            await dispatch("updateEntries");
        },

        async deleteEntries({ commit, dispatch }, entriesPaths) {
            await API.deleteEntries(entriesPaths);
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
