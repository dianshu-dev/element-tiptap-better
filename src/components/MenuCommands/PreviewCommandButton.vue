<template>
  <div style="display: inline-block; vertical-align: middle;">
    <command-button
      :command="fullScreen"
      :enable-tooltip="et.tooltip"
      :tooltip="et.t('editor.extensions.Preview.tooltip')"
      :readonly="et.isCodeViewMode"
      icon="tv"
    />

    <el-dialog
      v-if="editor"
      :visible.sync="previewDialogVisible"
      :modal="false"
      :fullscreen="true"
      custom-class="el-tiptap-preview-dialog"
      :show-close="false"
      :append-to-body="true"
      :close-on-click-modal="false"
      :lock-scroll="true"
    >
      <div class="el-tiptap-editor__content el-tiptap-editor__preview">
        <editor-content :editor="editor" :style="{ zoom: zoom }"/>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Inject, Vue } from 'vue-property-decorator';
import { Dialog, Message } from 'element-ui';
import { MenuData, Editor, EditorContent } from 'tiptap';
import { PREVIEW_WINDOW_WIDTH } from '@/constants';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Dialog.name]: Dialog,
    CommandButton,
    EditorContent,
  },
})
export default class PreviewCommandButton extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Prop({
    type: String,
    default: PREVIEW_WINDOW_WIDTH,
  })
  readonly contentWidth!: string;

  @Inject() readonly et!: any;

  editor: any = null;
  previewDialogVisible: boolean = false;
  zoom: number = 1;
  extensions: any[] = [
    'title',
    'doc',
    'text',
    'paragraph',
    // text extension's
    'bold',
    'underline',
    'italic',
    'strike',
    'code',
    'font_type',
    'font_size',
    'text_color',
    'text_highlight',
    // paragraph extension's
    'heading',
    'list_item',
    'bullet_list',
    'ordered_list',
    'todo_item',
    'todo_list',
    'text_align',
    'line_height',
    'indent',
    'blockquote',
    'code_block',
    // rich and tools extension's
    'link',
    'image',
    'table',
    'table_header',
    'table_cell',
    'table_row',
    'iframe',
    'trailing_node',
    'horizontal_rule',
    'code_block_highlight',
  ];

  @Watch('previewDialogVisible')
  onVisibleChange (visible: boolean) {
    if (visible) {
      this.editor = new Editor({
        editable: false,
        useBuiltInExtensions: false,
        extensions: this.getExtensions(),
        content: this.getHtml(),
      });
    } else if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  getExtensions () {
    const extensions: any = [];
    this.editorContext.editor.extensions.extensions.forEach((item: any) => {
      if (this.extensions.includes(item.name)) extensions.push(item);
    });
    return extensions;
  }

  getHtml () {
    return this.editorContext.editor.getHTML();
  }

  fullscreenListener () {
    if (!this.previewDialogVisible) {
      this.previewDialogVisible = true;
    } else {
      this.previewDialogVisible = false;
      document.removeEventListener('fullscreenchange', this.fullscreenListener);
      document.removeEventListener('keydown', this.zoomListener);
    }
  }

  zoomListener (e: any) {
    if (e.metaKey || e.ctrlKey) {
      if (e.keyCode === 187) {
        e.preventDefault();
        this.zoom = this.zoom < 3 ? this.zoom + 0.25 : 3;
        this.message();
      } else if (e.keyCode === 189) {
        e.preventDefault();
        this.zoom = this.zoom > 0.25 ? this.zoom - 0.25 : 0.25;
        this.message();
      } else if (e.keyCode === 48) {
        e.preventDefault();
        this.zoom = 1;
        this.message();
      }
    }
  }

  message () {
    let text = '';
    if (this.zoom !== 1) {
      text += `${this.zoom > 1 ? '放大' : '缩小'}到 ${this.zoom} 倍`;
      text += this.zoom < 3 ? '' : ', 最大了哦';
      text += this.zoom > 0.25 ? '' : ', 最小了哦';
    } else {
      text = '默认大小';
    }
    Message.success(text);
  }

  // 全屏
  fullScreen () {
    document.addEventListener('fullscreenchange', this.fullscreenListener);
    document.addEventListener('keydown', this.zoomListener);
    const element: any = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }
}
</script>

<style lang="scss">
.el-tiptap-preview-dialog {
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
