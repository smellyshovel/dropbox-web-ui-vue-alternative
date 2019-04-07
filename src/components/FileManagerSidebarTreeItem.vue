<template>
<div
    v-if="!entry.isFake"
    @dblclick="reveal"
    :class="{ selected: isSelected, current: isCurrentDirectory }"
    class="folder"
    :style="{ paddingLeft: (level - 1) * 1.5 + 'rem' }"
    v-context-menu="appropriateContextMenu"
>
    <div class="toggler-holder">
        <span
            v-if="item.hasSubTree"
            @click="item.toggleSubTree()"
            :class="{ opened: subTreeOpened }"
            class="toggler"
        />
    </div>

    <span class="folder-icon" />

    <span class="folder-name">
        {{ entry.name }}
    </span>
</div>

<div
    v-else
    @dblclick="reveal"
    :class="{ selected: isSelected, current: isCurrentDirectory }"
    class="folder disabled"
    :style="{ paddingLeft: (level - 1) * 1.5 + 'rem' }"
    v-context-menu.disabled
>
    <div class="toggler-holder">
        <span
            v-if="item.hasSubTree"
            @click="item.toggleSubTree()"
            :class="{ opened: subTreeOpened }"
            class="toggler"
        />
    </div>

    <span class="folder-icon" />

    <span class="folder-name">
        {{ entry.name }}
    </span>
</div>
</template>

<script>
export default {
    props: {
        item: Object
    },

    created() {
        let reveal = this.$route.params.folderLink || "";
        if (reveal.includes(this.entry.link) && reveal !== this.entry.link) this.item.subTreeOpened = true;
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        isSelected() {
            return this.item.isSelected;
        },

        isCurrentDirectory() {
            return this.$route.params.folderLink === this.entry.link;
        },

        level() {
            return this.item.level;
        },

        subTreeOpened() {
            return this.item.subTreeOpened;
        },

        appropriateContextMenu() {
            let selectedEntries = this.$store.getters["ui/selections/allSelected"].map(selected => {
                return selected.entry;
            });

            let prefix = "#cm-folder-view-"

            if (selectedEntries.length === 1) {
                return prefix + "single";
            } else if (selectedEntries.length > 1) {
                return prefix + "multiple";
            }
        }
    },

    methods: {
        reveal() {
            this.$router.push({ name: "fm", params: { folderLink: this.entry.link } });
        }
    }
}
</script>

<style scoped>
.folder {
    padding: 0.25rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
}

.folder.disabled {
    opacity: 0.5;
    filter: grayscale(1);
}

.folder.disabled:hover {
    background-color: transparent;
}

.folder:hover {
    background-color: #e8e8e8;
}

.folder.current {
    background-color: #d2d2d2;
}

.folder.selected {
    background-color: rgb(126, 87, 194);
}

.folder-icon {
    padding: 0.25rem;
    display: block;
    min-width: 1rem;
    min-height: 1rem;
    background-image: url("/src/assets/mimetypes/folder.svg");
    background-size: 1rem;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
}

.selected > .folder-icon, .current > .folder-icon {
    background-color: white;
}

.folder-name {
    margin-left: 0.25rem;
    color: rgba(0, 0, 0, 0.85);
    white-space: nowrap;
}

.selected > .folder-name {
    color: rgba(255, 255, 255, 0.9);
}

.toggler-holder {
    padding: 0.25rem;
    display: block;
    min-width: 1rem;
    min-height: 1rem;
}

.toggler {
    display: block;
    width: 1rem;
    height: 1rem;
    background-image: url("/src/assets/icons/toggler-closed-gray.svg");
    background-size: 1rem;
    background-position: center;
    background-repeat: no-repeat;
    cursor: pointer;
}

.toggler.opened {
    background-image: url("/src/assets/icons/toggler-opened-gray.svg");
}

.selected > .toggler, .current > .toggler {
    background-image: url("/src/assets/icons/toggler-closed-white.svg");
}

.selected > .toggler.opened, .current > .toggler.opened {
    background-image: url("/src/assets/icons/toggler-opened-white.svg");
}
</style>
