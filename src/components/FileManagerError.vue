<template>
<div class="error">
    <h1>A Fatal Error:</h1>
    <p v-html="error.message"></p>
</div>
</template>

<script>
export default {
    props: {
        error: {
            type: Error,
            required: true
        }
    }
}
</script>

<style scoped>
.error {
    background-color: #cc0050;
    color: #fff;
}
</style>
