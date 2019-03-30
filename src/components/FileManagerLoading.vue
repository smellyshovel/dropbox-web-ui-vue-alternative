<template>
<div id="loading-screen">
    <div class="container">
        <h1>Loading...</h1>
        <p>{{ loading }}</p>
    </div>
</div>
</template>

<script>
export default {
    props: {
        loading: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
#loading-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-color: rgb(126, 87, 194);
}

.container {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    max-width: 80%;
    height: 100vh;
}

h1 {
    color: rgba(255, 255, 255, 0.9);
}

p {
    text-align: center;
    color: rgba(255, 255, 255, 0.75);
}
</style>
