<template>
<div
    v-if="!entry.isFake"
    @dblclick="mainAction"
    :class="{ selected: isSelected }"
    class="entry"
    v-context-menu="appropriateContextMenu"
>
    <div
        class="mimetype-icon"
        :style="{ backgroundImage: thumbnail }"
    />

    <span class="name">
        {{ entry.name }}
    </span>

    <span class="size">
        {{ normalizedSize }}
    </span>

    <span class="modification-date">
        {{ modificationDate }}
    </span>
</div>

<div
    v-else
    @dblclick="mainAction"
    :class="{ selected: isSelected}"
    class="entry disabled"
    v-context-menu.disabled
>
    <div
        class="mimetype-icon"
        :style="{ backgroundImage: thumbnail }"
    />

    <span class="name">
        {{ entry.name }}
    </span>

    <span class="size">
        {{ normalizedSize }}
    </span>

    <span class="modification-date">
        {{ modificationDate }}
    </span>
</div>
</template>

<script>
export default {
    props: {
        item: Object,
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        isSelected() {
            return this.item.isSelected;
        },

        thumbnail() {
            return `url(${this.entry.thumbnail})`;
        },

        normalizedSize() {
            let size = this.entry.size;

            if (!size) {
                return "empty";
            }

            let steps = 0;
            while (size / 1024 > 1) {
                size = size / 1024;
                steps += 1;
            }

            let prefixes = ["", "k", "M", "G", "T", "P"];
            return size.toFixed(2) + (prefixes[steps] || "?") + "B";
        },

        modificationDate() {
            let date = this.entry.lastModified;

            if (date.getTime() === 0) {
                return "never modified";
            } else {
                return date.toLocaleString();
            }
        },

        appropriateContextMenu() {
            let selectedEntries = this.$store.getters["ui/selections/allSelected"].map(selected => {
                return selected.entry;
            });

            let prefix = "#cm-folder-view-"

            if (selectedEntries.length === 1) {
                return prefix + "single";
            } else if (selectedEntries.length > 1) {
                return prefix + "multiple";
            }
        }
    },

    methods: {
        mainAction() {
            if (this.entry.type === "folder") {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (this.entry.type === "file" && !this.entry.isFake) {
                this.$store.dispatch("cloud/downloadEntries", {
                    entries: [this.entry],
                    asZip: false
                });
            }
        }
    }
}
</script>

<style scoped>
.list .entry {
    margin-bottom: 0.25rem;
    padding: 0.25rem;
    padding-left: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.9);
}

.list .entry:hover {
    background-color: #f2f2f2;
}

.list .entry.disabled {
    color: #bdbdbd;
}

.list .entry.disabled:hover {
    background-color: white;
}

.list .selected .entry {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.85);
}

.list .name {
    margin-left: 0.5rem;
    margin-right: auto;
}

.list .mimetype-icon {
    padding: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: white;
    background-size: auto 1rem;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
}

.list .disabled .mimetype-icon {
    filter: grayscale(1);
    opacity: 0.5;
}

.list .size, .list .modification-date {
    margin-right: 0.5rem;
    color: rgba(0, 0, 0, 0.5);
}

.list .disabled .size, .list .disabled .modification-date {
    color: #bdbdbd;
}

.list .selected .size, .list .selected .modification-date {
    color: rgba(255, 255, 255, 0.85);
}

.grid .entry {
    box-sizing: border-box;
    padding: 0.5rem;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    width: 128px;
    height: 128px;
    background-color: white;
    border: 2px solid #bdbdbd;
    border-radius: 5px;
    color: rgba(0, 0, 0, 0.8);
}

.grid .entry:hover {
    border-color: rgb(126, 87, 194);
}

.grid .entry.disabled {
    border-color: #f2f2f2;
}

.grid .selected .entry {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgb(126, 87, 194);
}

.grid .mimetype-icon {
    width: 60%;
    min-height: 60%;
    background-color: white;
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
}

.grid .name {
    max-height: 2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    text-align: center;
    margin-top: auto;
    word-break: break-all;
}

.grid .disabled .mimetype-icon {
    filter: grayscale(1);
    opacity: 0.5;
}

.grid .size, .grid .modification-date {
    display: none;
}
</style>
