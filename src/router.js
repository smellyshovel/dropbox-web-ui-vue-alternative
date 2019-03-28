import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import Home from "./views/Home.vue";
import Auth from "./views/Auth.vue";
import FileManager from "./views/FileManager.vue";

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "",
            name: "home",
            component: Home
        },

        {
            path: "/auth",
            name: "auth",
            component: Auth
        },

        {
            path: "/fm/:folderLink*",
            name: "fm",
            component: FileManager
        }
    ]
});

router.beforeEach((to, from, next) => {
    let newFullPath = decodeURIComponent(to.fullPath);

    if (to.fullPath !== newFullPath) {
        next(newFullPath);
    } else {
        next();
    }
});

export default router;
