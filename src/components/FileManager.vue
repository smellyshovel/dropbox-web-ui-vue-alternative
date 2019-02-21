<template>
<div id="fm">
    <aside>
        <the-file-manager-sidebar />
    </aside>
    <main>
        <folder-view :folder="folder" />
    </main>
</div>
</template>

<script>
import TheFileManagerSidebar from "@/components/TheFileManagerSidebar.vue";
import FolderView from "@/components/FolderView.vue";

export default {
    components: {
        FolderView,
        TheFileManagerSidebar,
    },

    props: {
        folder: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
#fm {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 300px auto;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
}
</style>
