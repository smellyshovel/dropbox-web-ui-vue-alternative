<template>
    <div>
        <div
            v-if="loading"
        >
            {{ filePath }}
        </div>

        <div
            v-else-if="error"
        >
            Couldn't create a preview for the requested file. Download it instead?
        </div>

        <div
            v-else-if="preview"
        >
            <embed :type="preview.type" :src="previewSrc">
        </div>
    </div>
</template>

<script>
export default {
  props: {
    filePath: String
  },

  created() {
    this.$store.getters.DBI.filesGetPreview({
      path: "/" + this.filePath
    })
      .then(ans => {
        this.loading = false;
        this.preview = ans.fileBlob;
      })
      .catch(err => {
        this.loading = false;
        this.error = true;
      });
  },

  data() {
    return {
      loading: true,
      error: null,
      preview: null
    };
  },

  computed: {
    previewSrc() {
      return window.URL.createObjectURL(this.preview);
    }
  }
};
</script>

<style scoped>
embed {
  width: 100%;
  height: 100%;
}

div {
  height: 100%;
}
</style>
