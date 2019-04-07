<template>
    <header>
        <div
            @click="update"
            class="update-button"
        />

        <div class="user-corner">
            <span class="user-name">{{ userName }}</span>
            <img :src="userPhoto">
        </div>
    </header>
</template>

<script>
export default {
    computed: {
        userName() {
            return this.$store.state.cloud.accountInfo.name;
        },

        userPhoto() {
            return this.$store.state.cloud.accountInfo.photo;
        }
    },

    methods: {
        async update() {
            this.$store.commit("ui/statusReflector/setInProgress");

            try {
                await this.$store.dispatch("cloud/updateEntries");
                await this.$store.dispatch("cloud/updateAccountInfo");

                this.$store.commit("ui/statusReflector/setReady");
            } catch (err) {
                this.$store.commit("ui/statusReflector/setError", err);
            }
        }
    }
}
</script>

<style scoped>
header {
    margin: 0 1rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
}

.update-button {
    display: block;
    width: 24px;
    height: 24px;
    background-image: url("/src/assets/icons/update-gray.svg");
    background-size: 100%;
    cursor: pointer;
}

.update-button:hover {
    background-image: url("/src/assets/icons/update-purple.svg");
}

.user-corner {
    padding: 0.5rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    cursor: pointer;
}

.user-corner .user-name {
    margin-right: 0.5rem;
    padding: 0.5rem;
    background-color: white;
    color: rgba(0, 0, 0, 0.85);
    border-radius: 5px;
}

.user-corner:hover .user-name {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.9);
}

.user-corner img {
    display: block;
    width: 48px;
    height: 48px;
    background-color: white;
    border: 2px solid white;
    border-radius: 50%;
}

.user-corner:hover img {
    border: 2px solid rgb(126, 87, 194);
}
</style>
