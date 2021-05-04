<template>
  <el-dropdown
    placement="bottom"
    trigger="click"
    style="vertical-align: middle;"
    @command="toggleFontSize">

    <el-tooltip effect="dark" :content="et.t('editor.extensions.FontSize.tooltip')" :enterable="false" placement="top">
      <div class="font_size_menu_btn">
        <span style="font-size: 15px;font-weight: 500">{{activeFontSize}}</span>
        <i class="el-icon-caret-bottom" style="margin-left: 3px; color: #bbb"></i>
      </div>
    </el-tooltip>

    <el-dropdown-menu
      slot="dropdown"
      class="el-tiptap-dropdown-menu"
      style="width: 80px; max-height: 300px; overflow-y: auto">

      <el-dropdown-item
        v-for="fontSize in fontSizes"
        :key="fontSize"
        :command="fontSize"
        :class="{'el-tiptap-dropdown-menu__item--active': fontSize === activeFontSize}"
        class="el-tiptap-dropdown-menu__item">
        <span :data-font-size="fontSize">{{ fontSize }}</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue } from 'vue-property-decorator';
import { MenuData } from 'tiptap';
import { Dropdown, DropdownMenu, DropdownItem, Tooltip } from 'element-ui';
import { DEFAULT_FONT_SIZE, findActiveFontSize } from '@/utils/font_size';

@Component({
  components: {
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Tooltip.name]: Tooltip,
  },
})
export default class FontSizeDropdown extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  defaultSize = DEFAULT_FONT_SIZE;

  @Inject() readonly et!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private get fontSizes () {
    return this.editor.extensions.options.font_size.fontSizes;
  }

  private get activeFontSize (): string {
    const value = findActiveFontSize(this.editor.state);
    return value !== 'default' ? value : '11';
  }

  private toggleFontSize (size: string) {
    if (size === this.activeFontSize) {
      this.editorContext.commands.font_size(DEFAULT_FONT_SIZE);
    } else {
      this.editorContext.commands.font_size(size);
    }
  }
};
</script>

<style scoped>
  .font_size_menu_btn {
    width: 44px;
    height: 29px;
    /*margin: 1px;*/
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  .font_size_menu_btn:hover {
    background: #e4e9f2;
  }
</style>
