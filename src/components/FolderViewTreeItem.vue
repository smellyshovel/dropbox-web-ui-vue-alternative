<template>
<div
    @dblclick="mainAction"
    :class="{ selected: isSelected }"
    class="entry"
>
    <div
        class="mimetype-icon"
        :style="{ backgroundImage: thumbnail }"
    />

    <span class="name">
        {{ entry.name }}
    </span>

    <span class="size">
        {{ normalizedSize }}
    </span>

    <span class="modification-date">
        {{ modificationDate }}
    </span>
</div>
</template>

<script>
export default {
    props: {
        item: Object,
    },

    computed: {
        entry() {
            return this.item.entry;
        },

        isSelected() {
            return this.item.isSelected;
        },

        thumbnail() {
            return `url(${this.entry.thumbnail})`;
        },

        normalizedSize() {
            let size = this.entry.size;

            let steps = 0;
            while (size / 1024 > 1) {
                size = size / 1024;
                steps += 1;
            }

            let prefixes = ["", "k", "M", "G", "T", "P"];
            return size.toFixed(2) + prefixes[steps] + "B";
        },

        modificationDate() {
            return this.entry.lastModified.toLocaleDateString();
        }
    },

    methods: {
        mainAction() {
            if (this.entry.type === "folder") {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (this.entry.type === "file") {
                this.$store.dispatch("cloud/downloadEntries", {
                    entries: [this.entry],
                    asZip: false
                });
            }
        }
    }
}
</script>

<style scoped>
.list .entry {
    margin-bottom: 0.25rem;
    padding: 0.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.9);
}

.list .entry:hover {
    background-color: #f2f2f2;
}

.list .selected .entry {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.85);
}

.list .name {
    margin-left: 0.5rem;
    margin-right: auto;
}

.list .mimetype-icon {
    padding: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: white;
    background-size: auto 1rem;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
}

.list .size, .list .modification-date {
    margin-right: 0.5rem;
    color: rgba(0, 0, 0, 0.5);
}

.list .selected .size, .list .selected .modification-date {
    color: rgba(255, 255, 255, 0.85);
}
</style>
