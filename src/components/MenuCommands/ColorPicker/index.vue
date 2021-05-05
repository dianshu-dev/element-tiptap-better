<template>
  <div class="el-tiptap-color-picker">
    <div class="color_btn_wrap">
      <div class="color_btn" @mousedown.prevent @click="_change(lastColor)">
        <slot></slot>
      </div>

      <el-popover
        v-model="showPanel"
        :trigger="trigger"
        placement="bottom"
        popper-class="el-tiptap-popper">
        <div>
          <div class="x-color-picker__clear" @click.stop="_change('')">清除颜色</div>
          <theme-color></theme-color>
          <standard-color></standard-color>
          <more-color></more-color>
        </div>

        <div slot="reference" class="color_more_btn" @mousedown.prevent>
          <i class="el-icon-caret-bottom" style="color: #bbb"></i>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { Popover } from 'element-ui';
import ThemeColor from './ThemeColor';
import StandardColor from './StandardColor';
import MoreColor from './MoreColor';

export default {
  provide () {
    return {
      colorRoot: this,
    };
  },
  components: {
    [Popover.name]: Popover,
    ThemeColor,
    StandardColor,
    MoreColor,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    lastColor: {
      type: String,
      default: '',
    },
    trigger: {
      type: String,
      default: 'click',
    },
  },
  data () {
    return {
      showPanel: false,
    };
  },
  methods: {
    _change (val) {
      this.showPanel = false;
      this.$emit('input', val);
      this.$emit('change', val);
    },
  },
};
</script>

<style lang="scss">
  .el-tiptap-color-picker {
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
          height: 15px;
          line-height: 15px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin: 0 auto;
        }

        .color_block {
          width: 16px;
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

  .x-color-picker__wrapper {
    li {
      list-style: none;
      box-sizing: border-box;
    }
    &:not(:first-of-type) {
      margin-top: 10px;
    }
  }

  .x-color-picker__title {
    margin: 0;
    font-size: 14px;
    text-align: left;
    user-select: none;
    color: #555;
  }

  .x-color-picker__list {
    margin: 0;
    padding: 0;
  }

  .x-color-picker__children {
    display: flex;
    margin: 0;
    padding: 0;
  }

  .x-color-picker__children-item {
    width: 20px;
    height: 20px;
    margin: 2px 2px 0 0;
    border: 1px solid transparent;
    padding: 1px;
    cursor: pointer;
  }

  .x-color-picker__children-block {
    width: 100%;
    height: 100%;
  }

  .x-color-picker__clear {
    width: 100%;
    line-height: 22px;
    border: 1px solid #e4e4e4;
    font-size: 14px;
    text-align: center;
    cursor: pointer;

    &:hover {
      background: #f5f6f7;
    }
  }
</style>
