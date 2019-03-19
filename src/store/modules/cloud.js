import API from "@/middleware/api.js";
import { handleError } from "@/middleware/errors.js";
import { File, Folder } from "@/middleware/entry.js";
import { cloneDeep, cloneDeepWith } from "lodash";

function duplicate(state, entries, parent) {
    return entries.map(entry => {
        if (entry.type === "folder") {
            var newEntry = new Folder({
                name: entry.name,
                path: (parent.path + "/" + entry.name).toLowerCase()
            }, true);

            if (entry.contents.length) {
                let contents = duplicate(state, entry.contents, newEntry);
                newEntry.contents = contents;
            }
        } else if (entry.type === "file") {
            var newEntry = new File({
                name: entry.name,
                path: (parent.path + "/" + entry.name).toLowerCase(),
                lastModified: entry.lastModified,
                size: entry.size
            }, true);
        }

        newEntry.parent = parent;
        parent.contents.push(newEntry);
        state.entries.push(newEntry);

        return newEntry;
    })
}

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
        },

        CREATE_FOLDER(state, { name, destination }) {
            let newFolder = new Folder({
                name,
                path: (destination.path + "/" + name).toLowerCase()
            }, true);

            newFolder.parent = destination;
            destination.contents.push(newFolder);
            state.entries.push(newFolder);
        },

        MOVE_ENTRIES(state, { entries, destination }) {
            duplicate(state, entries, destination);

            entries.forEach(entry => {
                entry.isFake = true;
            });
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

        async createFolder({ commit, dispatch }, { name, destination }) {
            try {
                commit("CREATE_FOLDER", { name, destination });
                await API.createFolder(name, destination);
            } catch (err) {
                handleError("createFolder", err);
            } finally {
                await dispatch("updateEntries");
            }
        },

        async moveEntries({ commit, dispatch }, { entries, destination, conflictResolver }) {
            try {
                commit("MOVE_ENTRIES", { entries, destination });
                await API.moveEntries(entries, destination, conflictResolver);
            } catch (err) {
                handleError("moveEntries", err);
            } finally {
                await dispatch("updateEntries");
            }
        },

        async copyEntries({ state, commit, dispatch }, { entries, destination, conflictResolver }) {
            try {
                commit("ADD_FAKE_ENTRIES", entries.map(entry => {
                    if (entry.type === "folder") {
                        return new Folder({
                            id: entry.id,
                            name: entry.name,
                            path: destination.path + "/" + entry.name
                        }, true);
                    } else if (entry.type === "file") {
                        return new File({
                            id: entry.id,
                            name: entry.name,
                            path: destination.path + "/" + entry.name,
                            lastModified: entry.lastModified,
                            size: entry.size
                        }, true);
                    }
                }));
                // await new Promise(res => { setTimeout(res, 10000) });
                await API.copyEntries(entries, destination, conflictResolver, state.accountInfo.spaceUsage);
            } catch (err) {
                handleError("copyEntries", err);
            } finally {
                await dispatch("updateAccountInfo");
                await dispatch("updateEntries");
            }
        },

        async renameEntry({ commit, dispatch }, { entry, name }) {
            try {
                entry.isFake = true;
                entry.name = name;
                entry.updateThumbnail();

                await API.renameEntry(entry, name);
            } catch (err) {
                handleError("renameEntry", err);
            } finally {
                await dispatch("updateEntries");
            }
        },

        async deleteEntries({ commit, dispatch }, entries) {
            try {
                entries.forEach(entry => {
                    entry.isFake = true;
                });

                await API.deleteEntries(entries);
            } catch (err) {
                handleError("deleteEntries", err);
            } finally {
                await dispatch("updateAccountInfo");
                await dispatch("updateEntries");
            }
        },

        async downloadEntries({ dispatch }, { entries, asZip }) {
            try {
                await API.downloadEntries(entries, asZip);
            } catch (err) {
                handleError("downloadEntries", err);
            }
        },

        async uploadEntries({ state, commit, dispatch }, { files, destination, conflictResolver}) {
            try {
                commit("ADD_FAKE_ENTRIES", Array.from(files).map(file => {
                    let folderPath = file.webkitRelativePath.split("/");
                    folderPath.pop();
                    folderPath = folderPath.join("/");

                    return destination.path + "/" + folderPath;
                }).filter((folderPath, index, folderPaths) => { // unique
                    return folderPaths.indexOf(folderPath) === index;
                }).map(folderPath => {
                    let folderName = folderPath.split("/");
                    folderName = folderName[folderName.length - 1];

                    return new Folder({
                        name: folderName,
                        path: folderPath.toLowerCase()
                    }, true);
                }));

                commit("ADD_FAKE_ENTRIES", Array.from(files).map(file => {
                    return new File({
                        name: file.name,
                        path: (destination.path + "/" + file.webkitRelativePath).toLowerCase(),
                        lastModified: file.lastModified,
                        size: file.size
                    }, true);
                }));

                await API.uploadEntries(files, destination, conflictResolver, state.accountInfo.spaceUsage);
            } catch (err) {
                handleError("uploadEntries", err);
            } finally {
                await dispatch("updateAccountInfo");
                dispatch("updateEntries");
            }
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
