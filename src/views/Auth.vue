<template>
    <div>Authenticating... You will be automatically redirected.</div>
</template>

<script>
export default {
    async created() {
        let resp = this.$route.hash.replace(/#/, "");

        let params = resp.split("&").reduce((acc, pair) => {
            let keyValuePair = pair.split("=");
            acc[keyValuePair[0]] = keyValuePair[1];
            return acc;
        }, {});

        const redirect = (message) => {
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
            redirect(decodeURIComponent(params.error_description).replace(/\+/g, " "));
        } else if ("access_token" in params) {
            try {
                await this.$store.dispatch("cloud/connect", params.access_token);
                this.$router.replace({ name: "fm" });
            } catch (err) {
                redirect(err.message);
            }
        } else {
            redirect("No token provided");
        }
    }
}
</script>
