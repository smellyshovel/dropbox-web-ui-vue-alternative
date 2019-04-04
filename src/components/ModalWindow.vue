<template>
<div
    @click="$emit('close')"
    class="overlay"
>
    <div
        @click.stop
        class="modal"
    >
        <header>
            <div class="header-slot">
                <slot name="header"></slot>
            </div>
            <div
                @click="$emit('close')"
                class="close"
            />
        </header>
        <main>
            <slot></slot>
        </main>
        <footer>
            <slot name="footer"></slot>
        </footer>
    </div>
</div>
</template>

<script>
export default {

}
</script>

<style scoped>
.overlay  {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal {
    min-width: 50%;
    max-width: 500px;
    max-height: 80%;
    background-color: white;
    border-radius: 5px;
    overflow: auto;
}

header {
    padding: 1rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    background-color: #f2f2f2;
}

.header-slot {
    margin: 0 auto;
}

.close {
    padding: 0.25rem;
    display: block;
    width: 1rem;
    height: 1rem;
    background-image: url("/src/assets/icons/close-gray.svg");
    background-size: 1rem;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 2.5px;
    cursor: pointer;
}

.close:hover {
    background-color: white;
    background-image: url("/src/assets/icons/close-red.svg");
}

main {
    padding: 0 1rem;
    min-height: 200px;
}

footer {
    padding: 1rem;
    border-top: 1px solid #f2f2f2;
}
</style>
