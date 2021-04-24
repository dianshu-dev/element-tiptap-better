<template>
  <div v-if="quickInsertVisible" class="quick-insert-wrap">
    Todo
  </div>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      default: null,
    },
  },
  data () {
    return {

    };
  },
  computed: {
    quickInsertVisible () {
      return this.editor.options.quickInsertVisible;
    }
  },
  created () {
    console.log(this.editor, 'created.....');
  },
};
</script>

<style scoped>
.quick-insert-wrap {
  position: absolute;
  left: 0;
  top: 0;
  width: 100px;
  height: 200px;
  border: 1px solid #e4e4e4;
  border-radius: 5px;
  background: white;
  z-index: 1000000;
}
</style>
