export default {
    modifyFilesList(filesList) {
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
    },

    buildTree(filesList) {
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
}
