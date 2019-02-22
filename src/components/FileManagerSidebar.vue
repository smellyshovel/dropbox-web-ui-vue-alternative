<template>
<aside>
    <router-link :to="{ name: 'fm' }">Home</router-link>

    <tree-view
        :tree="tree"
        mode="folders"
        :deepness="3"
    >
        <template v-slot:default="{ item }">
            <tree-item :item="item" />
        </template>

        <template v-slot:empty>
            Nothing to show
        </template>
    </tree-view>
</aside>
</template>

<script>
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/TheFileManagerSidebarTreeItem.vue";

export default {
    components: {
        TreeView,
        TreeItem
    },

    computed: {
        tree() {
            return this.$store.state.files.tree[0].children;
        }
    }
}
</script>
