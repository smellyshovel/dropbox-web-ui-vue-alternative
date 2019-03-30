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
                @input="createFolder"
                hidden
            >
            <label
                for="create-folder-button"
                class="button create-folder"
            >
                <span class="icon"></span>
                <span class="text">Create Folder</span>
            </label>

            <input
                id="upload-files"
                type="file" multiple
                @input="upload($event)"
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
                @input="upload($event)"
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
            settings
        </section>
    </header>
    <button @click="toggleDownloadDialog">Download entries</button>
    <div v-if="downloadDialogOpened">
        <div
            v-if="downloadError"
            class="error"
            v-html="downloadError.message"
        />
        <form @submit.prevent="downloadEntries">
            <select
                multiple
                v-model="downloadEntriesChosen"
            >
                <option
                    v-for="entry in folder.contents"
                    :value="entry"
                >{{ entry.path }}</option>
            </select>
            <input type="checkbox" v-model="downloadAsZip" id="download-zip"> <label for="download-zip">As zip</label>
            <input type="submit">
        </form>
    </div>

    <div class="error" v-if="uploadError" v-html="uploadError.message" />

    <div
        v-if="uploadConflict"
        class="conflict"
    >
        {{ uploadConflict.conflict.target.type }} called "{{ uploadConflict.conflict.target.name }}" already exists. What to do?
        <form @submit.prevent="uploadConflictResolver({ strategy: uploadConflictResolutionStrategy, sameForTheRest: uploadConflictResolutionStrategySameForTheRest || false });">
            <input type="radio" value="autorename" v-model="uploadConflictResolutionStrategy"> Autorename
            <br>
            <input type="radio" value="skip" v-model="uploadConflictResolutionStrategy"> Skip this entry
            <br>
            <div v-if="uploadConflict.totalNumberOfConflicts > 1">
                <input v-if="" type="checkbox" :value="true" v-model="uploadConflictResolutionStrategySameForTheRest"> Apply for the rest {{ uploadConflict.totalNumberOfConflicts }} conflicts
                <br>
            </div>
            <input type="submit"> <input type="button" value="Cancel" @click="uploadConflictResolver({ strategy: 'cancel' })">
        </form>
    </div>

    <label for="upload-files">Upload Files</label>
    <input
        id="upload-files"
        type="file" multiple
        @change="upload($event)"
        hidden
    >

    <label for="upload-dir">Upload Folder</label>
    <input
        id="upload-dir"
        type="file" webkitdirectory
        @change="upload($event)"
        hidden
    >

    <button @click="toggleCreateFolderDialog">Create Folder</button>
    <div v-if="createFolderDialogOpened">
        <div
            v-if="createFolderError"
            class="error"
            v-html="createFolderError.message"
        />
        <form @submit.prevent="createFolder">
            <input type="text" v-model="folderToCreateName">
            <input type="submit">
        </form>
    </div>

    <input type="button" value="Update" @click="update">

    <tree-view
        :tree="tree"
    >
        <template v-slot:default="{ item }">
            <tree-item :item="item" />
        </template>

        <template v-slot:empty>
            The folder's empty
        </template>
    </tree-view>
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
            createFolderDialogOpened: false,
            folderToCreateName: "",
            createFolderError: null,
            downloadDialogOpened: false,
            downloadAsZip: false,
            downloadError: null,
            downloadEntriesChosen: [],
            uploadError: null,
            uploadConflict: null,
            uploadConflictResolver: null,
            uploadConflictResolutionStrategy: null,
            uploadConflictResolutionStrategySameForTheRest: null
        }
    },

    methods: {
        async toggleDownloadDialog() {
            this.downloadDialogOpened = !this.downloadDialogOpened;
        },

        async downloadEntries() {
            try {
                await this.$store.dispatch("cloud/downloadEntries", {
                    entries: this.downloadEntriesChosen,
                    asZip: this.downloadAsZip
                })
            } catch (err) {
                this.downloadError = err;
            }
        },

        async resolveUploadConflict(conflict, totalNumberOfConflicts) {
            this.uploadConflict = {
                conflict,
                totalNumberOfConflicts
            };

            return new Promise((resolve, reject) => {
                this.uploadConflictResolver = resolve;
            })
                .then((res) => {
                    this.uploadConflict = null;
                    this.uploadConflictResolver = null;
                    this.uploadConflictResolutionStrategy = null;
                    this.uploadConflictResolutionStrategySameForTheRest = null;
                    return res;
                });
        },

        async upload(event) {
            try {
                await this.$store.dispatch("cloud/uploadEntries", {
                    files: event.target.files,
                    destination: this.folder,
                    conflictResolver: this.resolveUploadConflict
                });
            } catch (err) {
                this.uploadError = err;
            }
        },

        async update() {
            await this.$store.dispatch("cloud/updateEntries");
        },

        async createFolder() {
            try {
                await this.$store.dispatch("cloud/createFolder", {
                    name: this.folderToCreateName,
                    destination: this.folder
                });

                this.createFolderError = null;
            } catch (err) {
                this.createFolderError = err;
            }
        },

        toggleCreateFolderDialog() {
            this.createFolderDialogOpened = !this.createFolderDialogOpened;
        }
    }
}
</script>

<style scoped>
main {
    border: 1px solid black;
}

.toolbar {
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


    /* background: url("/src/assets/icons/create-folder-inactive.svg"); */

</style>
