<template>
<main>
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

    <folder-path :path="folder.link" />

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
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FolderViewTreeItem.vue";
import FolderPath from "@/components/FolderPath.vue";
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
.error {
    color: red;
}
</style>
