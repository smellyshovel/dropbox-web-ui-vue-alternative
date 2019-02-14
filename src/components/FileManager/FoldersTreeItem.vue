<template>
<div
    :class="{ current: isCurrentDirectory }"
    @dblclick="navigate"
>
    <img :src="entry.thumbnail">

    <span
        v-if="item.hasSubTree"
        class="toggler"
        @click="item.toggleSubTree()"
    >
        {{ item.subTreeOpened ? "⮝" : "⮟" }}
    </span>

    {{ entry.name }}
</div>
</template>

<script>
export default {
    props: {
        item: Object
    },

    created() {
        let reveal = this.$route.params.folderLink;
        if (reveal.includes(this.entry.link) && reveal !== this.entry.link) this.item.subTreeOpened = true;
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        isCurrentDirectory() {
            return this.$route.params.folderLink === this.entry.link;
        }
    },

    methods: {
        navigate() {
            this.$router.push({ name: "fm", params: { folderLink: this.entry.link } });
        }
    }
}
</script>

<style scoped>
img {
    height: 1rem;
}

.current {
    background-color: rgb(75, 115, 184);
    color: #fff;
}

.toggler {
    color: #be006c;
}
</style>
