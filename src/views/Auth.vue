<template>
    <div>Authenticating... You will be automatically redirected.</div>
</template>

<script>
export default {
    async created() {
        // parse the OAuth2 response (comes in the form of /auth#key1=val1&key2=val2)
        // and and handle it
        let resp = this.$route.hash.replace(/#/, "");

        let params = resp.split("&").reduce((acc, pair) => {
            acc[pair.split("=")[0]] = pair.split("=")[1];
            return acc;
        }, {});

        const redirectHome = (message) => {
            this.$router.replace({
                name: "home",
                params: {
                    redirected: true,
                    redirectionDetails: {
                        type: "error",
                        message: message
                    }
                }
            });
        };

        if ("error" in params) {
            redirectHome(decodeURIComponent(params.error_description).replace(/\+/g, " "));
        } else if ("access_token" in params) {
            try {
                await this.$store.dispatch("cloud/connect", params.access_token);
                this.$router.replace({ name: "fm" });
            } catch (err) {
                redirectHome(err.message);
            }
        } else {
            redirectHome("No token provided");
        }
    }
}
</script>
