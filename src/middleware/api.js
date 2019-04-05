import { Dropbox } from "dropbox";
import * as Helpers from "./helpers.js";
import { CustomError } from "@/middleware/errors.js";

let Connection = null;

export default {
    /*
        Reasons to throw: no_token, bad_token
    */
    async connect(token) {
        if (Connection) return;

        if (!token) {
            throw new CustomError({
                reason: "no_token",
                details: {
                    argToken: token,
                    localStorageToken: localStorage.getItem("token")
                }
            })
        }

        Connection = new Dropbox({
            fetch: fetch,
            accessToken: token
        });

        // check if the token is OK by performing some API method
        try {
            await Connection.usersGetCurrentAccount();
        } catch (err) {
            throw new CustomError({
                reason: "bad_token",
                details: err
            });
        }

        return Connection;
    },

    /*
        Reasons to throw: remote
    */
    async getAccountInfo() {
        try {
            var accountInfo = await Connection.usersGetCurrentAccount();
            var spaceUsage = await Connection.usersGetSpaceUsage();
        } catch (err) {
            throw new CustomError({
                reason: "remote",
                details: err
            });
        }

        console.log(accountInfo);

        return {
            email: accountInfo.email,
            name: accountInfo.name.display_name,
            photo: accountInfo.profile_photo_url || require("@/assets/default_photo.svg"),
            spaceUsage: {
                total: spaceUsage.allocation.allocated,
                occupied: spaceUsage.used,
                free: spaceUsage.allocation.allocated - spaceUsage.used
            }
        }
    },

    /*
        Reasons to throw: remote
    */
    async getEntries() {
        try {
            let lastAns = await Connection.filesListFolder({
                path: "",
                recursive: true
            });

            var entries = lastAns.entries;

            while (lastAns.has_more) {
                lastAns = await Connection.filesListFolderContinue({ cursor: lastAns.cursor });
                entries = entries.concat(lastAns.entries);
            }
        } catch (err) {
            throw new CustomError({
                reason: "remote",
                details: err
            });
        }

        // pretend that Dropbox has also returned the root folder (as it actually doesn't do)
        entries.unshift({
            ".tag": "folder",
            id: "id:root",
            name: "/",
            path_display: "",
            path_lower: ""
        });

        return this.Helpers.handleEntries(entries);
    },

    /*
        Reasons to throw: bad_name, already_exists, remote
    */
    async createFolder(name, destination) {
        let desiredPath = destination.path + "/" + name;

        try {
            await Connection.filesCreateFolderV2({
                path: desiredPath,
                autorename: true
            });
        } catch (err) {
            throw new CustomError ({
                reason: "remote",
                details: err
            });
        }
    },

    /*
        Reasons to throw: remote_sole, remote_several
        Conflict resolving strategies: autorename, skip
    */
    async moveEntries(entries, destination, resolutionStrategies) {
        entries = entries.reduce((acc, curr, index) => {
            if (resolutionStrategies[index] !== "skip") {
                acc.push(curr);
                return acc;
            } else return acc;
        }, []);

        if (entries.length === 1) { // speed up the process if there's a sole entry to move
            let fromPath = entries[0].path;
            let toPath = destination.path + "/" + entries[0].name;

            try {
                await Connection.filesMoveV2({
                    from_path: fromPath,
                    to_path: toPath,
                    autorename: true
                });
            } catch (err) {
                throw new CustomError({
                    reason: "remote_sole",
                    details: err
                });
            }
        } else if (entries.length > 1) {
            let relocationPaths = entries.map(entry => ({
                from_path: entry.path,
                to_path: destination.path + "/" + entry.name
            }));

            let { ".tag": result, entries: resEntries, async_job_id } = await Connection.filesMoveBatchV2({
                entries: relocationPaths,
                autorename: true
            });

            if (result === "complete") { // ended syncronously
                resEntries.forEach(entry => {
                    if (entry[".tag"] !== "success") {
                        throw new CustomError({
                            reason: "remote_several",
                            details: resEntries
                        });
                    }
                });
            } else if (result === "async_job_id") { // ended asyncronously
                let keepFetching = true;

                while (keepFetching) {
                    let res = { ".tag": result, entries: resEntries } = await Connection.filesMoveBatchCheckV2({ async_job_id });

                    if (result === "complete") {
                        keepFetching = false;

                        resEntries.forEach(entry => {
                            if (entry[".tag"] !== "success") {
                                throw new CustomError({
                                    reason: "remote_several",
                                    details: resEntries
                                });
                            }
                        });
                    }
                }
            }
        }
    },

    /*
        Reasons to throw: not_enough_space, remote_sole, remote_several
        Conflict resolving strategies: autorename, skip
    */
    async copyEntries(entries, destination, resolutionStrategies) {
        entries = entries.reduce((acc, curr, index) => {
            if (resolutionStrategies[index] !== "skip") {
                acc.push(curr);
                return acc;
            } else return acc;
        }, []);

        if (entries.length === 1) {
            let fromPath = entries[0].path;
            let toPath = destination.path + "/" + entries[0].name;

            try {
                await Connection.filesCopyV2({
                    from_path: fromPath,
                    to_path: toPath,
                    autorename: true
                });
            } catch (err) {
                throw new CustomError({
                    reason: "remote_sole",
                    details: err
                });
            }
        } else if (entries.length > 1) {
            let relocationPaths = entries.map(entry => ({
                from_path: entry.path,
                to_path: destination.path + "/" + entry.name
            }));

            let { ".tag": result, entries: resEntries, async_job_id } = await Connection.filesCopyBatchV2({
                entries: relocationPaths,
                autorename: true
            });

            if (result === "complete") { // ended syncronously
                resEntries.forEach(entry => {
                    if (entry[".tag"] !== "success") {
                        throw new CustomError({
                            reason: "remote_several",
                            details: resEntries
                        });
                    }
                });
            } else if (result === "async_job_id") { // ended asyncronously
                let keepFetching = true;

                while (keepFetching) {
                    let res = { ".tag": result, entries: resEntries } = await Connection.filesCopyBatchCheckV2({ async_job_id }); // TODO: do I really need res here?

                    if (result === "complete") {
                        keepFetching = false;

                        resEntries.forEach(entry => {
                            if (entry[".tag"] !== "success") {
                                throw new CustomError({
                                    reason: "remote_several",
                                    details: resEntries
                                });
                            }
                        });
                    }
                }
            }
        }
    },

    /*
        Reasons to throw: bad_name, already_exists, remote
    */
    async renameEntry(entry, name) {
        let fromPath = entry.path;
        let toPath = fromPath.split("/");
        toPath.pop();
        toPath.push(name);
        toPath = toPath.join("/");

        try {
            await Connection.filesMoveV2({
                from_path: fromPath,
                to_path: toPath,
                autorename: true
            });
        } catch (err) {
            throw new CustomError({
                reason: "remote",
                details: err
            });
        }
    },

    /*
        Reasons to throw: remote_sole, remote_several
    */
    async deleteEntries(entries) {
        if (entries.length === 1) {
            let path = entries[0].path;

            try {
                await Connection.filesDeleteV2({ path });
            } catch (err) {
                throw new CustomError({
                    reason: "remote_sole",
                    details: err
                });
            }
        } else if (entries.length > 1) {
            let paths = entries.map(entry => ({
                path: entry.path,
            }));

            let { ".tag": result, entries: resEntries, async_job_id } = await Connection.filesDeleteBatch({ entries: paths });

            if (result === "complete") {
                resEntries.forEach(entry => {
                    if (entry[".tag"] !== "success") {
                        throw new CustomError({
                            reason: "remote_several",
                            details: resEntries
                        });
                    }
                });
            } else if (result === "async_job_id") {
                let keepFetching = true;

                while (keepFetching) {
                    let res = { ".tag": result, entries: resEntries } = await Connection.filesDeleteBatchCheck({ async_job_id });

                    if (result === "complete") {
                        keepFetching = false;

                        resEntries.forEach(entry => {
                            if (entry[".tag"] !== "success") {
                                throw new CustomError({
                                    reason: "remote_several",
                                    details: resEntries
                                });
                            }
                        });
                    }
                }
            }
        }
    },

    /*
        Reasons to throw: remote_sole, remote_several, remote_zip
    */
    async downloadEntries(entries, asZip) {
        if (asZip) {
            const TEMP_FOLDER_DESIRED_PATH = "/__temp__downloading__";

            let { metadata: folder } = await Connection.filesCreateFolderV2({
                path: TEMP_FOLDER_DESIRED_PATH,
                autorename: true
            });

            let relocationPaths = entries.map(entry => ({
                from_path: entry.path,
                to_path: folder.path_lower + "/" + entry.name
            }));

            let { ".tag": result, async_job_id } = await Connection.filesCopyBatchV2({
                entries: relocationPaths,
                autorename: true
            });

            const downloadZip = async () => {
                try {
                    var { fileBlob } = await Connection.filesDownloadZip({ path: folder.path_lower });
                } catch (err) {
                    throw new CustomError({
                        reason: "remote_zip",
                        details: err
                    });
                } finally {
                    await Connection.filesDeleteV2({ path: folder.path_lower });
                }

                this.Helpers.downloadBlob(fileBlob, "DOWNLOAD.zip");
            };

            if (result === "complete") { // ended syncronously
                await downloadZip();
            } else if (result === "async_job_id") { // ended asyncronously
                let keepFetching = true;

                while (keepFetching) {
                    let { ".tag": result } = await Connection.filesMoveBatchCheckV2({ async_job_id });

                    if (result === "complete") {
                        keepFetching = false;

                        await downloadZip();
                    }
                }
            }
        } else {
            let filesToDownload = entries.map(entry => {
                if (entry.type === "folder") {
                    return this.Helpers.extractContentsRecursively(entry);
                } else return entry;
            }).reduce((acc, curr) => acc.concat(curr), []);


            await Promise.all(filesToDownload.map(async file => {
                try {
                    var { fileBlob, name } = await Connection.filesDownload({ path: file.path });
                } catch (err) {
                    throw new CustomError({
                        reason: filesToDownload.length === 1 ? "remote_sole" : "remote_several",
                        details: err
                    });
                }

                this.Helpers.downloadBlob(fileBlob, name);
            }));
        }
    },

    /*
        Reasons to throw: not_enough_space, remote_sole, remote_several
        Conflict resolving strategies: autorename, skip
    */
    async uploadEntries(files, entries, destination, resolutionStrategies) {
        let entriesPaths = entries.reduce((acc, curr, index) => {
            if (resolutionStrategies[index] !== "skip") {
                acc.push(curr);
                return acc;
            } else return acc;
        }, []).map(entry => {
            return entry.path;
        });

        files = files.filter(file => {
            file.path = destination.path + "/" + (file.webkitRelativePath || file.name);
            return entriesPaths.some(entryPath => {
                return file.path.toLowerCase().startsWith(entryPath);
            });
        });

        const DIRECT_UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024; // 150MB
        const SESSION_UPLOAD_MAX_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB
        const UPLOADS = [];

        files.forEach(file => {
            let desiredPath = file.path;

            if (file.size < DIRECT_UPLOAD_FILE_SIZE_LIMIT) {
                UPLOADS.push(Connection.filesUpload({
                    path: desiredPath,
                    mode: "add",
                    autorename: true,
                    strict_conflict: true,
                    contents: file
                }));
            } else {
                let fileBlobs = [],
                    offset = 0;

                while (offset < file.size) {
                    let chunkSize = Math.min(SESSION_UPLOAD_MAX_CHUNK_SIZE, file.size - offset);
                    fileBlobs.push(file.slice(offset, offset + chunkSize));
                    offset += chunkSize;
                }

                let task = fileBlobs.reduce(async (sessionId, blob, index, items) => {
                    if (index === 1) {
                        return (await Connection.filesUploadSessionStart({
                            close: false,
                            contents: blob
                        })).session_id;
                    } else if (index < items.length - 1) {
                        let cursor = {
                            session_id: await sessionId,
                            offset: (index - 1) * SESSION_UPLOAD_MAX_CHUNK_SIZE,
                        };

                        await Connection.filesUploadSessionAppendV2({
                            cursor: cursor,
                            close: false,
                            contents: blob
                        });

                        return sessionId;
                    } else {
                        var cursor = {
                            session_id: await sessionId,
                            offset: file.size - blob.size - SESSION_UPLOAD_MAX_CHUNK_SIZE
                        };

                        var commit = {
                            path: desiredPath,
                            mode: "add",
                            autorename: true,
                            strict_conflict: true,
                            mute: false
                        };

                        return Connection.filesUploadSessionFinish({
                            cursor: cursor,
                            commit: commit,
                            contents: blob
                        });
                    }
                });

                UPLOADS.push(task);
            }
        });

        try {
            await Promise.all(UPLOADS);
        } catch (err) {
            throw new CustomError({
                reason: UPLOADS.length === 1 ? "remote_sole" : "remote_several",
                details: err
            });
        }
    },

    Helpers
}
