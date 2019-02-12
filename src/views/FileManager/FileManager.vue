<template>
<div id="loading" v-if="loading">
    Loading data from Dropbox...
</div>

<div id="fatal-error" v-else-if="fatalError">
    <h1>A Fatal Error Occured: {{ fatalError.message }}</h1>
</div>

<div id="fm" v-else-if="folder">
    <aside>
        <router-link :to="{ name: 'fm' }">Home</router-link>

        <tree-view
            :tree="treeWithoutRoot"
            mode="folders"
            :deepness="3"
        >
            <template v-slot:default="{ item }">
                <folders-tree-item :item="item" />
            </template>

            <template v-slot:empty>
                No folders are in the root directory
            </template>
        </tree-view>
    </aside>
    <main>
        <folder-path :path="folderLink" />
        <tree-view
            :tree="contents"
        >
            <template v-slot:default="{ item }">
                <folder-contents-item :item="item" />
            </template>

            <template v-slot:empty>
                The folder's empty
            </template>
        </tree-view>
    </main>
</div>
</template>

<script>
import TreeView from "@/components/FileManager/TreeView.vue";
import FoldersTreeItem from "@/components/FileManager/FoldersTreeItem.vue";
import FolderContentsItem from "@/components/FileManager/FolderContentsItem.vue";
import FolderPath from "@/components/FileManager/FolderPath.vue";
import { mapState, mapGetters } from "vuex";

export default {
    components: {
        TreeView,
        FoldersTreeItem,
        FolderContentsItem,
        FolderPath
    },

    props: {
        folderLink: String
    },

    async created() {
        this.$store.dispatch("files/connect");
        await this.$store.dispatch("files/update");

        this.folder = this.folderByLink(this.folderLink);
        if (!this.folder) this.$router.replace({ name: "fm" });

        this.loading = false;
    },

    beforeRouteUpdate(to, from, next) {
        this.folder = this.folderByLink(to.params.folderLink);

        if (this.folder) {
            next();
        } else {
            next({ name: "fm" });
        }
    },

    data() {
        return {
            loading: true,
            folder: null
        };
    },

    computed: {
        treeWithoutRoot() {
            return this.$store.state.files.tree[0].children;
        },

        contents() {
            return this.folder.children || [];
        },

        ...mapState("files", [
            "fatalError",
            "excusableError"
        ]),

        ...mapGetters("files", [
            "folderByLink"
        ])
    }
};
</script>

<style scoped>
#loading {
    background-color: rgb(48, 119, 193);
}

#fatal-error {
    background-color: rgb(252, 95, 95);
}

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
