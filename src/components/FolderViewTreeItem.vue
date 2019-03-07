<template>
<div>
    <div
        @dblclick="mainAction()"
    >
        <img :src="entry.thumbnail">
        {{ entry.name }} [{{ entry.size }}]
    </div>
    <div>
        <button @click="toggleMoveDialog">Move</button>
        <div v-if="moveDialogOpened">
            Moving...
            <div
                v-if="moveConflict"
                class="conflict"
            >
                {{ moveConflict.conflict.target.type }} called "{{ moveConflict.conflict.target.name }}" already exists. What to do?
                <form @submit.prevent="moveConflictResolver({ strategy: moveConflictResolutionStrategy, sameForTheRest: moveConflictResolutionStrategySameForTheRest || false });">
                    <input type="radio" value="autorename" v-model="moveConflictResolutionStrategy"> Autorename
                    <br>
                    <input type="radio" value="skip" v-model="moveConflictResolutionStrategy"> Skip moving this {{ moveConflict.conflict.source.type }}
                    <br>
                    <div v-if="moveConflict.totalNumberOfConflicts > 1">
                        <input v-if="" type="checkbox" :value="true" v-model="moveConflictResolutionStrategySameForTheRest"> Apply for the rest {{ moveConflict.totalNumberOfConflicts }} conflicts
                        <br>
                    </div>
                    <input type="submit">
                </form>
            </div>
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
                v-if="copyConflict"
                class="conflict"
            >
                {{ copyConflict.conflict.target.type }} called "{{ copyConflict.conflict.target.name }}" already exists. What to do?
                <form @submit.prevent="copyConflictResolver({ strategy: copyConflictResolutionStrategy, sameForTheRest: copyConflictResolutionStrategySameForTheRest || false });">
                    <input type="radio" value="autorename" v-model="copyConflictResolutionStrategy"> Autorename
                    <br>
                    <input type="radio" value="skip" v-model="copyConflictResolutionStrategy"> Skip moving this {{ copyConflict.conflict.source.type }}
                    <br>
                    <div v-if="copyConflict.totalNumberOfConflicts > 1">
                        <input v-if="" type="checkbox" :value="true" v-model="copyConflictResolutionStrategySameForTheRest"> Apply for the rest {{ copyConflict.totalNumberOfConflicts }} conflicts
                        <br>
                    </div>
                    <input type="submit">
                </form>
            </div>
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
            moveConflict: null,
            moveConflictResolver: null,
            moveConflictResolutionStrategy: null,
            moveConflictResolutionStrategySameForTheRest: null,
            moveDest: null,
            moveEntriesError: null,
            copyDialogOpened: false,
            copyConflict: null,
            copyConflictResolver: null,
            copyConflictResolutionStrategy: null,
            copyConflictResolutionStrategySameForTheRest: null,
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

        async resolveMoveConflict(conflict, totalNumberOfConflicts) {
            this.moveConflict = {
                conflict,
                totalNumberOfConflicts
            };

            return new Promise((resolve, reject) => {
                this.moveConflictResolver = resolve;
            })
                .then((res) => {
                    this.moveConflict = null;
                    this.moveConflictResolver = null;
                    this.moveConflictResolutionStrategy = null;
                    this.moveConflictResolutionStrategySameForTheRest = null;
                    return res;
                });
        },

        async moveEntry() {
            try {
                await this.$store.dispatch("cloud/moveEntries", {
                    entries: [this.entry],
                    destination: this.moveDest,
                    conflictResolver: this.resolveMoveConflict
                })

                this.moveEntriesError = null;
            } catch (err) {
                this.moveEntriesError = err;
            }
        },

        toggleCopyDialog() {
            this.copyDialogOpened = !this.copyDialogOpened;
        },

        async resolveCopyConflict(conflict, totalNumberOfConflicts) {
            this.copyConflict = {
                conflict,
                totalNumberOfConflicts
            };

            return new Promise((resolve, reject) => {
                this.copyConflictResolver = resolve;
            })
                .then((res) => {
                    this.copyConflict = null;
                    this.copyConflictResolver = null;
                    this.copyConflictResolutionStrategy = null;
                    this.copyConflictResolutionStrategySameForTheRest = null;
                    return res;
                });
        },

        async copyEntry() {
            try {
                await this.$store.dispatch("cloud/copyEntries", {
                    entries: [this.entry],
                    destination: this.copyDest,
                    conflictResolver: this.resolveCopyConflict
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

.conflict {
    background-color: rgb(159, 23, 68);
    color: white;
}
</style>
