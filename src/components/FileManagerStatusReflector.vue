<template>
    <div
        class="status-bar"
        :class="status"
    >
        <span
            @click="clear"
            v-if="state"
            class="state"
            v-html="state"
        />
        <span
            @click="clear"
            v-if="state"
            class="state-hint"
        >
            <em>(click to close)</em>
        </span>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
    computed: {
        ...mapState("ui/statusReflector", [
            "status",
            "state"
        ])
    },

    methods: {
        ...mapMutations("ui/statusReflector", [
            "clear"
        ])
    }
}
</script>

<style scoped>
.status-bar {
    display: flex;
    flex-flow: column;
    align-items: center;
    width: 100%;
    min-height: 5px;
}

.status-bar.ready {
    background-color: rgb(39, 193, 93);
}

@-webkit-keyframes wave {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
}
@-moz-keyframes wave {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
}
@keyframes wave {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
}

.status-bar.in-progress {
    -webkit-animation: wave 1s ease infinite;
    -moz-animation: wave 1s ease infinite;
    animation: wave 1s ease infinite;

    background: linear-gradient(270deg, rgb(39, 193, 93), rgb(126, 87, 194));
    background-size: 200% 200%;
}

.status-bar.error {
    background-color: rgb(204, 69, 69);
}

.state, .state-hint {
    padding: 0.5rem;
    width: 80%;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    cursor: pointer;
}

.state-hint {
    padding-top: 0;
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.8rem;
}

/deep/ a {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}

/deep/ a:hover {
    color: white;
    border-color: white;
}
</style>
