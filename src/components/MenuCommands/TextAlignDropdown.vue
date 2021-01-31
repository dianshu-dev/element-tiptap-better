<template>
  <el-dropdown
    placement="bottom"
    trigger="click"
    style="vertical-align: middle;"
    @command="toggleTextAlign">

    <el-tooltip effect="dark" :content="et.t('editor.extensions.TextAlign.tooltip')" placement="top">
      <div class="text_align_menu_btn">
        <v-icon :name="`align-${activeTextAlign}`"/>
        <i class="el-icon-caret-bottom" style="margin-left: 3px; color: #bbb"></i>
      </div>
    </el-tooltip>

    <el-dropdown-menu
      slot="dropdown"
      class="el-tiptap-dropdown-menu">
      <el-dropdown-item
        v-for="name in alignments"
        :key="name"
        :command="name"
        :class="{ 'el-tiptap-dropdown-menu__item--active': name === activeTextAlign }"
        class="el-tiptap-dropdown-menu__item">
        <v-icon :name="`align-${name}`"/>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue } from 'vue-property-decorator';
import { MenuData } from 'tiptap';
import { Dropdown, DropdownMenu, DropdownItem, Tooltip } from 'element-ui';
import { findTextAlign } from '@/utils/text_align';

import Icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/align-left';
import 'vue-awesome/icons/align-center';
import 'vue-awesome/icons/align-right';
import 'vue-awesome/icons/align-justify';

@Component({
  components: {
    'v-icon': Icon,
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Tooltip.name]: Tooltip,
  },
})

export default class TextAlignDropdown extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Inject() readonly et!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private get alignments () {
    return this.editor.extensions.options.text_align.alignments;
  }

  private get activeTextAlign (): string {
    return findTextAlign(this.editor.state);
  }

  private toggleTextAlign (name: string) {
    this.editorContext.commands[`align_${name}`]();
  }
};
</script>

<style scoped>
  .text_align_menu_btn {
    height: 29px;
    /*margin: 1px;*/
    padding: 0 4px 0 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }

  .text_align_menu_btn:hover {
    background: #e4e9f2;
  }

  .text_align_menu_btn .text_align_name {
    max-width: 100px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
  }

  .text_align_menu_btn .fa-icon {
    width: auto;
    height: 1em;
    max-width: 100%;
    max-height: 100%;
  }
</style>
