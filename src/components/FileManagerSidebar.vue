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

    You have {{ spaceUsage.free }} left out of {{ spaceUsage.total }}
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
</style>
