<template>
<main>
    <folder-path :path="folder.link" />

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
        >
            {{ createFolderError.message }}
        </div>
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
import Errors from "@/middleware/errors.js";
import { mapGetters } from "vuex";

export default {
    components: {
        TreeView,
        TreeItem,
        FolderPath
    },

    computed: {
        folder() {
            let folder = this.folderByLink(this.$route.params.folderLink);
            if (!folder) this.$router.replace({ name: "fm" });
            return folder;
        },

        ...mapGetters("cloud", [
            "folderByLink"
        ]),

        tree() {
            return this.folder.children || [];
        }
    },

    data() {
        return {
            createFolderDialogOpened: false,
            folderToCreateName: "",
            createFolderError: null
        }
    },

    methods: {
        async upload(event) {
            await this.$store.dispatch("cloud/upload", {
                files: event.target.files,
                destination: this.folder.path_lower
            });
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
                console.error(err);

                if (err instanceof Errors.CreateFolderError) {
                    this.createFolderError = err;
                } else {
                    this.createFolderError = new Error("Something went wrong...");
                }
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
