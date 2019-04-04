export default {
    namespaced: true,

    state: {
        selected: [],
        lastSelected: null,
    },

    mutations: {
        SET(state, items) {
            state.selected = items;
        },

        ADD(state, items) {
            state.selected = state.selected.concat(items);
        },

        REMOVE(state, item) {
            let index = state.selected.indexOf(item);
            state.selected.splice(index, 1);
        },

        CLEAR(state) {
            state.selected = [];
        },

        UPDATE_LAST_SELECTED(state) {
            state.lastSelected = state.selected[state.selected.length - 1];
        },

        CLEAR_LAST_SELECTED(state) {
            state.lastSelected = null;
        }
    },

    actions: {
        setSingle({ commit }, item) {
            commit("SET", [item]);
            commit("UPDATE_LAST_SELECTED");
        },

        setRange(store, { target, bank }) {
            // find indecies of the first and the last items in the bank
            let lastSelectedIndex = bank.indexOf(store.state.lastSelected);
            let targetIndex = bank.indexOf(target);

            // or substitute with 0 if couldn't find
            if (lastSelectedIndex === -1) lastSelectedIndex = 0;
            if (lastSelectedIndex === -1) lastSelectedIndex = 0;

            // get an array of items to be selected based on the indecies
            let itemsToSelect = bank.slice(
                Math.min(lastSelectedIndex, targetIndex),
                Math.max(lastSelectedIndex, targetIndex) + 1
            );

            store.commit("SET", itemsToSelect);
        },

        toggle({ commit, getters }, item) {
            if (!getters.isSelected(item)) {
                commit("ADD", [item]);
            } else {
                commit("REMOVE", item);
            }

            commit("UPDATE_LAST_SELECTED");
        },

        clear({ commit }) {
            commit("CLEAR");
            commit("CLEAR_LAST_SELECTED");
        }
    },

    getters: {
        isSelected: (state) => (item) => {
            return state.selected.filter(selected => {
                return !selected.isDisabled;
            }).includes(item);
        },

        allSelected: (state) => {
            return state.selected.filter(selected => {
                return !selected.entry.isFake;
            })
        }
    }
};
