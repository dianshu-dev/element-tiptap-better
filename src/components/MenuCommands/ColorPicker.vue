<template>
  <el-tooltip effect="dark" :content="tooltip" :enterable="false" placement="top">
    <font-color-picker v-model="color" :last-color="lastColor" @change="confirmColor"></font-color-picker>
  </el-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Watch, Emit, Vue, Inject } from 'vue-property-decorator';
import { Tooltip } from 'element-ui';
import FontColorPicker from './FontColorPicker/index.vue';

@Component({
  components: {
    [Tooltip.name]: Tooltip,
    FontColorPicker,
  },
})
export default class ColorPicker extends Vue {
  @Prop({
    type: Array,
    default: () => [],
  })
  readonly colorSet!: string[];

  @Prop({
    type: String,
    default: '',
  })
  readonly selectedColor!: string;

  @Prop({
    type: String,
    default: '',
  })
  readonly lastColor!: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly tooltip!: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly icon!: string;

  @Prop({
    type: String,
    default: 'OK',
  })
  readonly confirmText!: string; // TODO: i18n ?

  private color: string = '';

  @Inject() readonly et!: any;

  @Watch('selectedColor', {
    immediate: true,
  })
  onSelectedColorChange (color: string): void {
    this.color = color;
  }

  @Emit('confirm')
  confirmColor (color: string): string {
    return color !== '#000000' ? color : '';
  }
};
</script>
