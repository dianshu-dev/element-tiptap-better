export default {
  inject: ['colorRoot'],
  methods: {
    __confirm (val) {
      this.colorRoot._change(val);
    },
  }
};
