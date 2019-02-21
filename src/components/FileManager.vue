<template>
<div id="fm">
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
        <!-- <folder-path :path="folderLink" /> -->

        <!-- <div id="excusable-error" v-if="excusableError">
            {{ excusableError }}
        </div> -->

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
import { mapState, mapGetters, mapActions } from "vuex";

export default {
    components: {
        TreeView,
        FoldersTreeItem,
        FolderContentsItem,
        FolderPath
    },

    props: {
        folder: {
            type: Object,
            required: true
        }
    },

    computed: {
        treeWithoutRoot() {
            return this.$store.state.files.tree[0].children;
        },

        contents() {
            return this.folder.children || [];
        }
    },

    methods: {
        ...mapActions("selections", {
            clearSelections: "clear"
        })
    }
}
</script>

<style scoped>
#fm {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 300px auto;
}
</style>
