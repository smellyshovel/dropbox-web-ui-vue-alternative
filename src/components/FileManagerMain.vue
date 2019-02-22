<template>
<main>
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

    methods: {
        async upload(event) {
            await this.$store.dispatch("cloud/upload", {
                file: event.target.files[0],
                where: this.folder.path_lower
            });
            await this.$store.dispatch("cloud/update");
            event.target.value = "";
        }
    }
}
</script>
