import { Dropbox } from "dropbox";
import Fetch from "isomorphic-fetch";
import AuthToken from "@/../secret/DROPBOX_AUTH_TOKEN.txt";

const DBI = new Dropbox({
    fetch: Fetch,
    accessToken: AuthToken
});

function modifyFilesList(filesList) {
    filesList.forEach(entry => {
        entry.path_link = entry.path_lower.substr(1);
    });
    filesList.forEach(entry => {
        if (entry[".tag"] === "folder") {
            entry.thumbnail = require("@/assets/mimetypes/folder.png");
        } else {
            let ext = entry.name.split(".");

            if (ext.length > 1) {
                try {
                    entry.thumbnail = require(`@/assets/mimetypes/${
                        ext[ext.length - 1]
                    }.svg`);
                } catch (err) {
                    entry.thumbnail = require("@/assets/mimetypes/unknown.svg");
                }
            } else {
                entry.thumbnail = require("@/assets/mimetypes/unknown.svg");
            }
        }
    });
}

function buildTree(filesList) {
    let folders = filesList.filter(entry => {
        return entry[".tag"] === "folder";
    });

    let tree = [];

    filesList.forEach(entry => {
        let path = entry.path_lower.split("/");

        if (path.length === 2) {
            tree.push(entry);
        } else if (path.length > 2) {
            path.pop();

            let parentFolder = folders.find(folder => {
                return folder.path_lower === path.join("/");
            });

            parentFolder.children = parentFolder.children || [];
            parentFolder.children.push(entry);
        }
    });

    return tree;
}

export default {
    namespaced: true,
    state: {
        DBI: DBI,
        filesList: [],
        trees: []
    },
    mutations: {
        UPDATE_FILES_LIST(state, filesList) {
            state.filesList = filesList;
        },

        CREATE_TREE(state, payload) {
            state.trees;
        },

        SELECT_SINGLE(state, payload) {

        }
    },
    actions: {
        async updateFilesList({ commit }) {
            try {
                let { entries } = await DBI.filesListFolder({
                    path: "",
                    recursive: true
                });

                modifyFilesList(entries);
                commit("UPDATE_FILES_LIST", entries);
            } catch (err) {
                throw Error(err.message || err.error);
            }
        }
    },
    getters: {
        DBI: state => state.DBI,

        tree: state => {
            return buildTree(state.filesList);
        },

        trees: state => {
            return state.trees;
        },

        folderByPath: (state, getters) => (path = "") => {
            if (path === "") {
                return {
                    name: "Home",
                    path_lower: "/",
                    path_display: "/",
                    children: getters.tree
                };
            } else {
                return state.filesList.find(entry => {
                    return entry[".tag"] === "folder" && entry.path_lower === "/" + path;
                });
            }
        }
    }
};
