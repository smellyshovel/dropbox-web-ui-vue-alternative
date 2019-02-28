import { Dropbox } from "dropbox";
import IsomorphicFetch from "isomorphic-fetch";
import AccessToken from "@/../secret/DROPBOX_AUTH_TOKEN.txt";
import * as Helpers from "./helpers.js";

export default {
    connect() {
        this.Conn = new Dropbox({
            fetch: IsomorphicFetch,
            accessToken: AccessToken
        });

        // can't use try/catch here 'cause the dumb Dropbox `return`s instead of `throw`ing
        if (!this.Conn.accessToken) throw new Error("Couldn't connect to the Dropbox");
    },

    set Conn(v) {
        this._connection = v;
    },

    get Conn() {
        return this._connection;
    },

    async getFilesList() {
        try {
            var { entries } = await this.Conn.filesListFolder({
                path: "",
                recursive: true
            });

            let filesList = this.Helpers.modifyFilesList(entries);
            this.Helpers.buildTree(filesList);
            return filesList;
        } catch (err) {
            // the error comming from the API request is not an instance of Error
            if (err instanceof Error) {
                throw new Error("There was an error modifying the files list");
            } else {
                throw new Error("Couldn't get the files list");
            }
        }
    },

    async download(entry) {
        try {
            let { link } = await this.Conn.filesGetTemporaryLink({
                path: entry.path_lower
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

    async uploadFiles(files, dest) {
        const STRAIGHT_UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        const SESSION_UPLOAD_MAX_CHUNK_SIZE = 8 * 1024 * 1024;
        const UPLOADS = [];

        for (let i = 0; i < files.length; i++) {
            let file = files.item(i),
                desiredPath = dest + "/" + (file.webkitRelativePath || file.name);

            if (file.size < STRAIGHT_UPLOAD_FILE_SIZE_LIMIT) {
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
