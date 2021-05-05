<template>
  <el-tooltip v-if="isActive" effect="dark" :content="tooltip" :enterable="false" placement="top">
    <color-picker v-model="color" :last-color="lastColor" @change="confirmColor">
      <div>
        <div class="color_icon" style="margin: 3px 0 1px">
          <v-icon :name="icon"/>
        </div>
        <div class="color_block" :style="{background: lastColor || '#000000'}"></div>
      </div>
    </color-picker>
  </el-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Watch, Emit, Vue, Inject } from 'vue-property-decorator';
import { Tooltip } from 'element-ui';
import ColorPicker from '../ColorPicker/index.vue';
import Icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/fill-drip';

@Component({
  components: {
    [Tooltip.name]: Tooltip,
    ColorPicker,
    'v-icon': Icon,
  },
})
export default class FillColorPicker extends Vue {
  @Prop({
    type: Array,
    default: () => [],
  })
  readonly colorSet!: string[];

  @Prop({
    type: Boolean,
    default: false,
  })
  readonly isActive!: boolean;

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
    default: '',
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
    console.log(color, 9988766);
    this.color = color;
  }

  @Emit('confirm')
  confirmColor (color: string): string {
    return color !== '#000000' ? color : '';
  }
};
</script>
