class Entry {
    constructor({ fake, type, id, name, path, lastModified, size }) {
        this._fake = fake;
        this.type = type;
        this.id = id;
        this.name = name;
        this.path = path;
        this._lastModified = lastModified;
        this._size = size;

        this.parent = null;

        this.updateThumbnail();
    }

    set isFake(val) {
        this._fake = val;
    }

    get isFake() {
        return this._fake;
    }

    get link() {
        let link = this.path.split("");
        link.shift();
        return link.join("");
    }

    updateThumbnail() {
        if (this.type === "folder") {
            this.thumbnail = require("@/assets/mimetypes/folder.svg");
        } else {
            let ext = this.name.split(".");

            if (ext.length > 1) {
                try {
                    this.thumbnail = require(`@/assets/mimetypes/${ ext[ext.length - 1] }.svg`);
                } catch (err) {
                    this.thumbnail = require("@/assets/mimetypes/unknown.svg");
                }
            } else {
                this.thumbnail = require("@/assets/mimetypes/unknown.svg");
            }
        }
    }
}

export class Folder extends Entry {
    constructor(rawEntry, isFake = false) {
        super({
            fake: isFake,
            type: "folder",
            id: rawEntry.id || "id:" + (Math.random() * 999999 | 0),
            name: rawEntry.name,
            path: "path_lower" in rawEntry ? rawEntry.path_lower : rawEntry.path
        });

        this.contents = [];
    }

    get lastModified() {
        return this.contents.reduce((acc, curr) => {
            return curr.lastModified > acc ? curr.lastModified : acc;
        }, new Date(0));
    }

    get size() {
        return this.contents.reduce((acc, curr) => {
            return acc + curr.size;
        }, 0);
    }
}

export class File extends Entry {
    constructor(rawEntry, isFake = false) {
        super({
            fake: isFake,
            type: "file",
            id: rawEntry.id || "id:" + (Math.random() * 999999 | 0),
            name: rawEntry.name,
            path: rawEntry.path_lower || rawEntry.path ,
            lastModified: new Date(rawEntry.server_modified || 0),
            size: rawEntry.size || 0
        });
    }

    get lastModified() {
        return this._lastModified;
    }

    get size() {
        return this._size;
    }
}
