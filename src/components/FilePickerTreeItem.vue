<template>
<div
    @dblclick.stop="reveal"
    @click.stop="choose"
    :class="{ disabled: isProhibited }"
>
    {{ folder.name }}
</div>
</template>

<script>
export default {
    props: {
        item: Object,
        prohibitedFolders: Array
    },

    computed: {
        folder() {
            return this.item.entry;
        },

        isProhibited() {
            return this.prohibitedFolders.includes(this.folder);
        }
    },

    methods: {
        reveal() {
            if (!this.isProhibited) {
                this.$store.dispatch("ui/filePicker/changeFolder", this.folder);
            }
        },

        choose() {
            if (!this.isProhibited) {
                this.$store.dispatch("ui/filePicker/chooseFolder", this.folder);
            }
        }
    }
}
</script>

<style scoped>
.disabled {
    color: red;
}
</style>
