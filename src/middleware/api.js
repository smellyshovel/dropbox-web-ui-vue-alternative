import { Dropbox } from "dropbox";
import IsomorphicFetch from "isomorphic-fetch";
import AccessToken from "@/../secret/DROPBOX_AUTH_TOKEN.txt";
import Helpers from "./helpers.js";

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

            this.Helpers.modifyFilesList(entries);
            return entries;
        } catch (err) {
            throw new Error("Couldn't get the files list")
        }
    },

    Helpers
}
