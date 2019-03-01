<template>
<div>
    <div
        @dblclick="mainAction()"
    >
        <img :src="entry.thumbnail">
        {{ entry.name }}
    </div>
    <div>
        <button><s>Move</s></button>
        <button @click="toggleCopyDialog">Copy</button>
        <div v-if="copyDialogOpened">
            <select v-model="copyDest" @change="copyEntry">
                <option
                    v-for="folder in allFolders"
                    :value="folder.path_lower"
                >{{ folder.path_display }}</option>
            </select>
        </div>
        <button><s>Rename</s></button>
        <button @click="deleteEntry">Delete</button>
    </div>
</div>
</template>

<script>
import { isFile, isFolder } from "@/middleware/helpers.js";

export default {
    props: {
        item: Object
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        allFolders() {
            return this.$store.state.cloud.filesList.filter(entry => {
                return isFolder(entry);
            });
        },
    },

    data() {
        return {
            copyDialogOpened: false,
            copyDest: null
        };
    },

    methods: {
        mainAction() {
            if (isFolder(this.entry)) {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (isFile(this.entry)) {
                this.$store.dispatch("cloud/download", this.entry);
            }
        },

        toggleCopyDialog() {
            this.copyDialogOpened = !this.copyDialogOpened;
        },

        copyEntry() {
            this.$store.dispatch("cloud/copyEntries", {
                entries: [this.entry],
                destination: this.copyDest
            })
        },

        deleteEntry() {
            this.$store.dispatch("cloud/deleteEntries", [this.entry.path_lower])
        }
    }
}
</script>

<style scoped>
img {
    width: 1rem;
}
</style>
