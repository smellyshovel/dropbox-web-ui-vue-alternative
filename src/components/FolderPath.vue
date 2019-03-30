<template>
    <div class="container">
        <span
            class="container"
            v-for="(folder, index) in foldersChain"
            :key="folder.name"
        >
            <router-link
                :to="folderLink(folder)"
                class="folder-name"
                :class="{ 'is-root': isRoot(folder) }"
            >
                <span v-if="!isRoot(folder)">{{ folder.name }}</span>
            </router-link>

            <span
                v-if="index < foldersChain.length - 1"
                class="separator"
            />
        </span>
    </div>
</template>

<script>
import { Folder } from "@/middleware/entry.js";

export default {
    props: {
        folder: Folder
    },

    computed: {
        foldersChain() {
            let foldersChain = [this.folder];
            let parent = this.folder.parent;

            while (parent) {
                foldersChain.push(parent);
                parent = parent.parent;
            }

            return foldersChain.reverse();
        },
    },

    methods: {
        isRoot(folder) {
            return folder.path === "";
        },

        folderLink(folder) {
            if (this.isRoot(folder)) {
                return { name: "fm" };
            } else {
                return { name: "fm", params: { folderLink: folder.link } };
            }
        }
    }
}
</script>

<style scoped>
.container {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;
}

.folder-name {
    padding: 0 0.25rem;
    display: block;
    color: rgba(0, 0, 0, 0.75);
    text-decoration: none;
    border-bottom: 2px solid #bdbdbd;
}

.folder-name:hover {
    color: rgb(126, 87, 194);
    border-bottom: 2px solid rgb(126, 87, 194);
}

.folder-name.is-root {
    padding: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-image: url("/src/assets/icons/cloud-gray.svg");
    background-repeat: no-repeat;
    background-size: 1.25rem;
    background-position: center;
    border-bottom: none;
}

.folder-name.is-root:hover {
    background-image: url("/src/assets/icons/cloud-purple.svg");
}

.separator {
    display: block;
    width: 1rem;
    height: 1rem;
    background-image: url("/src/assets/icons/folder-path-separator.svg");
    background-repeat: no-repeat;
    background-size: 0.75rem;
    background-position: center;
}
</style>
