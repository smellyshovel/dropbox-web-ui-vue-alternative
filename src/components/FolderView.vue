<template>
<div>
    <folder-path :path="folder.link" />

    <tree-view
        :tree="contents"
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
import { mapState, mapGetters, mapActions } from "vuex";

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
