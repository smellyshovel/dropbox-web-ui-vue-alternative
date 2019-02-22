import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import cloud from "./modules/cloud.js";
import selections from "./modules/selections.js";

export default new Vuex.Store({
    modules: {
        cloud,
        selections
    }
});
