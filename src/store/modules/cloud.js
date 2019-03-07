import API from "@/middleware/api.js";
import { handleError } from "@/middleware/errors.js";

export default {
    namespaced: true,

    state: {
        accountInfo: null,
        entries: []
    },

    mutations: {
        SET_ACCOUNT_INFO(state, accountInfo) {
            state.accountInfo = accountInfo;
        },

        SET_ENTRIES(state, entries) {
            state.entries = entries;
        }
    },

    actions: {
        async connect() {
            try {
                await API.connect();
            } catch (err) {
                handleError("connect", err);
            }
        },

        async updateAccountInfo({ commit }) {
            try {
                let accountInfo = await API.getAccountInfo();
                commit("SET_ACCOUNT_INFO", accountInfo);
            } catch (err) {
                handleError("updateAccountInfo", err);
            }
        },

        async updateEntries({ commit }) {
            try {
                let entries = await API.getEntries();
                commit("SET_ENTRIES", entries);
            } catch (err) {
                handleError("updateEntries", err);
            }
        },

        async createFolder({ dispatch }, { name, destination }) {
            try {
                await API.createFolder(name, destination);
            } catch (err) {
                handleError("createFolder", err);
            } finally {
                dispatch("updateEntries");
            }
        },

        async moveEntries({ dispatch }, { entries, destination }) {
            try {
                await API.moveEntries(entries, destination);
            } catch (err) {
                handleError("moveEntries", err);
            } finally {
                dispatch("updateEntries");
            }
        },

        async copyEntries({ state, dispatch }, { entries, destination }) {
            try {
                await API.copyEntries(entries, destination, state.accountInfo.spaceUsage);
            } catch (err) {
                handleError("copyEntries", err);
            } finally {
                dispatch("updateEntries");
            }
        },

        async renameEntry({ dispatch }, { entry, name }) {
            try {
                await API.renameEntry(entry, name);
            } catch (err) {
                handleError("renameEntry", err);
            } finally {
                dispatch("updateEntries");
            }
        },

        async deleteEntries({ dispatch }, entries) {
            try {
                await API.deleteEntries(entries);
            } catch (err) {
                handleError("deleteEntries", err);
            } finally {
                dispatch("updateEntries");
            }
        },

        async download({ commit }, entry) {
            await API.download(entry);
        },

        async uploadEntries({ commit, dispatch }, { files, destination }) {
            await API.uploadEntries(files, destination);
            await dispatch("updateEntries");
        }
    },

    getters: {
        folderByLink: (state) => (link) => {
            return state.entries.find(entry => {
                return entry.link === link;
            });
        }
    }
};
