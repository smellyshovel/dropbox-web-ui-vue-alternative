import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import cloud from "./modules/cloud.js";
import ui from "./modules/ui.js";

export default new Vuex.Store({
    modules: {
        cloud,
        ui
    }
});
