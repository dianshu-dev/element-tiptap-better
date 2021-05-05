<template>
  <div class="x-color-picker__wrapper">
    <p class="x-color-picker__title">更多颜色</p>
    <input type="color" :value="colorRoot.value" @change="_change" @click.stop/>
  </div>
</template>

<script>
import baseMixin from './mixins';

export default {
  name: 'XMoreColor',
  mixins: [baseMixin],
  methods: {
    _change (e) {
      this.__confirm(e.target.value);
    },
  },
};
</script>

<style scoped>

</style>
