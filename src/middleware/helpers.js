import { Folder, File } from "./entry.js";

export function handleEntries(rawEntries) {
    let folders = [];
    let entries = rawEntries.map(rawEntry => {
        if (rawEntry[".tag"] === "folder") {
            let folder = new Folder(rawEntry);

            folders.push(folder);
            return folder;
        } else if (rawEntry[".tag"] === "file") {
            return new File(rawEntry);
        }
    });

    let root = entries.shift();

    entries.forEach(entry => {
        let parentFolderPath = entry.path.split("/");
        parentFolderPath.pop();
        parentFolderPath = parentFolderPath.join("/");

        let parentFolder = folders.find(folder => {
            return folder.path === parentFolderPath;
        });

        entry.parent = parentFolder;
        parentFolder.contents.push(entry);
    });

    entries.unshift(root);

    // temp
    entries.forEach(entry => {
        if (entry.type === "folder") {
            entry.thumbnail = require("@/assets/mimetypes/folder.png");
        } else {
            let ext = entry.name.split(".");

            if (ext.length > 1) {
                try {
                    entry.thumbnail = require(`@/assets/mimetypes/${ ext[ext.length - 1] }.svg`);
                } catch (err) {
                    entry.thumbnail = require("@/assets/mimetypes/unknown.svg");
                }
            } else {
                entry.thumbnail = require("@/assets/mimetypes/unknown.svg");
            }
        }
    });

    return entries;
}

export function nameIsCorrect(name) {
    // at least one character long and prohibit <, >, /, \, :, ?, *, ", |
    return name.length > 0 && !/<|>|\/|\\|:|\?|\*|"|\|/g.test(name);
}
