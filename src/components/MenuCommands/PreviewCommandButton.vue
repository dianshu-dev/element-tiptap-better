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
      :visible.sync="previewDialogVisible"
      :modal="false"
      :fullscreen="true"
      :show-close="false"
      :append-to-body="true"
      :lock-scroll="true"
    >
      <div class="el-tiptap-editor__content el-tiptap-editor__preview">
        <div v-html="html" class="ProseMirror" :style="{ zoom: zoom }"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Inject, Vue } from 'vue-property-decorator';
import { Dialog } from 'element-ui';
import { MenuData } from 'tiptap';
import { PREVIEW_WINDOW_WIDTH } from '@/constants';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Dialog.name]: Dialog,
    CommandButton,
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

  html: string = '';
  previewDialogVisible: boolean = false;
  zoom: number = 1;

  @Watch('previewDialogVisible')
  onVisibleChange (visible: boolean) {
    if (visible) this.getHtml();
  }

  getHtml () {
    this.html = this.editorContext.editor.getHTML();
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
        this.zoom = this.zoom < 3 ? this.zoom + 0.5 : 3;
      } else if (e.keyCode === 189) {
        e.preventDefault();
        this.zoom = this.zoom > 1 ? this.zoom - 0.5 : 1;
      }
    }
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
