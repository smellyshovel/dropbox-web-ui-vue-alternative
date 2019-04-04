export default {
    namespaced: true,

    state: {
        show: false,
        purpose: "",
        currentFolder: null,
        prohibitedFolders: null,
        choise: null,
        resolver: null
    },

    mutations: {
        SHOW_FILE_PICKER(state) {
            state.show = true;
        },

        SET_PURPOSE(state, purpose) {
            state.purpose = purpose;
        },

        SET_CURRENT_FOLDER(state, folder) {
            state.currentFolder = folder;
        },

        PROHIBIT_FOLDERS(state, folders) {
            state.prohibitedFolders = folders;
        },

        CHOOSE_FOLDER(state, folder) {
            state.choise = folder;
        },

        SAVE_PROMISE(state, { resolve, reject }) {
            state.promise = {
                resolve,
                reject
            };
        },

        RESOLVE_PROMISE(state, value) {
            state.promise.resolve(value);
        },

        REJECT_PROMISE(state) {
            state.promise.reject("file_picker_cancel");
        },

        CLEAR_STATE(state) {
            state.show = false;
            state.purpose = "";
            state.currentFolder = null;
            state.prohibitedFolders = null;
            state.choise = null;
            state.resolver = null;
        }
    },

    actions: {
        async pickFolder({ commit, getters, dispatch }, { purpose, entries }) {
            commit("SET_PURPOSE", purpose);

            let currentFolder = entries.map(entry => {
                return entry.parent;
            }).sort((a, b) => {
                return a.path.length < b.path.length;
            })[0];

            commit("SET_CURRENT_FOLDER", currentFolder.parent ? currentFolder.parent : currentFolder);

            // can't move folders inside themselves, their parents and their sub-folders; and can't move files inside thair parents
            // can't copy folders inside themselves (Dropbox's quirk) and their sub-folders
            if (purpose === "move") {
                let prohibitedFolders = entries.map(entry => {
                    if (entry.type === "folder") {
                        return [entry.parent].concat(getters.allContents(entry));
                    } else if (entry.type === "file") {
                        return entry.parent;
                    }
                }).reduce((acc, curr) => {
                    return acc.concat(curr);
                }, []).filter((folder, index, self) => {
                    return self.indexOf(folder) === index;
                });

                commit("PROHIBIT_FOLDERS", prohibitedFolders);
            } else if (purpose === "copy") {
                let prohibitedFolders = entries.map(entry => {
                    if (entry.type === "folder") {
                        return getters.allContents(entry);
                    } else if (entry.type === "file") {
                        return entry.parent;
                    }
                }).reduce((acc, curr) => {
                    return acc.concat(curr);
                }, []).filter((folder, index, self) => {
                    return self.indexOf(folder) === index;
                });

                commit("PROHIBIT_FOLDERS", prohibitedFolders);
            } else if (purpose === "upload") {
                // TODO
            }

            commit("SHOW_FILE_PICKER");

            return new Promise((resolve, reject) => {
                commit("SAVE_PROMISE", { resolve, reject });
            })
                .finally(() => {
                    commit("CLEAR_STATE");
                    dispatch("ui/selections/clear", null, { root: true });
                });
        },

        changeFolder({ commit }, folder) {
            commit("SET_CURRENT_FOLDER", folder);
        },

        chooseFolder({ commit }, folder) {
            commit("CHOOSE_FOLDER", folder);
        },

        resolve({ commit, getters }) {
            commit("RESOLVE_PROMISE", getters.choise);
        },

        reject({ commit }) {
            commit("REJECT_PROMISE");
        }
    },

    getters: {
        choise: (state) => {
            return state.choise;
        },

        allContents: (state, getters, rootState) => (folder) => { // including the folder itself
            return rootState.cloud.entries.filter(entry => {
                return entry.type === "folder";
            }).filter(entry => {
                return entry.path.startsWith(folder.path);
            });
        }
    }
};
