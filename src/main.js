import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store/";

Vue.config.productionTip = false;

import VCCM from "vue-custom-context-menu";
Vue.use(VCCM);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
