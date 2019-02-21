<template>
<div>
    <folder-path :path="folder.link" />

    <input type="file" @change="upload($event)" :key="folder.id">

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
</div>
</template>

<script>
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FolderViewTreeItem.vue";
import FolderPath from "@/components/FolderPath.vue";

export default {
    components: {
        TreeView,
        TreeItem,
        FolderPath
    },

    props: {
        folder: {
            type: Object,
            required: true
        }
    },

    computed: {
        tree() {
            return this.folder.children || [];
        }
    },

    methods: {
        async upload(event) {
            await this.$store.dispatch("files/upload", {
                file: event.target.files[0],
                where: this.folder.path_lower
            });
            await this.$store.dispatch("files/update");
            event.target.value = "";
        }
    }
}
</script>
