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
        <span class="text">
            <strong>{{ freeSpace }}</strong> free / <strong>{{ totalSpace }}</strong>
        </span>
        <div class="meter">
            <div
                class="meter occupied"
                :style="{ width: usedMeterWidth }"
            />
        </div>
    </div>
</aside>
</template>

<script>
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FileManagerSidebarTreeItem.vue";

function sizeToText(size) {
    let steps = 0;
    while (size / 1024 > 1) {
        size = size / 1024;
        steps += 1;
    }

    let prefixes = ["", "k", "M", "G", "T", "P"];
    return size.toFixed(2) + prefixes[steps] + "B";
}

export default {
    components: {
        TreeView,
        TreeItem
    },

    computed: {
        spaceUsage() {
            return this.$store.state.cloud.accountInfo.spaceUsage;
        },

        freeSpace() {
            return sizeToText(this.spaceUsage.free);
        },

        totalSpace() {
            return sizeToText(this.spaceUsage.total);
        },

        usedMeterWidth() {
            return (this.spaceUsage.occupied * 100) / this.spaceUsage.total + "%";
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
    max-width: 256px;
}

.space-usage {
    padding: 1rem;
}

.space-usage .text {
    display: block;
    margin: 0.5rem;
    color: rgba(0, 0, 0, 0.65);
    text-align: center;
}

.space-usage strong {
    color: rgba(0, 0, 0, 0.85);
}

.meter {
    display: block;
    width: 100%;
    height: 10px;
    background-color: #bdbdbd;
    border-radius: 5px;
}

.occupied {
    background-color: rgb(126, 87, 194);
}
</style>
