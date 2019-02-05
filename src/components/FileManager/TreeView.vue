<template>
<ol>
    <tree-item
        v-for="(entry, index) in tree"
        :key="index"

        :entry="entry"
        :mode="mode"
        :max-deepness="deepness"
        :current-deepness="currentDeepness"
        :reveal-current="revealCurrent"

        
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-item>
</ol>
</template>

<script>
import TreeItem from "@/components/FileManager/TreeItem.vue";

export default {
    components: {
        TreeItem
    },

    props: {
        entries: {
            type: Array,
            required: true
        },
        mode: {
            type: String,
            default: "all",
            validator: value => ["all", "folders", "files"].indexOf(value) !== -1
        },
        deepness: {
            type: Number,
            default: 1
        },
        revealCurrent: {
            type: Boolean,
            default: false
        },

        currentDeepness: {
            type: Number,
            default: 1
        },
        parentTree: {
            type: Object
        }
    },

    created() {
        if (this.parentTree) {
            this.parentTree.childTrees.push(this);
        }
    },

    computed: {
        tree() {
            return this.entries.filter(entry => {
                switch (this.mode) {
                    case "all":
                        return true;
                        break;
                    case "folders":
                        return entry[".tag"] === "folder";
                        break;
                    case "files":
                        return entry[".tag"] === "file";
                        break;
                }
            });
        }
    },

    data() { return {
        childTrees: [],
        selected: [],
        lastSelectedIndex: null
    }},

    methods: {
        selectSingle(event, item) {
            this.deselectAll();
            this.selected = [item];
        },

        selectMore(event, item) {
            this.selected.push(item);
        },

        selectMany(event, item) {
            let lastSelectedIndex = zthis.selected.length - 1;
            let targetIndex = this.$children.indexOf(item);

            this.deselectAll();

            if (lastSelectedIndex < targetIndex) {
                for (let i = lastSelectedIndex; i < targetIndex; i++) {
                    this.$children[i].selected = true;
                    this.selected.push(this.$children[i]);
                }
            } else {
                for (let i = lastSelectedIndex; i > targetIndex; i--) {
                    this.$children[i].selected = true;
                    this.selected.push(this.$children[i]);
                }
            }

        },

        deselect(event, item) {
            let index = this.selected.indexOf(item);
            this.selected.splice(index, 1);
        },

        deselectAll() {
            this.selected.forEach(selectedItem => {
                selectedItem.selected = false;
            });

            this.selected = [];
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
