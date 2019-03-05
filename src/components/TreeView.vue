<template>
<ol v-if="normalizedTree.length">
    <tree-view-item
        ref="items"
        v-for="entry in normalizedTree"
        :key="entry.id"

        :entry="entry"
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-view-item>
</ol>

<div v-else>
    <slot name="empty"></slot>
</div>
</template>

<script>
import TreeViewItem from "@/components/TreeViewItem.vue";

export default {
    components: {
        TreeViewItem
    },

    props: {
        tree: {
            type: Array,
            required: true
        },
        mode: {
            type: String,
            default: "all",
            validator: value => ["all", "folders", "files"].includes(value)
        },
        deepness: {
            type: Number,
            default: 1
        }
    },

    provide() {
        return {
            providedMode: this.resolvedMode,
            providedDeepness: this.resolvedDeepness
        }
    },

    inject: {
        injectedMode: {
            from: "providedMode",
            default: null
        },
        injectedDeepness: {
            from: "providedDeepness",
            default: null
        }
    },

    data() { return {
        resolvedMode: this.injectedMode || this.mode,
        resolvedDeepness: this.injectedDeepness || this.deepness
    }},

    computed: {
        normalizedTree() {
            return this.tree.filter(entry => {
                switch (this.resolvedMode) {
                    case "all":
                        return true;
                        break;
                    case "folders":
                        return entry.type === "folder";
                        break;
                    case "files":
                        return entry.type === "file";
                        break;
                }
            });
        }
    }
};
</script>

<style scoped>
ol {
    list-style: none;
    padding: 0;
    margin: 0;
}

li > ol {
    padding-left: 1rem;
}
</style>
