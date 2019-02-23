export function modifyFilesList(filesList) {
    filesList.unshift({
        ".tag": "folder",
        name: "/",
        path_lower: "",
        path_display: "",
        link: "",
        children: []
    });

    filesList.forEach(entry => {
        entry.link = entry.path_lower.substr(1);
    });

    filesList.forEach(entry => {
        if (isFolder(entry)) {
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

    return filesList;
}

export function buildTree(filesList) {
    let folders = filesList.filter(entry => {
        return isFolder(entry);
    });

    let tree = [filesList[0]];

    filesList.forEach(entry => {
        let path = entry.path_lower.split("/");

        if (path.length === 2) {
            tree[0].children.push(entry);
        } else if (path.length > 2) {
            path.pop();

            let parentFolder = folders.find(folder => {
                return folder.path_lower === path.join("/");
            });

            parentFolder.children = parentFolder.children || [];
            parentFolder.children.push(entry);
        }
    });
}

export function isFolder(entry) {
    return entry[".tag"] === "folder";
}

export function isFile(entry) {
    return entry[".tag"] === "file";
}
