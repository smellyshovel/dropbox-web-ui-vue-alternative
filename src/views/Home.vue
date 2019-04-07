<template>
    <div id="home">
        <div
            v-if="redirected"
            v-show="showRedirectionMessage"
            class="redirection-message"
            :class="[redirectionReason]"
            v-html="redirectionMessage"
        />

        <div class="centered-block">
            <template v-if="!isConnected()">
                <h1>Hello.</h1>
                <p>
                    Click the button below to securely connect your Dropbox account
                    via OAuth2 and start using the <strong>dropbox-web-ui-alternative</strong>.
                </p>

                <a href="https://www.dropbox.com/oauth2/authorize?client_id=8i7l6utem7a0g6t&response_type=token&redirect_uri=http://localhost:8080/auth">
                    <div class="main-button">
                        <div>
                            <span class="main">Connect to you Dropbox account</span>
                            <span class="sub">via OAuth2</span>
                        </div>
                    </div>
                </a>
            </template>

            <template v-else>
                <h1>Welcome back.</h1>

                <router-link :to="{ name: 'fm' }">
                    <div class="main-button">
                        <div>
                            <span class="main">Open the File Manager</span>
                            <span class="sub">and start browsing immediately</span>
                        </div>
                    </div>
                </router-link>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    created() {
        this.redirected = this.$route.params.redirected;
    },

    data() {
        return {
            redirected: false,
            showRedirectionMessage: true
        }
    },

    computed: {
        redirectionDetails() {
            return this.$route.params.redirectionDetails;
        },

        redirectionReason() {
            return this.redirectionDetails.type;
        },

        redirectionMessage() {
            return this.redirectionDetails.message;
        }
    },

    methods: {
        isConnected() {
            return this.$store.getters["cloud/connected"]();
        }
    }
}
</script>

<style scoped>
#home {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    font-family: Helvetica;
}


.centered-block {
    text-align: center;
    max-width: 80%;
}

.main-button {
    padding: 1rem;
    display: inline-block;
    background-color: rgb(13, 153, 218);
    border: 1px solid rgb(10, 137, 196);
    border-radius: 20px;
}

.main-button .main {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.5rem;
}

.main-button .sub {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
}

@keyframes fade {
    0% {
        visibility: visible;
        opacity: 1;
    }

    100% {
        visibility: hidden;
        opacity: 0;
    }
}

.redirection-message {
    animation: fade 1s ease 5s forwards;
    padding: 1rem;
    position: fixed;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    color: rgba(255, 255, 255, 0.9);
}

.redirection-message.success {
    background-color: rgb(39, 193, 93);
}

.redirection-message.error {
    background-color: #ff6666;
}

/deep/ .redirection-message a {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}

/deep/ .redirection-message a:hover {
    color: white;
    border-color: white;
}
</style>
