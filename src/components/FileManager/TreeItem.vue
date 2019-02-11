<template>
<li>
    <slot :item="this"></slot>

    <tree-view
        v-if="hasSubTree"
        v-show="subTreeOpened"

        :tree="subTree"
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-view>
</li>
</template>

<script>
import { isFolder, isFile } from "@/middleware/helpers.js";

export default {
    components: {
        TreeView: () => import("./TreeView.vue")
    },

    props: {
        entry: {
            type: Object,
            required: true
        }
    },

    provide() { return {
        level: this.level + 1
    }},

    inject: {
        "mode": "providedMode",
        "deepness": "providedDeepness",
        "level": {
            default: 1
        }
    },

    created() {
        this.subTreeOpened = this.deepness === 0 ? true : (this.level < this.deepness ? true : false);
    },

    data() { return {
        subTreeOpened: null
    }},

    computed: {
        subTree() {
            return this.entry.children;
        },

        hasSubTree() {
            return this.subTree && this.subTree.some(child => {
                switch (this.mode) {
                    case "all":
                        return true;
                        break;
                    case "folders":
                        return isFolder(child);
                        break;
                    case "files":
                        return isFile(child);
                        break;
                }
            });
        }
    },

    methods: {
        toggleSubTree() {
            this.subTreeOpened = !this.subTreeOpened;
        }
    }
};
</script>

<style scoped>
li {
  padding: 0.5rem;
}

.selected {
    background-color: #f2f2f2;
}
</style>
