<template>
<div id="file-manager-view">
    <file-manager-loading
        v-if="loading"
        :loading="loading"
    />

    <file-manager-error
        v-if="error"
        :error="error"
    />

    <file-manager
        v-if="folder"
        :folder="folder"
    />
</div>
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
        }

        this.folder = this.folderByLink(this.folderLink);
        if (!this.folder) this.$router.replace({ name: "fm" });

        this.loading = false;
    },

    beforeRouteUpdate(to, from, next) {
        this.folder = this.folderByLink(to.params.folderLink);

        if (this.folder) {
            next();
        } else {
            next({ name: "fm" });
        }
    },

    data() {
        return {
            loading: "Loading the File Manager...",
            error: null,
            folder: null
        };
    },

    computed: {
        ...mapGetters("files", [
            "folderByLink"
        ])
    }
};
</script>

<style scoped>
#file-manager-view {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
}
</style>
