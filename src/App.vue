<template>
    <div id="app">
        <router-view></router-view>
        <context-menus ref="vccm-context-menus" />
    </div>
</template>

<script>
import ContextMenus from "@/components/ContextMenus.vue";

export default {
    components: {
        ContextMenus
    }
}
</script>

<style>
body {
    margin: 0;
    padding: 0;
    font-family: Helvetica;
}
</style>
