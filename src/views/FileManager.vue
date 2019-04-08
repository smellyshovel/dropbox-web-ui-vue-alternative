<template>
<file-manager-loading
    v-if="loading"
    :loading="loading"
/>

<file-manager-error
    v-else-if="error"
    :error="error"
/>

<div
    id="fm"
    v-else
    @mousedown="clearSelections"
    @dragenter="showDropzone"
    v-context-menu.disabled
>
    <div
        id="dropzone"
        v-if="dropzoneVisible"

        @dragover.prevent
        @dragleave="hideDropzone"
        @drop.prevent="upload($event)"
    >
        <div
            class="hint"
            @dragenter.stop
            @dragleave.stop
        >
            <h1>Upload files</h1>
            <span class="known-bug">
                Please, notice that the current version of the application
                <strong>doesn't support folder uploadings</strong>.
                Use "Upload Folder" button located in the top right corner
                instead to upload a folder
            </span>
        </div>
    </div>

    <file-picker v-if="showFilePicker" />
    <name-picker v-if="showNamePicker" />
    <conflict-resolver v-if="showConflictResolver" />

    <file-manager-sidebar-header id="fm-sidebar-header" />
    <file-manager-header id="fm-header" />
    <file-manager-status-reflector id="fm-status-reflector" />
    <file-manager-sidebar id="fm-sidebar" />
    <file-manager-main id="fm-main" />
</div>
</template>

<script>
import FileManagerLoading from "@/components/FileManagerLoading.vue";
import FileManagerError from "@/components/FileManagerError.vue";
import FileManagerSidebarHeader from "@/components/FileManagerSidebarHeader.vue";
import FileManagerHeader from "@/components/FileManagerHeader.vue";
import FileManagerStatusReflector from "@/components/FileManagerStatusReflector.vue";
import FileManagerSidebar from "@/components/FileManagerSidebar.vue";
import FileManagerMain from "@/components/FileManagerMain.vue";

import FilePicker from "@/components/FilePicker.vue";
import NamePicker from "@/components/NamePicker.vue";
import ConflictResolver from "@/components/ConflictResolver.vue";

export default {
    components: {
        FileManagerLoading,
        FileManagerError,
        FileManagerSidebarHeader,
        FileManagerHeader,
        FileManagerStatusReflector,
        FileManagerSidebar,
        FileManagerMain,

        FilePicker,
        NamePicker,
        ConflictResolver
    },

    async created() {
        try {
            this.loading = "Connecting to the cloud";
            await this.$store.dispatch("cloud/connect", this.$store.getters["cloud/token"]());
        } catch (err) {
            return this.$router.replace({
                name: "home",
                params: {
                    redirected: true,
                    redirectionDetails: {
                        type: "error",
                        message: err.message
                    }
                }
            });
        }

        try {
            this.loading = "Retrieving the account information";
            await this.$store.dispatch("cloud/updateAccountInfo");

            this.loading = "Updating the files list";
            await this.$store.dispatch("cloud/updateEntries");
        } catch (err) {
            this.error = err;
        } finally {
            this.loading = false;
        }
    },

    data() {
        return {
            loading: true,
            error: null,
            dropzoneVisible: false
        };
    },

    computed: {
        showFilePicker() {
            return this.$store.state.ui.filePicker.show;
        },

        showNamePicker() {
            return this.$store.state.ui.namePicker.show;
        },

        showConflictResolver() {
            return this.$store.state.ui.conflictResolver.show;
        }
    },

    methods: {
        clearSelections() {
            this.$store.dispatch("ui/selections/clear");
        },

        showDropzone() {
            this.dropzoneVisible = true;
        },

        hideDropzone() {
            this.dropzoneVisible = false;
        },

        async upload(event) {
            this.hideDropzone();

            this.$store.commit("ui/statusReflector/setInProgress");

            try {
                await this.$store.dispatch("cloud/uploadEntries", {
                    files: Array.from(event.dataTransfer.files), // has to transform to an array beforehand because of a bug in chrome
                    destination: await this.$store.dispatch("ui/filePicker/pickFolder", {
                        purpose: "upload"
                    }),
                    conflictResolver: async (conflict, remainingConflictsNumber) => {
                        return await this.$store.dispatch("ui/conflictResolver/resolveConflict", {
                            conflict,
                            remainingConflictsNumber
                        });
                    }
                });

                this.$store.commit("ui/statusReflector/setReady");
            } catch (err) {
                if (err !== "file_picker_cancel") {
                    this.$store.commit("ui/statusReflector/setError", err);
                } else {
                    this.$store.commit("ui/statusReflector/setReady");
                }
            }
        }
    }
};
</script>

<style scoped>
#fm {
    display: grid;
    grid-template-areas:
        "sidebar-header header"
        "status-reflector status-reflector"
        "sidebar main";
    grid-template-rows: 64px min-content auto;
    grid-template-columns: 256px auto;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    user-select: none;
}

#dropzone {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 500;
}

#dropzone .hint {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    min-width: 400px;
    max-width: 50%;
    overflow: hidden;
    background-color: white;
    border-radius: 5px;
}

#dropzone h1 {
    color: rgb(126, 87, 194);
}

#dropzone .known-bug {
    padding: 1rem;
    background-color: rgb(204, 69, 69);
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
}

#fm-sidebar-header {
    grid-area: sidebar-header;
}

#fm-header {
    grid-area: header;
}

#fm-status-reflector {
    grid-area: status-reflector;
}

#fm-sidebar {
    grid-area: sidebar;
}

#fm-main {
    grid-area: main;
}
</style>
