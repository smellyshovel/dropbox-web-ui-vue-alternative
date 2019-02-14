<template>
<li

    @click.exact.stop="select"
    @click.ctrl.exact.stop="ctrlSelect"
    @click.shift.exact.stop="shiftSelect"
>
    <div
        :class="{selected: isSelected}"
    >
        <slot :item="this"></slot>
    </div>

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
        },

        isSelected() {
            return this.$store.getters["selections/isSelected"](this);
        }
    },

    methods: {
        toggleSubTree() {
            this.subTreeOpened = !this.subTreeOpened;
        },

        select() {
            this.$store.dispatch("selections/setSingle", this);
        },

        ctrlSelect() {
            this.$store.dispatch("selections/toggle", this);
        },

        shiftSelect() {
            // ctrl-select instead of shift-select for nested trees
            if (this.deepness !== 1) return this.selectCtrl();

            this.$store.dispatch("selections/setRange", {
                target: this,
                bank: this.$parent.$refs.items
            });
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
