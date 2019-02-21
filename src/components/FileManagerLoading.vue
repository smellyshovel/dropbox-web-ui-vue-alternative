<template>
<div class="loading">
    <h1>Loading...</h1>
    <p>{{ status }}</p>
</div>
</template>

<script>
export default {
    props: {
        status: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
.loading {
    background-color: #007dff;
    color: #fff;
}
</style>
