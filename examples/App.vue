<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  background-color: #fff;
  height: 100%;
  width: 100%;
}

#app {
  display: flex;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}

::-webkit-scrollbar-thumb {
  min-width: 10px;
  min-height: 10px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid white;
  border-radius: 6px;
}

*:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.24);
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>
