<template>
<modal-window @close="reject">
    <template v-slot:header>
        <div class="header">
            <span class="headline">A conflict occurred</span>
            <span class="sub">Please, choose what to do</span>
        </div>
    </template>

    <div class="main-wrapper">
        <p>
            There is already a {{ conflict.target.type }} in the destination folder named <strong>{{ conflict.target.name }}</strong>.
            Please, pick an appropriate resolution strategy below
        </p>

        <input
            id="strategy-autorename"
            type="radio"
            v-model="resolutionStrategy"
            value="autorename"
        >
        <label for="strategy-autorename">
            <span class="option">Autorename</span>
            <span class="hint">The {{ conflict.source.type }} would be saved under a different name</span>
        </label>

        <input
            id="strategy-skip"
            type="radio"
            v-model="resolutionStrategy"
            value="skip"
        >
        <label for="strategy-skip">
            <span class="option">Skip</span>
            <span class="hint">The {{ conflict.source.type }} would remain untouched</span>
        </label>

        <template v-if="this.remainingConflictsNumber >= 1 && this.resolutionStrategy">
            <input
                id="same-for-the-rest"
                type="checkbox"
                v-model="sameForTheRest"
                :value="true"
            >
            <label for="same-for-the-rest">
                Apply the same for the rest <strong>{{ this.remainingConflictsNumber }}</strong> conflicts
            </label>
        </template>
    </div>

    <template v-slot:footer>
        <div class="footer">
            <button
                @click="reject"
                class="cancel"
            >
                Cancel
            </button>

            <template v-if="resolutionStrategy">
                <button
                    @click="resolve"
                    class="accept"
                    v-html="acceptButtonText"
                />
            </template>
            <template v-else>
                <button
                    class="accept"
                    disabled
                >
                    CHOOSE SOMETHING
                </button>
            </template>
        </div>
    </template>
</modal-window>
</template>

<script>
import ModalWindow from "@/components/ModalWindow.vue";

import { mapState, mapActions } from "vuex";

export default {
    components: {
        ModalWindow
    },

    computed: {
        ...mapState("ui/conflictResolver", [
            "conflict",
            "remainingConflictsNumber"
        ]),

        resolutionStrategy: {
            get() {
                return this.$store.state.ui.conflictResolver.resolutionStrategy;
            },

            set(value) {
                this.$store.dispatch("ui/conflictResolver/changeStrategy", value);
            }
        },

        sameForTheRest: {
            get() {
                return this.$store.state.ui.conflictResolver.sameForTheRest;
            },

            set(value) {
                this.$store.dispatch("ui/conflictResolver/changeSameForTheRest", value);
            }
        },

        acceptButtonText() {
            let postfix = this.sameForTheRest ? ` (${ this.remainingConflictsNumber + 1 })` : "";
            return `<strong>${ this.resolutionStrategy }</strong> the ${ this.conflict.source.type }${postfix}`;
        }
    },

    methods: {
        ...mapActions("ui/conflictResolver", [
            "resolve",
            "reject"
        ])
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

.header .sub {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.65);
}

.main-wrapper {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
}

p {
    width: 100%;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
}

input {
    display: none;
}

label {
    box-sizing: border-box;
    margin-bottom: 0.5rem;
    padding: 1rem;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.85);
    border: 2px solid #bdbdbd;
    border-radius: 5px;
}

label:hover {
    border: 2px solid rgb(126, 87, 194);
}

input:checked + label {
    background-color: rgb(126, 87, 194);
    color: rgba(255, 255, 255, 0.9);
    border: 2px solid rgb(126, 87, 194);
}

label[for="same-for-the-rest"] {
    display: block;
    text-align: center;
    padding: 0.5rem;
    background-color: white;
    border: 2px solid #bdbdbd;
}

label[for="same-for-the-rest"]:hover {
    border: 2px solid #424242;
}

input:checked + label[for="same-for-the-rest"] {
    background-color: #424242;
    border: 2px solid #424242;
}

.option {
    font-size: 1.2rem;
}

.hint {
    opacity: 0.85;
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
    background-color: white;
    color: #d2d2d2;
    border-color: #f2f2f2;
    cursor: not-allowed;
}

</style>
