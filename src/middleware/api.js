import { Dropbox } from "dropbox";
import IsomorphicFetch from "isomorphic-fetch";
import AccessToken from "@/../secret/DROPBOX_AUTH_TOKEN.txt";
import * as Helpers from "./helpers.js";
import { CustomError } from "@/middleware/errors.js";

export default {
    /*
        Reasons to throw: remote
    */
    async connect() {
        this.Conn = new Dropbox({
            fetch: IsomorphicFetch,
            accessToken: AccessToken
        });
    },

    set Conn(val) {
        this._connection = val;
    },

    get Conn() {
        return this._connection;
    },

    /*
        Reasons to throw: remote
    */
    async getAccountInfo() {
        try {
            var spaceUsage = await this.Conn.usersGetSpaceUsage();
        } catch (err) {
            throw new CustomError({
                reason: "remote",
                details: err
            });
        }

        return {
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
            let lastAns = await this.Conn.filesListFolder({
                path: "",
                recursive: true
            });

            var entries = lastAns.entries;

            while (lastAns.has_more) {
                lastAns = await this.Conn.filesListFolderContinue({ cursor: lastAns.cursor });
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
            await this.Conn.filesCreateFolderV2({
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
                await this.Conn.filesMoveV2({
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

            let { ".tag": result, entries: resEntries, async_job_id } = await this.Conn.filesMoveBatchV2({
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
                    let res = { ".tag": result, entries: resEntries } = await this.Conn.filesMoveBatchCheckV2({ async_job_id });

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
                await this.Conn.filesCopyV2({
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

            let { ".tag": result, entries: resEntries, async_job_id } = await this.Conn.filesCopyBatchV2({
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
                    let res = { ".tag": result, entries: resEntries } = await this.Conn.filesCopyBatchCheckV2({ async_job_id }); // TODO: do I really need res here?

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
            await this.Conn.filesMoveV2({
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
                await this.Conn.filesDeleteV2({ path });
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

            let { ".tag": result, entries: resEntries, async_job_id } = await this.Conn.filesDeleteBatch({ entries: paths });

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
                    let res = { ".tag": result, entries: resEntries } = await this.Conn.filesDeleteBatchCheck({ async_job_id });

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

            let { metadata: folder } = await this.Conn.filesCreateFolderV2({
                path: TEMP_FOLDER_DESIRED_PATH,
                autorename: true
            });

            let relocationPaths = entries.map(entry => ({
                from_path: entry.path,
                to_path: folder.path_lower + "/" + entry.name
            }));

            let { ".tag": result, async_job_id } = await this.Conn.filesCopyBatchV2({
                entries: relocationPaths,
                autorename: true
            });

            const downloadZip = async () => {
                try {
                    var { fileBlob } = await this.Conn.filesDownloadZip({ pth: folder.path_lower });
                } catch (err) {
                    throw new CustomError({
                        reason: "remote_zip",
                        details: err
                    });
                } finally {
                    await this.Conn.filesDeleteV2({ path: folder.path_lower });
                }

                this.Helpers.downloadBlob(fileBlob, "DOWNLOAD.zip");
            };

            if (result === "complete") { // ended syncronously
                await downloadZip();
            } else if (result === "async_job_id") { // ended asyncronously
                let keepFetching = true;

                while (keepFetching) {
                    let { ".tag": result } = await this.Conn.filesMoveBatchCheckV2({ async_job_id });

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
                    var { fileBlob, name } = await this.Conn.filesDownload({ path: file.path });
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
    async uploadEntries(originalFiles, destination, conflictResolver, spaceUsage) {
        let files = [];
        for (let i = 0; i < originalFiles.length; i++) {
            files.push(originalFiles.item(i));
        }

        // validations
        let filesSize = Array.from(files).reduce((acc, curr) => {
            return acc + curr.size;
        }, 0);

        if (filesSize > spaceUsage.free) {
            throw new CustomError({
                reason: "not_enough_space",
                details: spaceUsage.free
            });
        }

        // checking for naming conflicts
        let conflicts = Array.from(files).map(file => {
            return {
                source: file,
                target: destination.contents.find(destinationEntry => !destinationEntry.isFake && destinationEntry.name === file.name)
            }
        }).filter(item => item.target);

        for (let i = 0; i < conflicts.length; i++) {
            let { strategy, sameForTheRest } = await conflictResolver(conflicts[i], conflicts.length);

            if (strategy === "cancel") {
                return;
            }

            if (sameForTheRest) {
                conflictResolver = () => ({ strategy, sameForTheRest: false });
            }

            if (strategy === "skip") {
                let indexOfEntryToSkip = files.indexOf(conflicts[i].source);
                files.splice(indexOfEntryToSkip, 1);
            } // no need to do anything in case of "autorename" because it would be handled automatically by Dropbox (see `autorename: true` below)
        }

        const DIRECT_UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024; // 150MB
        const SESSION_UPLOAD_MAX_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB
        const UPLOADS = [];

        files.forEach(file => {
            let desiredPath = destination.path + "/" + (file.webkitRelativePath || file.name);

            if (file.size < DIRECT_UPLOAD_FILE_SIZE_LIMIT) {
                UPLOADS.push(this.Conn.filesUpload({
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
                        return (await this.Conn.filesUploadSessionStart({
                            close: false,
                            contents: blob
                        })).session_id;
                    } else if (index < items.length - 1) {
                        let cursor = {
                            session_id: await sessionId,
                            offset: (index - 1) * SESSION_UPLOAD_MAX_CHUNK_SIZE,
                        };

                        await this.Conn.filesUploadSessionAppendV2({
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

                        return this.Conn.filesUploadSessionFinish({
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
