import { Dropbox } from "dropbox";
import IsomorphicFetch from "isomorphic-fetch";
import AccessToken from "@/../secret/DROPBOX_AUTH_TOKEN.txt";
import * as Helpers from "./helpers.js";
import { CustomError } from "@/middleware/errors.js";

export default {
    /*
        Reasons to throw: remote
    */
    connect() {
        this.Conn = new Dropbox({
            fetch: IsomorphicFetch,
            accessToken: AccessToken
        });
    },

    set Conn(v) {
        this._connection = v;
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
        if (!this.Helpers.nameIsCorrect(name)) {
            throw new CustomError({
                reason: "bad_name",
                details: name
            });
        }

        destination.contents.forEach(existingEntry => {
            if (existingEntry.name === name) {
                throw new CustomError({
                    reason: "already_exists",
                    details: existingEntry
                });
            }
        });

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
    async moveEntries(entries, destination, conflictResolver) {
        // checking for naming conflicts
        let conflicts = entries.map(entry => {
            return {
                source: entry,
                target: destination.contents.find(destinationEntry => destinationEntry.name === entry.name)
            }
        }).filter(item => item.target);

        for (let i = 0; i < conflicts.length; i++) {
            let { strategy, sameForTheRest } = await conflictResolver(conflicts[i], conflicts.length);

            if (strategy === "cancel") {
                return;
            }

            if (sameForTheRest) {
                conflictResolver = { strategy, sameForTheRest: false };
            }

            if (strategy === "skip") {
                let indexOfEntryToSkip = entries.indexOf(conflicts[i].source);
                entries.splice(indexOfEntryToSkip, 1);
            } // no need to do anything in case of "autorename" because it would be handled automatically by Dropbox (see `autorename: true` below)
        }

        if (entries.length === 1) {
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
    */
    async copyEntries(entries, destination, conflictResolver, spaceUsage) {
        // validations
        let entriesSize = entries.reduce((acc, curr) => {
            return acc + curr.size;
        }, 0);

        if (entriesSize > spaceUsage.free) {
            throw new CustomError({
                reason: "not_enough_space",
                details: spaceUsage.free
            });
        }

        // checking for naming conflicts
        let conflicts = entries.map(entry => {
            return {
                source: entry,
                target: destination.contents.find(destinationEntry => destinationEntry.name === entry.name)
            }
        }).filter(item => item.target);

        for (let i = 0; i < conflicts.length; i++) {
            let { strategy, sameForTheRest } = await conflictResolver(conflicts[i], conflicts.length);

            if (strategy === "cancel") {
                return;
            }

            if (sameForTheRest) {
                conflictResolver = { strategy, sameForTheRest: false };
            }

            if (strategy === "skip") {
                let indexOfEntryToSkip = entries.indexOf(conflicts[i].source);
                entries.splice(indexOfEntryToSkip, 1);
            } // no need to do anything in case of "autorename" because it would be handled automatically by Dropbox (see `autorename: true` below)
        }

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
                    let res = { ".tag": result, entries: resEntries } = await this.Conn.filesCopyBatchCheckV2({ async_job_id });

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
        if (!this.Helpers.nameIsCorrect(name)) {
            throw new CustomError({
                reason: "bad_name",
                details: name
            });
        }

        entry.parent.contents.forEach(existingEntry => {
            if (existingEntry.name === name) {
                throw new CustomError({
                    reason: "already_exists",
                    details: existingEntry
                });
            }
        });

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

    async download(entry) {
        try {
            let { link } = await this.Conn.filesGetTemporaryLink({
                path: entry.path
            });

            let downloadButton = document.createElement("a");
            downloadButton.setAttribute("href", link);
            downloadButton.click();
        } catch (err) {
            // the error comming from the API request is not an instance of Error
            if (err instanceof Error) {
                throw new Error("There was an error processing your download");
            } else {
                throw new Error("Couldn't download the file");
            }
        }
    },

    async uploadEntries(files, dest) {
        const DIRECT_UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        const SESSION_UPLOAD_MAX_CHUNK_SIZE = 8 * 1024 * 1024;
        const UPLOADS = [];

        for (let i = 0; i < files.length; i++) {
            let file = files.item(i),
                desiredPath = dest + "/" + (file.webkitRelativePath || file.name);

            if (file.size < DIRECT_UPLOAD_FILE_SIZE_LIMIT) {
                UPLOADS.push(this.Conn.filesUpload({
                    path: desiredPath,
                    autorename: true,
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
                            mode: 'add',
                            autorename: true,
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
        }

        return Promise.all(UPLOADS)
    },

    Helpers
}
