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
            // downloadButton.remove();
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
        let uplSmpl = async (file) => {
            return await this.Conn.filesUpload({path: '/' + file.name, contents: file})
        };

        let uplCmpx = async (file) => {
            const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
            var workItems = [];

            var offset = 0;
            while (offset < file.size) {
                var chunkSize = Math.min(maxBlob, file.size - offset);
                workItems.push(file.slice(offset, offset + chunkSize));
                offset += chunkSize;
            }

            const task = workItems.reduce((acc, blob, idx, items) => {
                if (idx == 0) {
                    // Starting multipart upload of file
                    return acc.then(() => {
                        return this.Conn.filesUploadSessionStart({ close: false, contents: blob})
                            .then(response => response.session_id)
                    });
                } else if (idx < items.length-1) {
                    // Append part to the upload session
                    return acc.then((sessionId) => {
                        var cursor = { session_id: sessionId, offset: idx * maxBlob };
                        return this.Conn.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob })
                            .then(() => sessionId);
                    });
                } else {
                    // Last chunk of data, close session
                    return acc.then((sessionId) => {
                        var cursor = { session_id: sessionId, offset: file.size - blob.size };
                        var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };
                        return this.Conn.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });
                    });
                }
            }, Promise.resolve());

            return await task;
        }

        const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);

            if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
                await uplSmpl(file);
            } else {
                await uplCmpx(file);
            }
        }
    },

    Helpers
}
