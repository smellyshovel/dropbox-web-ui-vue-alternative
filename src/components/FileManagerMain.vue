<template>
<main>
    <header class="toolbar">
        <folder-path
            class="folder-path"
            :folder="folder"
        />

        <section class="actions">
            <input
                id="create-folder"
                type="file" multiple
                hidden
            >
            <label
                @click="createFolder"
                for="create-folder-button"
                class="button create-folder"
            >
                <span class="icon"></span>
                <span class="text">Create Folder</span>
            </label>

            <input
                id="upload-files"
                type="file" multiple
                @input="uploadAndReset($event)"
                hidden
            >
            <label
                for="upload-files"
                class="button upload-files"
            >
                <span class="icon"></span>
                <span class="text">Upload Files</span>
            </label>

            <input
                id="upload-folder"
                type="file" webkitdirectory
                @input="uploadAndReset($event)"
                hidden
            >
            <label
                for="upload-folder"
                class="button upload-folder"
            >
                <span class="icon"></span>
                <span class="text">Upload Folder</span>
            </label>
        </section>
        <section class="view-settings">
            <div
                @click="listView = 'list'"
                class="button list"
            />
            <div
                @click="listView = 'grid'"
                class="button grid"
            />
        </section>
    </header>

    <div class="folder-view">
        <tree-view
            :tree="tree"
            :view="listView"
        >
            <template v-slot:default="{ item }">
                <tree-item :item="item" />
            </template>

            <template v-slot:empty>
                The folder's empty
            </template>
        </tree-view>
    </div>
</main>
</template>

<script>
import FolderPath from "@/components/FolderPath.vue";
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FolderViewTreeItem.vue";

import { mapGetters } from "vuex";

export default {
    components: {
        TreeView,
        TreeItem,
        FolderPath
    },

    computed: {
        folder() {
            let folder = this.folderByLink(this.$route.params.folderLink || "");
            if (!folder) this.$router.replace({ name: "fm" });
            return folder;
        },

        ...mapGetters("cloud", [
            "folderByLink"
        ]),

        tree() {
            return this.folder.contents;
        }
    },

    data() {
        return {
            listView: "list"
        }
    },

    methods: {
        async createFolder() {
            this.$store.commit("ui/statusReflector/setInProgress");

            try {
                await this.$store.dispatch("cloud/createFolder", {
                    name: await this.$store.dispatch("ui/namePicker/pickName", {
                        purpose: "create",
                        entryType: "folder",
                        currentName: ""
                    }),
                    destination: this.folder
                });

                this.$store.commit("ui/statusReflector/setReady");
            } catch (err) {
                if (err !== "name_picker_cancel") {
                    this.$store.commit("ui/statusReflector/setError", err);
                } else {
                    this.$store.commit("ui/statusReflector/setReady");
                }
            }
        },

        async uploadAndReset(event) {
            this.$store.commit("ui/statusReflector/setInProgress");

            try {
                await this.$store.dispatch("cloud/uploadEntries", {
                    files: event.target.files,
                    destination: this.folder,
                    conflictResolver: async (conflict, remainingConflictsNumber) => {
                        return await this.$store.dispatch("ui/conflictResolver/resolveConflict", {
                            conflict,
                            remainingConflictsNumber
                        });
                    }
                });

                this.$store.commit("ui/statusReflector/setReady");
            } catch (err) {
                this.$store.commit("ui/statusReflector/setError", err);
            }

            // can't upload the same files more than once in a row without the next line
            event.target.value = "";
        }
    }
}
</script>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.toolbar {
    /* position: fixed; */
    padding: 0.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.toolbar .folder-path {
    margin-right: auto;
}

.toolbar .actions {
    display: flex;
    justify-content: center;
    align-items: center;
}

.actions .button {
    margin: 0 0.25rem;
    padding: 0.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    color: rgba(0, 0, 0, 0.75);
    border: 2px solid rgb(126, 87, 194);
    border-radius: 5px;
    cursor: pointer;
}

.actions .button:hover {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.9);
}

.actions .button .icon {
    margin-right: 0.25rem;
    padding: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: white;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 1rem;
    border-radius: 2.5px;
}

.actions .button .text {
    text-align: center;
}

.button.create-folder .icon {
    background-image: url("/src/assets/icons/create-folder-gray.svg");
}

.button.create-folder:hover .icon {
    background-image: url("/src/assets/icons/create-folder-purple.svg");
}

.button.upload-files .icon {
    background-image: url("/src/assets/icons/upload-files-gray.svg");
}

.button.upload-files:hover .icon {
    background-image: url("/src/assets/icons/upload-files-purple.svg");
}

.button.upload-folder .icon {
    background-image: url("/src/assets/icons/upload-folder-gray.svg");
}

.button.upload-folder:hover .icon {
    background-image: url("/src/assets/icons/upload-folder-purple.svg");
}

.toolbar .view-settings {
    display: flex;
    justify-content: center;
    align-items: center;
}

.view-settings .button {
    margin: 0 0.25rem;
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    background-repeat: no-repeat;
    background-size: 1.25rem;
    cursor: pointer;
}

.button.list {
    background-image: url("/src/assets/icons/view-list-gray.svg");
}

.button.list:hover {
    background-image: url("/src/assets/icons/view-list-purple.svg");
}

.button.grid {
    background-image: url("/src/assets/icons/view-grid-gray.svg");
}

.button.grid:hover {
    background-image: url("/src/assets/icons/view-grid-purple.svg");
}

.folder-view {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>
