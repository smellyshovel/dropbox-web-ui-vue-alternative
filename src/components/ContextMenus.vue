<template>
    <vccm-overlay class="overlay">
        <context-menu
            id="cm-folder-view-single"
        >
            <cm-item :action="open">
                <span class="icon open"></span>
                <span class="text">Open</span>
            </cm-item>
            <cm-item v-context-menu="'#cm-folder-view-download-options'">
                <span class="icon download"></span>
                <span class="text">Download</span>
            </cm-item>
            <cm-item :action="move">
                <span class="icon move"></span>
                <span class="text">Move</span>
            </cm-item>
            <cm-item :action="copy">
                <span class="icon copy"></span>
                <span class="text">Copy</span>
            </cm-item>
            <cm-item>
                <span class="icon rename"></span>
                <span class="text">Rename</span>
            </cm-item>
            <cm-item :action="remove">
                <span class="icon delete"></span>
                <span class="text">Delete</span>
            </cm-item>
            <cm-item>
                <span class="icon info"></span>
                <span class="text">Info</span>
            </cm-item>
        </context-menu>

        <context-menu
            id="cm-folder-view-multiple"
        >
            <cm-item v-context-menu="'#cm-folder-view-download-options'">
                <span class="icon download"></span>
                <span class="text">Download</span>
            </cm-item>
            <cm-item :action="move">
                <span class="icon move"></span>
                <span class="text">Move</span>
            </cm-item>
            <cm-item :action="copy">
                <span class="icon copy"></span>
                <span class="text">Copy</span>
            </cm-item>
            <cm-item :action="remove">
                <span class="icon delete"></span>
                <span class="text">Delete</span>
            </cm-item>
        </context-menu>

        <context-menu
            id="cm-folder-view-download-options"
        >
            <cm-item
                :action="downloadPlain"
            >
                <span class="icon download-option-plain"></span>
                <span class="text">Plain</span>
            </cm-item>
            <cm-item
                :action="downloadZip"
            >
                <span class="icon download-option-as-zip"></span>
                <span class="text">As Zip</span>
            </cm-item>
        </context-menu>
    </vccm-overlay>
</template>

<script>
export default {
    computed: {
        selectedEntry() {
            return this.selectedEntries[0];
        },

        selectedEntries() {
            return this.$store.getters["ui/selections/allSelected"].map(selected => selected.entry);
        }
    },

    methods: {
        open() {
            if (this.selectedEntry.type === "folder") {
                this.$router.push({ name: "fm", params: { folderLink: this.selectedEntry.link } });
            }
        },

        async downloadPlain() {
            try {
                await this.$store.dispatch("cloud/downloadEntries", {
                    entries: this.selectedEntries,
                    asZip: false
                });
            } catch (err) {
                console.error(err);
            }
        },

        async downloadZip() {
            try {
                await this.$store.dispatch("cloud/downloadEntries", {
                    entries: this.selectedEntries,
                    asZip: true
                });
            } catch (err) {
                console.error(err);
            }
        },

        async move() {
            try {
                await this.$store.dispatch("cloud/moveEntries", {
                    entries: this.selectedEntries,
                    destination: await this.$store.dispatch("ui/filePicker/pickFolder", {
                        purpose: "move",
                        entries: this.selectedEntries
                    })
                });
            } catch (err) {
                if (err !== "file_picker_cancel") {
                    console.error(err);
                }
            }
        },

        async copy() {
            try {
                await this.$store.dispatch("cloud/copyEntries", {
                    entries: this.selectedEntries,
                    destination: await this.$store.dispatch("ui/filePicker/pickFolder", {
                        purpose: "copy",
                        entries: this.selectedEntries
                    })
                });
            } catch (err) {
                if (err !== "file_picker_cancel") {
                    console.error(err);
                }
            }
        },

        async remove() {
            if (!confirm("Are you sure?")) return;

            try {
                await this.$store.dispatch("cloud/deleteEntries", this.selectedEntries);
            } catch (err) {
                console.error(err);
            }
        }
    }
}
</script>

<style scoped>
.cm {
    padding: 0.25rem;
    background-color: white;
    border: 2px solid rgb(126, 87, 194);
    border-radius: 5px;
}

/deep/ .cm ol {
    margin: 0;
    padding: 0;
    list-style: none;
}

.cm-item {
    margin-bottom: 0.25rem;
    padding: 0.25rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    color: rgb(0, 0, 0, 0.9);
    cursor: pointer;
}

.cm-item.caller::after {
    content: "";
    width: 100%;
    height: 1rem;
    background-image: url("/src/assets/icons/context-menus/caller.svg");
    background-size: 1rem;
    background-position: right;
    background-repeat: no-repeat;
}

.cm-item:last-of-type {
    margin-bottom: 0;
}

.cm-item:hover {
    background-color: #f2f2f2;
}

.text {
    margin-left: 0.25rem;
}

.icon {
    padding: 0.25rem;
    display: block;
    min-width: 1rem;
    height: 1rem;
    background-color: white;
    background-size: 1rem;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
}

.icon.open {
    background-image: url("/src/assets/icons/context-menus/open-gray.svg");
}

.cm-item:hover .icon.open {
    background-image: url("/src/assets/icons/context-menus/open-purple.svg");
}

.icon.download {
    background-image: url("/src/assets/icons/context-menus/download-gray.svg");
}

.cm-item:hover .icon.download {
    background-image: url("/src/assets/icons/context-menus/download-purple.svg");
}

.icon.move {
    background-image: url("/src/assets/icons/context-menus/move-gray.svg");
}

.cm-item:hover .icon.move {
    background-image: url("/src/assets/icons/context-menus/move-purple.svg");
}

.icon.copy {
    background-image: url("/src/assets/icons/context-menus/copy-gray.svg");
}

.cm-item:hover .icon.copy {
    background-image: url("/src/assets/icons/context-menus/copy-purple.svg");
}

.icon.rename {
    background-image: url("/src/assets/icons/context-menus/rename-gray.svg");
}

.cm-item:hover .icon.rename {
    background-image: url("/src/assets/icons/context-menus/rename-purple.svg");
}

.icon.delete {
    background-image: url("/src/assets/icons/context-menus/delete-gray.svg");
}

.cm-item:hover .icon.delete {
    background-image: url("/src/assets/icons/context-menus/delete-purple.svg");
}

.icon.info {
    background-image: url("/src/assets/icons/context-menus/info-gray.svg");
}

.cm-item:hover .icon.info {
    background-image: url("/src/assets/icons/context-menus/info-purple.svg");
}

.icon.download-option-plain {
    background-image: url("/src/assets/icons/context-menus/download-plain-gray.svg");
}

.cm-item:hover .icon.download-option-plain {
    background-image: url("/src/assets/icons/context-menus/download-plain-purple.svg");
}

.icon.download-option-as-zip {
    background-image: url("/src/assets/icons/context-menus/download-zip-gray.svg");
}

.cm-item:hover .icon.download-option-as-zip {
    background-image: url("/src/assets/icons/context-menus/download-zip-purple.svg");
}
</style>
