<template>
<div id="error-screen">
    <div class="container">
        <h1>A Fatal Error</h1>
        <p v-html="error.message" class="test"></p>
    </div>
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
#error-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-color: rgb(204, 69, 69);
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

/deep/ p a {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}

/deep/ p a:hover {
    color: white;
    border-color: white;
}
</style>
