<template>
<div
    @dblclick="reveal"
    @click="choose"
    :class="{ selected: isSelected, disabled: isProhibited }"
    class="entry"
>
    <div class="icon" />

    <span class="name">
        {{ folder.name }}
    </span>
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
        },

        isSelected() {
            return this.item.isSelected;
        }
    },

    methods: {
        reveal() {
            this.$store.dispatch("ui/filePicker/changeFolder", this.folder);
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
.entry {
    margin-bottom: 0.25rem;
    padding: 0.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.9);
    border-radius: 2.5px;
}

.entry:hover {
    background-color: #f2f2f2;
}

.selected .entry {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.85);
}

.entry.disabled, .selected .entry.disabled {
    background-color: white;
    color: #bdbdbd;
}

.entry.disabled:hover {
    background-color: #f2f2f2;
}

.name {
    margin-left: 0.5rem;
    margin-right: auto;
}

.icon {
    padding: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: white;
    background-image: url("/src/assets/mimetypes/folder.svg");
    background-size: 1rem;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 5px;
}

.entry.disabled .icon {
    filter: grayscale(1);
    opacity: 0.5;
}
</style>
