<template>
<div v-if="loading">
    Loading data from Dropbox...
</div>

<div v-else-if="fatalError">
    <h1>A Fatal Error Occured: {{ fatalError.message }}</h1>
</div>

<div
    id="fm"
    v-else-if="folder"
>
    <aside>
        <tree-view
            :entries="tree"
            mode="folders"
            :deepness="3"
            :reveal-current="true"
        >
            <folders-tree-item
                slot-scope="{ item }"
                :item="item"
            ></folders-tree-item>
        </tree-view>
    </aside>
    <main>
        <folder-path :path="folderPath" />
        <tree-view
            :entries="contents"
        >
            <folder-contents-item
                slot-scope="{ item }"
                :item="item"
                @dblclick.native="download(item.entry)"
            ></folder-contents-item>
        </tree-view>
    </main>
</div>
</template>

<script>
import TreeView from "@/components/FileManager/TreeView.vue";
import FoldersTreeItem from "@/components/FileManager/FoldersTreeItem.vue";
import FolderContentsItem from "@/components/FileManager/FolderContentsItem.vue";
import FolderPath from "@/components/FileManager/FolderPath.vue";
import { mapGetters } from "vuex";

export default {
    components: {
        TreeView,
        FoldersTreeItem,
        FolderContentsItem,
        FolderPath
    },

    props: {
        folderPath: String
    },

    async created() {
        this.$store.dispatch("files/connect");
        await this.$store.dispatch("files/updateFilesList");

        this.folder = this.folderByPath(this.folderPath);
        if (!this.folder) this.$router.replace({ name: "folder" });
    },

    beforeRouteUpdate(to, from, next) {
        this.folder = this.folderByPath(to.params.folderPath);

        if (this.folder) {
            next();
        } else {
            next({ name: "folder" });
        }
    },

    data() {
        return {
            folder: null
        };
    },

    computed: {
        contents() {
            return this.folder.children;
        },

        ...mapGetters({
            fatalError: "files/fatalError",
            loading: "files/loading",
            folderByPath: "files/folderByPath",
            tree: "files/tree"
        })
    }
};
</script>

<style scoped>
#fm {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 300px auto;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
}
</style>
