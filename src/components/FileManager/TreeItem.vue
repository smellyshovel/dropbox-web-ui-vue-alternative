<template>
<li>
    <div :class="{ selected }">
        <slot :item="this"></slot>
    </div>

    <tree-view
        v-if="entry.children"
        v-show="open"

        :entries="entry.children"
        :mode="mode"
        :deepness="maxDeepness"
        :current-deepness="currentDeepness + 1"
        :parent-tree="this.$parent"
        :reveal-current="revealCurrent"
    >
        <template slot-scope="{ item }">
            <slot :item="item" />
        </template>
    </tree-view>
</li>
</template>

<script>
export default {
    props: {
        entry: Object,
        mode: String,
        revealCurrent: Boolean,
        maxDeepness: Number,
        currentDeepness: Number
    },

    components: {
        TreeView: () => import("./TreeView.vue")
    },

    computed: {
        hasSubFolders() {
            if (!this.entry.children) return false;
            return this.entry.children.filter(child => child[".tag"] === "folder").length > 0;
        }
    },

    data() { return {
        open: (() => {
            if (this.revealCurrent && this.$route.path.includes("/fm" + this.entry.path_lower) && this.$route.path !== "/fm" + this.entry.path_lower) {
                return true;
            }

            return this.maxdeepness === 0 ? true : (this.currentDeepness < this.maxDeepness ? true : false);
        })(),
        selected: false
    }},

    methods: {
        toggle() {
            this.open = !this.open;
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
