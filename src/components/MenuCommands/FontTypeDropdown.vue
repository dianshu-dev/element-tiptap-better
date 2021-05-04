<template>
  <el-dropdown
    placement="bottom"
    trigger="click"
    style="vertical-align: middle;"
    @command="toggleFontType"
  >

    <el-tooltip effect="dark" :content="et.t('editor.extensions.FontType.tooltip')" :enterable="false" placement="top">
      <div class="font_type_menu_btn">
        <span class="font_type_name" :title="activeFontType">
          {{activeFontType || this.et.t('editor.extensions.FontType.default')}}
        </span>
        <i class="el-icon-caret-bottom" style="margin-left: 2px; color: #bbb"></i>
      </div>
    </el-tooltip>

    <el-dropdown-menu
      slot="dropdown"
      class="el-tiptap-dropdown-menu"
    >
      <el-dropdown-item
        v-for="item in fontTypes"
        :key="item.value"
        :command="item.value"
        :class="{
          'el-tiptap-dropdown-menu__item--active': item.value === activeFontType,
        }"
        class="el-tiptap-dropdown-menu__item"
      >
        <span
          :data-font="item.value"
          :style="{ 'font-family': item.value }"
        >{{ item.label }}</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue } from 'vue-property-decorator';
import { MenuData } from 'tiptap';
import { Dropdown, DropdownMenu, DropdownItem, Tooltip } from 'element-ui';
import { DEFAULT_FONT_TYPE_MAP, findActiveFontType } from '@/utils/font_type';
import { isPlainObject } from '@/utils/shared';
import Logger from '@/utils/logger';

@Component({
  components: {
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Tooltip.name]: Tooltip,
  },
})
export default class FontTypeDropdown extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Inject() readonly et!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private get fontTypes () {
    const { fontTypes } = this.editor.extensions.options.font_type;

    if (!isPlainObject(fontTypes)) {
      Logger.error('\'fontTypes\' should be an object');
      return DEFAULT_FONT_TYPE_MAP;
    }
    const defaultFont = {
      label: '默认字体',
      value: '',
    };
    return { defaultFont, ...fontTypes };
  }

  private get activeFontType (): string {
    return findActiveFontType(this.editor.state);
  }

  private toggleFontType (name: string) {
    console.log('toggleFontType', name, this.activeFontType);
    if (name === this.activeFontType) {
      this.editorContext.commands.font_type('');
    } else {
      this.editorContext.commands.font_type(name);
    }
  }
};
</script>

<style scoped>
  .font_type_menu_btn {
    width: 82px;
    height: 29px;
    /*margin: 1px;*/
    padding: 0 4px 0 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  .font_type_menu_btn:hover {
    background: #e4e9f2;
  }
  .font_type_name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
</style>
