<template>
    <h1>
        <span
            v-for="(chunk, index) in pathChunks"
            :key="index"
        >
            <span
                v-if="index < pathChunks.length - 1"
            >
                <router-link :to="getLinkPath(index)">{{ chunk }}</router-link>
                >
            </span>

            <span
                v-else
            >
                {{ chunk }}
            </span>
        </span>
    </h1>
</template>

<script>
export default {
    props: {
        path: String
    },

    computed: {
        pathChunks() {
            if (this.path === "") return ["☁"];
            let path = ("☁/" + this.path).split("/");
            return path;
        }
    },

    methods: {
        getLinkPath(index) {
            let path = this.path.split("/");
            path = path.slice(0, index);

            if (path.length === 0) {
                return "/fm";
            } else {
                return "/fm/" + path.join("/");
            }
        }
    }
}
</script>

<style scoped>
</style>
