<template>
<aside>
    <div class="folders-tree">
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
    </div>

    <div class="space-usage">
        You have {{ spaceUsage.free }} left out of {{ spaceUsage.total }}
    </div>
</aside>
</template>

<script>
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FileManagerSidebarTreeItem.vue";

export default {
    components: {
        TreeView,
        TreeItem
    },

    computed: {
        spaceUsage() {
            return this.$store.state.cloud.accountInfo.spaceUsage;
        },

        tree() {
            return this.$store.state.cloud.entries[0].contents;
        }
    }
}
</script>

<style scoped>
aside {
    display: grid;
    grid-template-rows: auto max-content;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8f8f8;
    box-shadow: 0px 0px 5px #bdbdbd;
    z-index: 10;
}

.folders-tree {
    margin-top: 0.5rem;
}
</style>
