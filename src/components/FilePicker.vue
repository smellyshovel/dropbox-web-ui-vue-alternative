<template>
<div class="overlay" @click="reject">
    <folder-path
        :folder="currentFolder"
        @click="revealAndChoose(...arguments)"
        :dont-go="true"
    />

    <tree-view
        :tree="currentFolder.contents"
        mode="folders"
        :deepness="1"
    >
        <template v-slot:default="{ item }">
            <tree-item
                :item="item"
                :prohibitedFolders="prohibitedFolders"
            />
        </template>

        <template v-slot:empty>
            The folder's empty
        </template>
    </tree-view>

    <template v-if="choise">
        <button
            @click="resolve"
        >
            {{ (`${ purpose } to ${ choise.name }`).toUpperCase()}}
        </button>
    </template>
    <template v-else="choise">
        <button disabled>
            PLEASE PICK A FOLDER
        </button>
    </template>
</div>
</template>

<script>
import FolderPath from "@/components/FolderPath.vue";
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FilePickerTreeItem.vue";

import { mapState, mapActions } from "vuex";

export default {
    components: {
        FolderPath,
        TreeView,
        TreeItem
    },

    computed: {
        ...mapState("ui/filePicker", [
            "purpose",
            "currentFolder",
            "prohibitedFolders",
            "choise"
        ])
    },

    methods: {
        ...mapActions("ui/filePicker", [
            "resolve",
            "reject"
        ]),

        revealAndChoose(event, folder) {
            this.$store.dispatch("ui/filePicker/changeFolder", folder);
            this.$store.dispatch("ui/filePicker/chooseFolder", folder);
        }
    }
}
</script>

<style scoped>
.overlay {
    position: absolute;
    display: block;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
}
</style>
