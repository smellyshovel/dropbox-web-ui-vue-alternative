export default {
    namespaced: true,

    state: {
        status: "ready",
        state: ""
    },

    mutations: {
        setReady(state, message) {
            state.status = "ready";
            state.state = message || "";
        },

        setInProgress(state, message) {
            state.status = "in-progress";
            state.state = message || "";
        },

        setError(state, message) {
            state.status = "error";
            state.state = message || "";
        },

        clear(state) {
            state.status = "ready";
            state.state = "";
        }
    },

    actions: {

    }
};
