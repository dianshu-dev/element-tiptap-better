<template>
  <editor-menu-bar
    v-slot="editorContext"
    :editor="editor">

    <slot v-bind="editorContext">
      <div
        ref="menuBarWrap"
        class="el-tiptap-editor__menu-bar">

        <div ref="defaultList" class="menu-default-list">
          <template v-for="(spec, i) in generateCommandButtons(editorContext, false)">
            <component
              v-if="spec.component.name !== 'MenuSplit'"
              :key="'command-button' + i"
              :is="spec.component"
              :enable-tooltip="et.tooltip"
              v-bind="spec.componentProps"
              :readonly="et.isCodeViewMode"
              v-on="spec.componentEvents"
            />
            <div v-else :key="'command-button' + i" class="el-tiptap-editor__menu-split">
              <div class="menu-split-line"></div>
            </div>
          </template>
        </div>

        <el-popover
          v-if="buttonSplit"
          v-model="showMore"
          :append-to-body="false"
          trigger="click"
          placement="bottom-end"
          :visible-arrow="false"
          popper-class="menu-more-list">

          <template v-for="(spec, i) in generateCommandButtons(editorContext, true)">
            <component
              v-if="spec.component.name !== 'MenuSplit'"
              :key="'command-button-more' + i"
              :is="spec.component"
              :enable-tooltip="et.tooltip"
              v-bind="spec.componentProps"
              :readonly="et.isCodeViewMode"
              v-on="spec.componentEvents"
            />
            <div v-else :key="'command-button-more' + i" class="el-tiptap-editor__menu-split">
              <div class="menu-split-line"></div>
            </div>
          </template>

          <div slot="reference" class="el-tiptap-editor__command-button">
            <div class="command-icon-wrap">
              <i class="el-icon-more"></i>
            </div>
          </div>
        </el-popover>

      </div>
    </slot>
  </editor-menu-bar>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Ref } from 'vue-property-decorator';
import { Editor, EditorMenuBar, MenuData } from 'tiptap';
import { MenuBtnViewType } from '@/../types';
import { Popover } from 'element-ui';
// @ts-ignore
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

@Component({
  components: {
    [Popover.name]: Popover,
    EditorMenuBar,
  },
})
export default class Menubar extends Vue {
  @Prop({
    type: Editor,
    required: true,
  })
  readonly editor!: Editor;

  buttonSplit: any = null;
  showMore: boolean = false;
  offsetArray: any[] = [];

  @Inject() readonly et!: any;

  @Ref('menuBarWrap') readonly menuBarWrapDom!: any;
  @Ref('defaultList') readonly defaultListDom!: any;

  private mounted (): void {
    this.$nextTick(() => {
      const listLeft = this.defaultListDom.offsetLeft;
      this.defaultListDom.children.forEach((item: any) => {
        this.offsetArray.push({ position: item.offsetLeft + item.offsetWidth - listLeft });
      });
      addResizeListener(this.menuBarWrapDom, this.menuResize);
    });
  }

  private beforeDestroy (): void {
    if (this.menuResize) {
      removeResizeListener(this.menuBarWrapDom, this.menuResize);
    }
  }

  private menuResize (): void {
    const menuBarWidth = this.menuBarWrapDom.offsetWidth;
    if (!menuBarWidth || !this.offsetArray.length) return;
    let index: any = null;
    for (let i = 0; i < this.offsetArray.length; i++) {
      const item = this.offsetArray[i];
      if (item.position >= menuBarWidth - 42) {
        index = i;
        break;
      }
    }
    this.buttonSplit = index;
  }

  private generateCommandButtons (editorContext: MenuData, isMore: boolean): MenuBtnViewType[] {
    const extensionManager = this.editor.extensions;
    const result = extensionManager.extensions.reduce <MenuBtnViewType[]>((acc, extension) => {
      if (extension.options.menubar === false) return acc;
      if (typeof extension.menuBtnView !== 'function') return acc;

      const menuBtnComponentSpec = extension.menuBtnView({
        ...editorContext,
        editor: this.editor,
        t: this.et.t, // i18n
      });
      if (Array.isArray(menuBtnComponentSpec)) {
        return [...acc, ...menuBtnComponentSpec];
      }
      return [...acc, menuBtnComponentSpec];
    }, []);
    if (isMore) {
      return this.buttonSplit !== null ? result.slice(this.buttonSplit) : [];
    } else {
      return this.buttonSplit !== null ? result.slice(0, this.buttonSplit) : result;
    }
  }
}
</script>
