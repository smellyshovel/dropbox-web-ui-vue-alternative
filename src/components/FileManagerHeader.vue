<template>
    <header>
        <div
            @click="update"
            class="update-button"
        />

        <div
            @click="openDropdown"
            class="user-corner"
        >
            <span class="user-name">{{ userName }}</span>
            <img :src="userPhoto">

            <div
                v-if="showDropdown"
                @mouseleave="closeDropdown"
                class="dropdown-menu"
            >
                <span
                    class="email"
                    v-html="userEmail"
                />
                <span
                    @click="quit"
                    class="option"
                >Quit</span>
            </div>
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
        },

        userEmail() {
            return this.$store.state.cloud.accountInfo.email;
        }
    },

    data() {
        return {
            showDropdown: false
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
        },

        openDropdown() {
            this.showDropdown = true;
        },

        closeDropdown() {
            this.showDropdown = false;
        },

        quit() {
            if (!confirm("Are you sure you want to quit?")) return;

            this.$store.dispatch("cloud/disconnect");

            this.$router.push({
                name: "home",
                params: {
                    redirected: true,
                    redirectionDetails: {
                        type: "success",
                        message: "Successfully quit"
                    }
                }
            });
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

.dropdown-menu {
    padding: 0.5rem;
    position: absolute;
    top: 69px;
    right: 1rem;
    display: flex;
    flex-flow: column;
    min-width: 200px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0px 0px 5px #bdbdbd;
    cursor: default;
}

.dropdown-menu .option {
    box-sizing: border-box;
    padding: 0.5rem;
    display: block;
    width: 100%;
    color: rgba(0, 0, 0, 0.85);
    border-radius: 2.5px;
    cursor: pointer;
}

.dropdown-menu .option:hover {
    background-color: #f2f2f2;
}

.email {
    padding: 0.25rem;
    display: block;
    color: rgba(0, 0, 0, 0.65);
    font-size: 0.8rem;
    text-align: center;
}

.email:hover {
    background-color: white;
}
</style>
