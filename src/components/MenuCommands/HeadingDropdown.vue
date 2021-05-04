<template>
  <el-dropdown
    placement="bottom"
    trigger="click"
    style="vertical-align: middle;"
    @command="i => i > 0
      ? editorContext.commands.heading({ level: i })
      : editorContext.commands.paragraph()
    "
  >
    <el-tooltip effect="dark" :content="et.t('editor.extensions.Heading.tooltip')" :enterable="false" placement="top">
      <div class="heading_menu_btn">
        <span class="heading_name" :title="heading">{{heading}}</span>
        <i class="el-icon-caret-bottom" style="margin-left: 2px; color: #bbb"></i>
      </div>
    </el-tooltip>

    <el-dropdown-menu
      slot="dropdown"
      class="el-tiptap-dropdown-menu"
    >
      <el-dropdown-item
        :command="0"
        :class="{
          'el-tiptap-dropdown-menu__item--active': editorContext.isActive.paragraph(),
        }"
        class="el-tiptap-dropdown-menu__item"
      >
        <span>{{ et.t('editor.extensions.Heading.buttons.paragraph') }}</span>
      </el-dropdown-item>
      <el-dropdown-item
        v-for="i in level"
        :key="i"
        :command="i"
        :class="{
          'el-tiptap-dropdown-menu__item--active': isHeadingActive(i),
        }"
        class="el-tiptap-dropdown-menu__item"
      >
        <component
          :is="'h' +i"
          data-item-type="heading"
        >
          {{ et.t('editor.extensions.Heading.buttons.heading') }} {{ i }}
        </component>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue } from 'vue-property-decorator';
import { MenuData } from 'tiptap';
import { Dropdown, DropdownMenu, DropdownItem, Tooltip } from 'element-ui';
import { isHeadingActive, findHeading } from '@/utils/heading';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Tooltip.name]: Tooltip,
    CommandButton,
  },
})
export default class HeadingDropdown extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Inject() readonly et!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private get level () {
    return this.editor.extensions.options.heading.level;
  }

  private get heading () {
    const heading = findHeading(this.editor.state);
    if (heading && heading.node && heading.node.attrs) {
      return this.et.t('editor.extensions.Heading.buttons.heading') + heading.node.attrs.level;
    } else {
      return this.et.t('editor.extensions.Heading.buttons.paragraph');
    }
  }

  private isHeadingActive (level: number): boolean {
    return isHeadingActive(this.editor.state, level);
  }
};
</script>

<style scoped>
  .heading_menu_btn {
    width: 70px;
    height: 29px;
    /*margin: 1px;*/
    padding: 0 2px 0 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  .heading_menu_btn:hover {
    background: #e4e9f2;
  }
  .heading_name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
</style>
