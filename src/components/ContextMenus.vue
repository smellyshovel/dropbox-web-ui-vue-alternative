<template>
    <vccm-overlay
        class="overlay"
        :penetrable="true"
    >
        <context-menu
            id="cm-test"
        >
            <cm-item v-context-menu="'#cm-test-mult'">Download</cm-item>
            <cm-item>Delete</cm-item>
        </context-menu>

        <context-menu
            id="cm-test-mult"
        >
            <cm-item>Download</cm-item>
            <cm-item>Delete</cm-item>
            <cm-item>This one is only vesible when multiple items are selected</cm-item>
        </context-menu>
    </vccm-overlay>
</template>

<script>
export default {
    methods: {
        test() {
            console.log("DUCK!!!!");
        }
    }
}
</script>

<style scoped>
.cm {
    background-color: #f2f2f2;
}
</style>
