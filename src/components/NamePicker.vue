<template>
<modal-window @close="reject">
    <template v-slot:header>
        <div class="header">
            <span class="headline">{{ purpose }} a {{ entryType }}</span>
            <span
                class="sub"
                v-html="windowSubHeading"
            />
        </div>
    </template>

    <div class="main-wrapper">
        <p>Please, enter a new name below</p>

        <input
            @keypress.enter="resolve"
            autofocus
            type="text"
            v-model="newName"
        >
    </div>

    <template v-slot:footer>
        <div class="footer">
            <button
                @click="reject"
                class="cancel"
            >
                Cancel
            </button>

            <template v-if="!acceptButtonDisabledReason">
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
                    {{ acceptButtonDisabledReason }}
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
        ...mapState("ui/namePicker", [
            "purpose",
            "entryType",
            "currentName"
        ]),

        newName: {
            get() {
                return this.$store.state.ui.namePicker.newName;
            },

            set(value) {
                this.$store.dispatch("ui/namePicker/changeName", value);
            }
        },

        windowSubHeading() {
            if (this.purpose === "rename") {
                return `Renaming the "<strong>${ this.currentName }</strong>"`;
            } else if (this.purpose === "create") {
                return `Please, enter a name for the new ${ this.entryType }`;
            }
        },

        acceptButtonDisabledReason() {
            if (!this.newName.length) {
                return "ENTER A NAME";
            } else if (this.newName === this.currentName) {
                return "CHOOSE A DIFFERENT NAME";
            } else {
                return null;
            }
        },

        acceptButtonText() {
            if (this.purpose === "rename") {
                return `RENAME TO <strong>${ this.newName }</strong>`;
            }

        }
    },

    methods: {
        ...mapActions("ui/namePicker", [
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
    margin: auto;
    margin-top: 1rem;
    padding: 0.5rem;
    display: block;
    width: 80%;
    border: none;
    border-bottom: 2px solid #e2e2e2;
    outline: none;
    font-size: 1.2rem;
}

input:hover {
    border-bottom-color: #bdbdbd;
}

input:focus {
    border-bottom-color: rgb(126, 87, 194);
}

.folder-path {
    margin: 0.5rem;
}

.tree-view {
    width: 100%;
}

.header .sub {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.65);
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
    color: #d2d2d2;
    border-color: #f2f2f2;
}

</style>
