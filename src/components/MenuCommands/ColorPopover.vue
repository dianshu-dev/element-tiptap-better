<template>
  <el-tooltip effect="dark" :content="tooltip" placement="top">
    <div class="el-tiptap-color-popover">
      <div class="color_btn_wrap">
        <div class="color_btn" @mousedown.prevent @click="confirmColor(lastColor)">
          <div>
            <div class="color_icon" style="background: #ddd">A</div>
            <div class="color_block" :style="{background: lastColor}"></div>
          </div>
        </div>
        <el-popover
          v-model="popoverVisible"
          :disabled="et.isCodeViewMode"
          placement="bottom"
          trigger="click"
          popper-class="el-tiptap-popper">

          <div class="color-set">
            <div
              v-for="color in colorSet"
              :key="color"
              class="color__wrapper">
              <div
                :style="{ backgroundColor: color }"
                :class="{ 'color--selected': selectedColor === color }"
                class="color"
                @mousedown.prevent
                @click.stop="confirmColor(color)">
              </div>
            </div>
            <div class="color__wrapper">
              <div
                class="color color--remove"
                @mousedown.prevent
                @click.stop="confirmColor('')">
              </div>
            </div>
          </div>

          <div class="color-hex">
            <input type="color" v-model="lastColor" @click.stop @change="confirmColor($event.target.value)"/>
          </div>

          <div class="color_more_btn" slot="reference">
            <i class="el-icon-caret-bottom" style="color: #bbb"></i>
          </div>
        </el-popover>
      </div>
    </div>
  </el-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Watch, Emit, Vue, Inject } from 'vue-property-decorator';
import { Button, Popover, Input, Tooltip } from 'element-ui';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Input.name]: Input,
    [Tooltip.name]: Tooltip,
    CommandButton,
  },
})
export default class ColorPopover extends Vue {
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
  private popoverVisible: boolean = false;

  @Inject() readonly et!: any;

  @Watch('selectedColor', {
    immediate: true,
  })
  onSelectedColorChange (color: string): void {
    this.color = color;
  }

  @Emit('confirm')
  confirmColor (color: string): string {
    this.popoverVisible = false;
    return color !== '#ffffff' ? color : '';
  }
};
</script>

<style lang="scss" scoped>
  .el-tiptap-color-popover {
    width: 44px;
    height: 29px;
    /*margin: 1px;*/
    display: inline-block;
    vertical-align: middle;
    border-radius: 4px;
    outline: none;

    &:hover {
      background: #e4e9f2;

      .color_btn_wrap .color_more_btn {
        border-left: 1px solid #ccc;
      }
    }

    .color_btn_wrap {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .color_btn {
        flex: 1;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #666;
        cursor: pointer;

        .color_icon {
          width: 15px;
          height: 14px;
          line-height: 15px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin: 1px auto 2px;
        }

        .color_block {
          width: 17px;
          height: 3px;
          margin: 0 auto;
        }
      }

      .color_more_btn {
        width: 16px;
        height: 29px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid transparent;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
      }
    }
  }
</style>
