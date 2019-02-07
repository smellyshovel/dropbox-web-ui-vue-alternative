import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import files from "./modules/files.js";

export default new Vuex.Store({
    modules: {
        files
    }
});
