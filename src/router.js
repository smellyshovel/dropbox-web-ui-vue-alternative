import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import FileManager from "./views/FileManager.vue";

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/fm/:folderLink*",
            name: "fm",
            component: FileManager,
            props: ({ params }) => ({ folderLink: params.folderLink || "" })
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
