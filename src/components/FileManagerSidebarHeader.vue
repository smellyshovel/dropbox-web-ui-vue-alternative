<template>
    <router-link :to="{ name: 'fm' }">
        <div class="contents">
            <span class="icon" />
            <span class="text">Home</span>
        </div>
    </router-link>
</template>

<script>
export default {
}
</script>

<style scoped>
a {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    text-decoration: none;
}

.contents {
    display: flex;
    justify-content: center;
    align-items: center;
}

.icon {
    margin-right: 0.5rem;
    display: block;
    width: 1.2rem;
    height: 1.2rem;
    background-image: url("/src/assets/icons/cloud-gray.svg");
    background-size: 1.2rem;
}

a:hover .icon {
    background-image: url("/src/assets/icons/cloud-purple.svg");
}

.text {
    padding: 0 0.25rem;
    color: rgba(0, 0, 0, 0.85);
    border-bottom: 2px solid #bdbdbd;
}

a:hover .text {
    border-bottom: 2px solid rgba(0, 0, 0, 0.85);
}
</style>
