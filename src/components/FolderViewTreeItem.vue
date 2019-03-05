<template>
<div>
    <div
        @dblclick="mainAction()"
    >
        <img :src="entry.thumbnail">
        {{ entry.name }}
    </div>
    <div>
        <button @click="toggleMoveDialog">Move</button>
        <div v-if="moveDialogOpened">
            Moving...
            <div
                v-if="moveEntriesError"
                class="error"
                v-html="moveEntriesError.message"
            />

            <select v-model="moveDest" @change="moveEntry">
                <option
                    v-for="folder in allFolders"
                    :value="folder"
                >{{ folder.path }}</option>
            </select>
        </div>

        <button @click="toggleCopyDialog">Copy</button>
        <div v-if="copyDialogOpened">
            Copying...
            <div
                v-if="copyEntriesError"
                class="error"
                v-html="copyEntriesError.message"
            />

            <select v-model="copyDest" @change="copyEntry">
                <option
                    v-for="folder in allFolders"
                    :value="folder"
                >{{ folder.path }}</option>
            </select>
        </div>

        <button @click="toggleRenameDialog">Rename</button>
        <div v-if="renameDialogOpened">
            <div
                v-if="renameEntryError"
                class="error"
                v-html="renameEntryError.message"
            />

            Renaming...
            <form @submit.prevent="renameEntry">
                <input type="text" v-model="renameName">
                <input type="submit">
            </form>
        </div>

        <button @click="deleteEntry">Delete</button>
        <div
            v-if="deleteEntriesError"
            class="error"
            v-html="deleteEntriesError.message"
        />
    </div>
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

        allFolders() {
            return this.$store.state.cloud.entries.filter(entry => {
                return entry.type === "folder";
            });
        },
    },

    data() {
        return {
            moveDialogOpened: false,
            moveDest: null,
            moveEntriesError: null,
            copyDialogOpened: false,
            copyDest: null,
            copyEntriesError: null,
            renameDialogOpened: false,
            renameName: "",
            renameEntryError: null,
            deleteEntriesError: null
        };
    },

    methods: {
        mainAction() {
            if (this.entry.type === "folder") {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (this.entry.type === "file") {
                this.$store.dispatch("cloud/download", this.entry);
            }
        },

        toggleMoveDialog() {
            this.moveDialogOpened = !this.moveDialogOpened;
        },

        async moveEntry() {
            try {
                await this.$store.dispatch("cloud/moveEntries", {
                    entries: [this.entry],
                    destination: this.moveDest
                })

                this.moveEntriesError = null;
            } catch (err) {
                this.moveEntriesError = err;
            }
        },

        toggleCopyDialog() {
            this.copyDialogOpened = !this.copyDialogOpened;
        },

        async copyEntry() {
            try {
                await this.$store.dispatch("cloud/copyEntries", {
                    entries: [this.entry],
                    destination: this.copyDest
                })

                this.copyEntriesError = null;
            } catch (err) {
                this.copyEntriesError = err;
            }
        },

        toggleRenameDialog() {
            this.renameDialogOpened = !this.renameDialogOpened;
        },

        async renameEntry() {
            try {
                await this.$store.dispatch("cloud/renameEntry", {
                    entry: this.entry,
                    name: this.renameName
                })

                this.renameEntryError = null;
            } catch (err) {
                this.renameEntryError = err;
            }
        },

        async deleteEntry() {
            let conf = confirm("Are you sure?");

            if (conf) {
                try {
                    await this.$store.dispatch("cloud/deleteEntries", [this.entry])

                    this.deleteEntriesError = null;
                } catch (err) {
                    this.deleteEntriesError = err;
                }
            }
        }
    }
}
</script>

<style scoped>
img {
    width: 1rem;
}

.error {
    color: red;
}
</style>
