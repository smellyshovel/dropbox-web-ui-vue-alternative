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

// build a tree structure from native FileList and return it
function restoreStructureFromFiles(files, destination) {
    if (files[0].webkitRelativePath) { // if uploading a folder
        return files.map(file => {
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
        }).concat(files.map((file, i, folders) => {
            return new File({
                name: file.name,
                path: (destination.path + "/" + file.webkitRelativePath).toLowerCase(),
                lastModified: file.lastModified,
                size: file.size
            }, true);
        })).reduce((acc, curr, i, list) => {
            let parentFolderPath = curr.path.split("/");
            parentFolderPath.pop();
            parentFolderPath = parentFolderPath.join("/");

            curr.parent = list.find(entry => {
                return entry.path === parentFolderPath;
            }) || destination;

            if (curr.parent === destination) {
                acc.push(curr);
                return acc;
            } else {
                curr.parent.contents.push(curr);
                return acc;
            }
        }, []);
    } else { // if uploading (possibly multiple) files
        return files.map(file => {
            let newFile = new File({
                name: file.name,
                path: (destination.path + "/" + file.webkitRelativePath).toLowerCase(),
                lastModified: file.lastModified,
                size: file.size
            }, true);

            newFile.parent = destination;
            return newFile;
        });
    }
}

export default {
    namespaced: true,

    state: {
        accountInfo: null,
        entries: []
    },

    mutations: {
        SAVE_TOKEN(state, token) {
            localStorage.setItem("token", token);
        },

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

        MOVE_ENTRIES(state, { entries, destination, resolutionStrategies }) {
            entries = entries.reduce((acc, curr, index) => {
                if (resolutionStrategies[index] !== "skip") {
                    acc.push(curr);
                    return acc;
                } else return acc;
            }, []);

            duplicate(entries, destination).forEach(duplicate => {
                state.entries.push(duplicate);
            });

            entries.forEach(entry => {
                entry.isFake = true;
            });
        },

        COPY_ENTRIES(state, { entries, destination, resolutionStrategies }) {
            entries = entries.reduce((acc, curr, index) => {
                if (resolutionStrategies[index] !== "skip") {
                    acc.push(curr);
                    return acc;
                } else return acc;
            }, []);

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
        },

        DOWNLOAD_ENTRIES(state, entries) {
            // nothing to do here (yet?) - exists for consistency
        },

        UPLOAD_ENTRIES(state, { entries, destination, resolutionStrategies }) {
            entries = entries.reduce((acc, curr, index) => {
                if (resolutionStrategies[index] !== "skip") {
                    acc.push(curr);
                    return acc;
                } else return acc;
            }, []);

            destination.contents = destination.contents.concat(entries);

            avalanche(entries, entry => {
                state.entries.push(entry);
            });
        }
    },

    actions: {
        async connect({ commit }, token) {
            try {
                await API.connect(token);
                commit("SAVE_TOKEN", token);
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

                let resolutionStrategies = await API.Helpers.resolveConflicts(entries, destination, conflictResolver);
                if (resolutionStrategies === "cancel") return;

                commit("MOVE_ENTRIES", { entries, destination, resolutionStrategies });
                await API.moveEntries(entries, destination, resolutionStrategies);
            } catch (err) {
                handleError("moveEntries", err);
            } finally {
                await dispatch("updateEntries");
            }
        },

        async copyEntries({ state, commit, dispatch }, { entries, destination, conflictResolver }) {
            try {
                API.Helpers.checkCopyEntriesForEarlyErrors(entries, destination, state.accountInfo.spaceUsage);

                let resolutionStrategies = await API.Helpers.resolveConflicts(entries, destination, conflictResolver);
                if (resolutionStrategies === "cancel") return;

                commit("COPY_ENTRIES", { entries, destination, resolutionStrategies });
                await API.copyEntries(entries, destination, resolutionStrategies);
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
                API.Helpers.checkDownloadEntriesForEarlyErrors(entries, asZip);

                await API.downloadEntries(entries, asZip);
            } catch (err) {
                handleError("downloadEntries", err);
            }
        },

        async uploadEntries({ state, commit, dispatch }, { files, destination, conflictResolver}) {
            try {
                files = Array.from(files); if (files.length < 1) return;
                let entries = restoreStructureFromFiles(files, destination);

                API.Helpers.checkUploadEntriesForEarlyErrors(entries, destination, state.accountInfo.spaceUsage);

                let resolutionStrategies = await API.Helpers.resolveConflicts(entries, destination, conflictResolver);
                if (resolutionStrategies === "cancel") return;

                commit("UPLOAD_ENTRIES", { entries, destination, resolutionStrategies });
                await API.uploadEntries(files, entries, destination, resolutionStrategies);
            } catch (err) {
                handleError("uploadEntries", err);
            } finally {
                await dispatch("updateAccountInfo");
                dispatch("updateEntries");
            }
        }
    },

    getters: {
        // only used to tweak the UI
        connected: (state, getters) => {
            return !!getters.token;
        },

        token: () => {
            return localStorage.getItem("token");
        },

        folderByLink: (state) => (link) => {
            return state.entries.find(entry => {
                return entry.link === link;
            });
        }
    }
};
