<template>
<file-manager-loading
    v-if="loading"
    :loading="loading"
/>

<file-manager-error
    v-else-if="error"
    :error="error"
/>

<file-manager
    v-else-if="folder"
    :folder="folder"
/>
</template>

<script>
import FileManagerLoading from "@/components/FileManagerLoading.vue";
import FileManagerError from "@/components/FileManagerError.vue";
import FileManager from "@/components/FileManager.vue";
import { mapGetters } from "vuex";

export default {
    components: {
        FileManagerLoading,
        FileManagerError,
        FileManager
    },

    props: {
        folderLink: String
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
            loading: "Loading the File Manager...",
            error: null
        };
    },

    computed: {
        folder() {
            let folder = this.folderByLink(this.folderLink);
            if (!folder) this.$router.replace({ name: "fm" });
            return folder;
        },

        ...mapGetters("files", [
            "folderByLink"
        ])
    }
};
</script>

<style scoped>
</style>
