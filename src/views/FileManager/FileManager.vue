<template>
    <div v-if="loading">
        Loading data from Dropbox...
    </div>

    <div v-else-if="error">
        {{ error.message }}
    </div>

    <div
    id="fm"
    v-else
    >
    <aside>
        <tree-view
        :entries="tree"
        mode="folders"
        :deepness="3"
        :reveal-current="true"
        >
        <folders-tree-item
        slot-scope="{ item }"
        :item="item"
        ></folders-tree-item>
    </tree-view>
</aside>
<main>
    <folder-path :path="folderPath" />

    <tree-view
    :entries="folder.children"
    >
    <folder-contents-item
    slot-scope="{ item }"
    :item="item"
    @dblclick.native="download(item.entry)"
    ></folder-contents-item>
</tree-view>
</main>
</div>
</template>

<script>
import TreeView from "@/components/FileManager/TreeView.vue";
import FoldersTreeItem from "@/components/FileManager/FoldersTreeItem.vue";
import FolderContentsItem from "@/components/FileManager/FolderContentsItem.vue";
import FolderPath from "@/components/FileManager/FolderPath.vue";
import { mapGetters } from "vuex";

export default {
    props: {
        folderPath: String
    },

    components: {
        TreeView,
        FoldersTreeItem,
        FolderContentsItem,
        FolderPath
    },

    async created() {
        try {
            await this.$store.dispatch("dropbox/updateFilesList");
        } catch (err) {
            this.error = err;
            this.loading = false;
        }

        let folder = this.folderByPath(this.folderPath);

        if (folder) {
            this.folder = folder;
            this.loading = false;
        } else {
            this.$router.replace({ name: "folder" });
        }
    },

    beforeRouteUpdate(to, from, next) {
        let folder = this.folderByPath(to.params.folderPath);

        if (folder) {
            this.folder = folder;
            this.loading = false;

            next();
        } else {
            next({ name: "folder" });
        }
    },

    data() {
        return {
            loading: true,
            error: null,
            folder: null
        };
    },

    computed: {
        ...mapGetters({
            tree: "dropbox/tree",
            folderByPath: "dropbox/folderByPath"
        })
    },

    methods: {
        async download(entry) {
            if (entry[".tag"] !== "file") return;

            let ans = await this.$store.getters.DBI.filesDownload({ path: entry.path_lower })

            var saveData = (function () {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                return function (data, fileName) {
                    var blob = data,
                    url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    return a;
                };
            }());

            let link = saveData(ans.fileBlob, ans.name);
            link.remove();
        }
    }
};
</script>

<style scoped>
#fm {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 300px auto;
}
</style>
