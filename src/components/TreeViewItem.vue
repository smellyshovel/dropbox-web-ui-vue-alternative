<template>
<li
    :class="{ selected: isSelected }"
    @mousedown.exact.stop="select($event)"
    @mousedown.ctrl.exact.stop="ctrlSelect($event)"
    @mousedown.shift.exact.stop="shiftSelect($event)"
>

    <slot :item="this" />

    <tree-view
        v-if="hasSubTree && subTreeOpened"
        :tree="subTree"
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-view>
</li>
</template>

<script>
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
        "selectMode": "providedSelectMode",
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
            return this.entry.contents;
        },

        hasSubTree() {
            return this.subTree && this.subTree.some(child => {
                switch (this.mode) {
                    case "all":
                        return true;
                        break;
                    case "folders":
                        return child.type === "folder";
                        break;
                    case "files":
                        return child.type === "file";
                        break;
                }
            });
        },

        isSelected() {
            return this.$store.getters["ui/selections/isSelected"](this);
        },

        isDisabled() {
            return this.entry.isFake;
        }
    },

    methods: {
        toggleSubTree() {
            this.subTreeOpened = !this.subTreeOpened;
        },

        select(event) {
            if (this.selectMode === "disabled") return;

            let alreadySelected = this.$store.getters["ui/selections/allSelected"].includes(this);
            let rightClick = event.which === 3;

            if (rightClick) {
                if (!alreadySelected) {
                    this.$store.dispatch("ui/selections/setSingle", this);
                }
            } else {
                this.$store.dispatch("ui/selections/setSingle", this);
            }

        },

        ctrlSelect(event) {
            if (this.selectMode === "disabled") return;

            if (this.selectMode === "multiple") {
                this.$store.dispatch("ui/selections/toggle", this);
            } else if (this.selectMode === "single") {
                this.select(event);
            }
        },

        shiftSelect(event) {
            if (this.selectMode === "disabled") return;

            if (this.selectMode === "multiple") {
                // ctrl-select instead of shift-select for nested trees
                if (this.deepness !== 1) return this.ctrlSelect();

                this.$store.dispatch("ui/selections/setRange", {
                    target: this,
                    bank: this.$parent.$refs.items
                });
            } else if (this.selectMode === "single") {
                this.select(event);
            }
        }
    }
};
</script>
