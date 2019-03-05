class Entry {
    constructor({ type, id, name, path, lastModified, size }) {
        this.type = type;
        this.id = id;
        this.name = name;
        this.path = path;
        this._lastModified = lastModified;
        this._size = size;

        this.parent = null;
    }

    get link() {
        let link = this.path.split("");
        link.shift();
        return link.join("");
    }
}

export class Folder extends Entry {
    constructor(rawEntry) {
        super({
            type: "folder",
            id: rawEntry.id,
            name: rawEntry.name,
            path: rawEntry.path_lower
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
    constructor(rawEntry) {
        super({
            type: "file",
            id: rawEntry.id,
            name: rawEntry.name,
            path: rawEntry.path_lower,
            lastModified: new Date(rawEntry.server_modified),
            size: rawEntry.size
        });
    }

    get lastModified() {
        return this._lastModified;
    }

    get size() {
        return this._size;
    }
}
