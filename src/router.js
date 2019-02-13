import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import FileManager from "./views/FileManager/FileManager.vue";

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
    let newPath = decodeURIComponent(to.path);

    if (to.fullPath !== newPath) {
        next({ path: newPath, replace: true });
    } else {
        next();
    }
});

export default router;
