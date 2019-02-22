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
>
    <file-manager-header id="fm-header" />
    <file-manager-sidebar id="fm-sidebar" />
    <file-manager-main id="fm-main" />
</div>
</template>

<script>
import FileManagerLoading from "@/components/FileManagerLoading.vue";
import FileManagerError from "@/components/FileManagerError.vue";
import FileManagerHeader from "@/components/FileManagerHeader.vue";
import FileManagerSidebar from "@/components/FileManagerSidebar.vue";
import FileManagerMain from "@/components/FileManagerMain.vue";

export default {
    components: {
        FileManagerLoading,
        FileManagerError,
        FileManagerHeader,
        FileManagerSidebar,
        FileManagerMain
    },

    async created() {
        try {
            this.loading = "Connecting to the cloud...";
            await this.$store.dispatch("files/connect");

            this.loading = "Updating the files list...";
            await this.$store.dispatch("files/update");
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
    }
};
</script>

<style scoped>
#fm {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas:
        "sidebar header"
        "sidebar main";
    grid-template-columns: 300px auto;
    grid-template-rows: 50px auto;
    user-select: none;
}

#fm-header {
    grid-area: header;
}

#fm-sidebar {
    grid-area: sidebar;
}

#fm-main {
    grid-area: main;
}
</style>
