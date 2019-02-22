<template>
<div
    @dblclick="mainAction()"
>
    <img :src="entry.thumbnail">
    {{ entry.name }}
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
        }
    }
}
</script>

<style scoped>
img {
    width: 1rem;
}
</style>
