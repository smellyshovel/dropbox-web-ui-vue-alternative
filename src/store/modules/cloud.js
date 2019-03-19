import API from "@/middleware/api.js";
import { handleError } from "@/middleware/errors.js";
import { File, Folder } from "@/middleware/entry.js";

// clone entries to a new destination
function duplicate(entries, parent) {
    return entries.map(entry => {
        if (entry.type === "folder") {
            var newEntry = new Folder({
                name: entry.name,
                path: (parent.path + "/" + entry.name).toLowerCase()
            }, true);

            if (entry.contents.length) {
                let contents = duplicate(entry.contents, newEntry);
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
        return newEntry;
    })
}

// apply customiser to all the passed entries and their contents
function avalanche(entries, customiser) {
    entries.forEach(entry => {
        customiser(entry);

        if (entry.type === "folder" && entry.contents.length) {
            avalanche(entry.contents, customiser);
        }
    });
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
            duplicate(entries, destination).forEach(duplicate => {
                state.entries.push(duplicate);
            });

            entries.forEach(entry => {
                entry.isFake = true;
            });
        },

        COPY_ENTRIES(state, { entries, destination }) {
            duplicate(entries, destination).forEach(duplicate => {
                state.entries.push(duplicate);
            });
        },

        RENAME_ENTRY(state, { entry, name }) {
            entry.name = name;
            entry.updateThumbnail();

            avalanche([entry], entry => {
                entry.path = (entry.parent.path + "/" + entry.name).toLowerCase();
                entry.isFake = true;
            });
        },

        DELETE_ENTRIES(state, entries) {
            avalanche(entries, entry => {
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
                API.Helpers.checkCreateFolderForEarlyErrors(name, destination);

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
                API.Helpers.checkMoveEntriesForEarlyErrors(entries, destination);

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
                API.Helpers.checkCopyEntriesForEarlyErrors(entries, destination, state.accountInfo.spaceUsage);

                commit("COPY_ENTRIES", { entries, destination });
                await API.copyEntries(entries, destination, conflictResolver);
            } catch (err) {
                handleError("copyEntries", err);
            } finally {
                await dispatch("updateAccountInfo");
                await dispatch("updateEntries");
            }
        },

        async renameEntry({ commit, dispatch }, { entry, name }) {
            try {
                API.Helpers.checkRenameEntryForEarlyErrors(entry, name);

                // the entry will later be modified so initiate renaming with the original entry first and only later await for the result
                let res = API.renameEntry(entry, name);
                commit("RENAME_ENTRY", { entry, name });
                await res;
            } catch (err) {
                handleError("renameEntry", err);
            } finally {
                await dispatch("updateEntries");
            }
        },

        async deleteEntries({ commit, dispatch }, entries) {
            try {
                API.Helpers.checkDeleteEntriesForEarlyErrors(entries);

                commit("DELETE_ENTRIES", entries);
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
