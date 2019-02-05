import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import FileManager from "./views/FileManager/FileManager.vue";

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/fm/:folderPath*",
            name: "folder",
            component: FileManager,
            props: ({ params }) => ({ folderPath: params.folderPath || "" })
        }
    ]
});
