<template>
<file-manager-loading
    v-if="loading"
    :loading="loading"
/>

<file-manager-error
    v-else-if="error"
    :error="error"
/>

<file-manager-layout
    v-else
/>
</template>

<script>
import FileManagerLoading from "@/components/FileManagerLoading.vue";
import FileManagerError from "@/components/FileManagerError.vue";
import FileManagerLayout from "@/components/FileManagerLayout.vue";

export default {
    components: {
        FileManagerLoading,
        FileManagerError,
        FileManagerLayout
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
