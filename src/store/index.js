import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import DROPBOX_MODULE from "./modules/dropbox.js";

export default new Vuex.Store({
    modules: {
        dropbox: DROPBOX_MODULE
    }
});
