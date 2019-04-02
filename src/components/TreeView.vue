<template>
<ol
    v-if="normalizedTree.length"
    :class="[view]"
>
    <tree-view-item
        v-for="entry in normalizedTree"
        :key="entry.id"
        ref="items"

        :entry="entry"
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-view-item>
</ol>

<div v-else>
    <slot name="empty" />
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
        },
        view: {
            type: String,
            default: "list",
            validator: value => ["list", "grid"].includes(value)
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
            }).sort((a, b) => {
                let types = [a.type === "folder" ? 10 : 0, b.type === "folder" ? 10 : 0];
                return types[1] - types[0] || a.name.localeCompare(b.name);
            });
        }
    }
};
</script>

<style scoped>
ol {
    margin: 0;
    padding: 0;
    list-style: none;
}

.list {
    display: flex;
    flex-flow: column;
}

.grid {
    display: grid;
    grid-template-rows: 128px;
    grid-template-columns: repeat(auto-fill, minmax(128px, auto));
    gap: 1rem;
    justify-content: left;
    align-items: center;
}
</style>
