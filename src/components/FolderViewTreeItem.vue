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
            >
                {{ moveEntriesError.message }}
            </div>

            <select v-model="moveDest" @change="moveEntry">
                <option
                    v-for="folder in allFolders"
                    :value="folder"
                >{{ folder.path_display }}</option>
            </select>
        </div>

        <button @click="toggleCopyDialog">Copy</button>
        <div v-if="copyDialogOpened">
            Copying...
            <div
                v-if="copyEntriesError"
                class="error"
            >
                {{ copyEntriesError.message }}
            </div>

            <select v-model="copyDest" @change="copyEntry">
                <option
                    v-for="folder in allFolders"
                    :value="folder"
                >{{ folder.path_display }}</option>
            </select>
        </div>

        <button @click="toggleRenameDialog">Rename</button>
        <div v-if="renameDialogOpened">
            <div
                v-if="renameEntryError"
                class="error"
            >
                {{ renameEntryError.message }}
            </div>

            Renaming...
            <form @submit.prevent="renameEntry">
                <input type="text" v-model="renameName">
                <input type="submit">
            </form>
        </div>

        <button @click="deleteEntry">Delete</button>
    </div>
</div>
</template>

<script>
import { isFile, isFolder } from "@/middleware/helpers.js";
import Errors from "@/middleware/errors.js";

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
                return isFolder(entry);
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
            if (isFolder(this.entry)) {
                this.$router.push({ name: "fm", params: { folderLink: this.entry.link } })
            } else if (isFile(this.entry)) {
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
                console.error(err);

                if (err instanceof Errors.MoveEntriesError) {
                    this.moveEntriesError = err;
                } else {
                    this.moveEntriesError = new Error("Something went wrong...");
                }
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
                console.error(err);

                if (err instanceof Errors.CopyEntriesError) {
                    this.copyEntriesError = err;
                } else {
                    this.copyEntriesError = new Error("Something went wrong...");
                }
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
                console.error(err);

                if (err instanceof Errors.RenameEntryError) {
                    this.renameEntryError = err;
                } else {
                    this.renameEntryError = new Error("Something went wrong...");
                }
            }
        },

        async deleteEntry() {
            let conf = confirm("Are you sure?");

            if (conf) {
                try {
                    await this.$store.dispatch("cloud/deleteEntries", [this.entry])

                    this.deleteEntriesError = null;
                } catch (err) {
                    console.error(err);

                    if (err instanceof Errors.DeleteEntriesError) {
                        this.deleteEntriesError = err;
                    } else {
                        this.deleteEntriesError = new Error("Something went wrong...");
                    }
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
