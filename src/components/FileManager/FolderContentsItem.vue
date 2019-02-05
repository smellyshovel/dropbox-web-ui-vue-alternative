<template>
<div
    @dblclick="go"
>
    <img :src="entry.thumbnail">
    {{ entry.name }}
</div>
</template>

<script>
export default {
    props: {
        item: Object
    },

    computed: {
        entry() {
            return this.item.entry;
        }
    },

    data() { return {
        selected: false
    }},

    methods: {
        go() {
            let ext = this.entry.name.split(".");
            ext = ext.length > 1 ? ext[ext.length - 1] : "";

            const previewExts = ["ai", "doc", "docm", "docx", "eps", "odp", "odt", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx", "rtf", "csv", "ods", "xls", "xlsm", "xlsx"];

            if (previewExts.includes(ext)) {
                console.log(this.$route);
                this.$router.push({ path: this.$route.path, query: { preview: this.entry.name } })
            }
        },

        select() {
            this.selected = true;
        }
    }
}
</script>

<style scoped>
img {
    width: 1rem;
}
</style>
