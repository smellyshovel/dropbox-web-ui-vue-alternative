import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import files from "./modules/files.js";
import selections from "./modules/selections.js";

export default new Vuex.Store({
    modules: {
        files,
        selections
    }
});
