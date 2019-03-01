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
        <button><s>Copy</s></button>
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
        }
    },

    methods: {
        mainAction() {
            if (isFolder(this.entry)) {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (isFile(this.entry)) {
                this.$store.dispatch("cloud/download", this.entry);
            }
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
