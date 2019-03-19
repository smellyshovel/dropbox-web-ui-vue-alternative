import { Folder, File } from "./entry.js";
import { CustomError } from "@/middleware/errors.js";

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

    return entries;
}

export function downloadBlob(blob, name) {
    let invisibleLink = document.createElement("a");
    invisibleLink.style.display = "none";
    document.body.appendChild(invisibleLink);

    let blobURL = window.URL.createObjectURL(blob);
    invisibleLink.href = blobURL;
    invisibleLink.download = name;
    invisibleLink.click();

    window.URL.revokeObjectURL(blobURL);
    invisibleLink.remove();
}

export function extractContentsRecursively(entry) {
    return entry.contents.map(e => {
        if (e.type === "folder") {
            return extractContentsRecursively(e);
        } else return e;
    }).reduce((acc, curr) => acc.concat(curr), []);
}

export function nameIsCorrect(name) {
    // at least one character long and prohibit <, >, /, \, :, ?, *, ", |
    return name.length > 0 && !/<|>|\/|\\|:|\?|\*|"|\|/g.test(name);
}

export function checkCreateFolderForEarlyErrors(name, destination) {
    if (!nameIsCorrect(name)) {
        throw new CustomError({
            reason: "bad_name",
            details: name
        });
    }

    destination.contents.forEach(existingEntry => {
        if (!existingEntry.isFake && existingEntry.name === name) {
            throw new CustomError({
                reason: "already_exists",
                details: existingEntry
            });
        }
    });
}
