<template>
<div
    @dblclick="$router.push('/fm' + entry.path_lower)"
    :class="{ current: isCurrentDirectory }"
>
    <span
        v-if="item.hasSubFolders"
        @click.stop="item.toggle"
    >
        {{ item.open ? '⮝' : '⮟' }}
    </span>
    <img :src="entry.thumbnail">
    {{ entry.name }}
</div>
</template>

<script>
export default {
    props: {
        item: Object
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        isCurrentDirectory() {
            return this.$route.path === "/fm" + this.item.entry.path_lower;
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
</style>
