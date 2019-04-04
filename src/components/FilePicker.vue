<template>
<modal-window @close="reject">
    <template v-slot:header>
        <div class="header">
            <span class="headline">{{ purpose }} entries</span>
            <span class="sub">Please, pick a destination folder below</span>
        </div>
    </template>

    <div class="main-wrapper">
        <section class="folder-path">
            <folder-path
                :folder="currentFolder"
                @click="revealAndChoose(...arguments)"
                :dont-go="true"
            />
        </section>

        <section class="tree-view">
            <tree-view
                :tree="normalizedCurrentFolderContents"
                mode="folders"
                :deepness="1"
                select-mode="single"
            >
                <template v-slot:default="{ item }">
                    <tree-item
                        :item="item"
                        :prohibitedFolders="prohibitedFolders"
                    />
                </template>

                <template v-slot:empty>
                    No folders here...
                </template>
            </tree-view>
        </section>
    </div>

    <template v-slot:footer>
        <div class="footer">
            <button
                @click="reject"
                class="cancel"
            >
                Cancel
            </button>

            <template v-if="choise">
                <button
                    @click="resolve"
                    class="accept"
                >
                    {{ purpose }} to <strong>{{ choise.name }}</strong></span>
                </button>
            </template>
            <template v-else>
                <button
                    class="accept"
                    disabled
                >
                    PICK A FOLDER
                </button>
            </template>
        </div>
    </template>
</modal-window>
</template>

<script>
import ModalWindow from "@/components/ModalWindow.vue";
import FolderPath from "@/components/FolderPath.vue";
import TreeView from "@/components/TreeView.vue";
import TreeItem from "@/components/FilePickerTreeItem.vue";

import { mapState, mapActions } from "vuex";

export default {
    components: {
        ModalWindow,
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
        ]),

        normalizedCurrentFolderContents() {
            return this.currentFolder.contents.filter(child => {
                return !child.isFake;
            });
        }
    },

    data() {
        return {
            selectedFolder: null
        }
    },

    methods: {
        ...mapActions("ui/filePicker", [
            "resolve",
            "reject"
        ]),

        revealAndChoose(event, folder) {
            this.$store.dispatch("ui/filePicker/changeFolder", folder);

            if (!this.prohibitedFolders.includes(folder)) {
                this.$store.dispatch("ui/filePicker/chooseFolder", folder);
            }
        }
    }
}
</script>

<style scoped>
.header {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    align-items: center;
}

.header .headline {
    color: rgba(0, 0, 0, 0.85);
    text-transform: capitalize;
}

.main-wrapper {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
}

.folder-path {
    margin: 0.5rem;
}

.tree-view {
    width: 100%;
}

.header .sub {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.65);
}

.footer {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-content: center;
}

.footer button {
    margin-left: 0.5rem;
    padding: 0.5rem;
    background-color: white;
    text-transform: uppercase;
    border-width: 2px;
    border-style: solid;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
}

.footer .cancel {
    color: rgba(0, 0, 0, 0.65);
    border-color: #bdbdbd;
}

.footer .cancel:hover {
    color: rgba(0, 0, 0, 0.85);
    border-color: rgb(126, 87, 194);
}

.footer .accept {
    color: rgba(0, 0, 0, 0.85);
    border-color: rgb(126, 87, 194);
}

.footer .accept:hover {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.9);
}

.footer .accept:disabled, .footer .accept:disabled:hover {
    color: #d2d2d2;
    border-color: #f2f2f2;
}

</style>
