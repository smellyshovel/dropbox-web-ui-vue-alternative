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
    v-context-menu.disabled
>
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
            await this.$store.dispatch("cloud/connect", this.$store.getters["cloud/token"]);
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
            error: null
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
