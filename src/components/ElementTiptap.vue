<template>
  <div
    v-if="editor"
    ref="editorWrap"
    :style="elTiptapEditorStyle"
    :class="[{
      'el-tiptap-editor': true,
      'el-tiptap-editor--mobile': isMobile,
      'el-tiptap-editor--fullscreen': isFullscreen,
    }, editorClass]"
  >

    <menu-bar
      v-if="showMenubar"
      :editor="editor"
      :class="[{
        'border-top-radius': showMenubar,
      }, editorMenubarClass]"
    >
      <template
        v-if="$scopedSlots.menubar"
        v-slot="slotProps"
      >
        <slot
          name="menubar"
          v-bind="slotProps"
        />
      </template>
    </menu-bar>

    <div
      ref="editorContentWrap"
      :class="[{
      'el-tiptap-editor__zoom-wrap': true,
      'el-tiptap-editor__auto': !widthMode,
      'border-top-radius': !showMenubar,
      'border-bottom-radius': !showFooter,
      }, editorContentClass]">

      <quick-insert-view v-if="quickInsertVisible" :editor="editor"></quick-insert-view>

      <menu-bubble
        :editor="editor"
        :menuBubbleOptions="menuBubbleOptions"
        :class="editorBubbleMenuClass"
      />

      <div
        :class="{'el-tiptap-editor__zoom': true}"
        :style="{width: zoomWidth, minHeight: zoomHeight, left: zoomLeft}">
        <editor-content
          ref="editorContent"
          class="el-tiptap-editor__content"
          :style="{zoom: `${zoom/100}`, width: !widthMode ? '100%' : widthMode === 1 ? '794px' : '1123px'}"
          :editor="editor"
        />
      </div>
    </div>

    <slot
      name="footer"
      :editor="editor"
    >
      <div
        v-if="!isMobile && showFooter"
        :class="[{
          'el-tiptap-editor__footer': true,
          'border-bottom-radius': showFooter,
        }, editorFooterClass]"
      >
        <div class="el-tiptap-editor__status">
          <span v-if="selectWords.word">{{ selectWords.word }}/</span>
          <span v-if="totalWords">{{ totalWords.word }} {{ t('editor.words') }}</span>

          <div class="width-mode" @click="changeWidthMode">{{widthModeOptions[widthMode]}}</div>
        </div>

        <div class="el-tiptap-editor__zoom-tool">
          <button @click="contentZoom('minus')">
            <i class="el-icon-minus"></i>
          </button>
          <div class="zoom-value" @click="contentZoom('reset')">{{zoom}}%</div>
          <button @click="contentZoom('plus')">
            <i class="el-icon-plus"></i>
          </button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Provide, Model, Mixins, Ref } from 'vue-property-decorator';
import { Editor, EditorContent, Extension, EditorUpdateEvent } from 'tiptap';
import { Placeholder } from 'tiptap-extensions';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import ContentAttributes from '@/extensions/content_attributes';
import Title from '@/extensions/title';
import { capitalize } from '@/utils/shared';
import wordsCount from '@/utils/words_count';
import { EVENTS } from '@/constants';
import EditorStylesMixin from '@/mixins/EditorStylesMixin';
import { Trans } from '@/i18n';

import MenuBar from './MenuBar/index.vue';
import MenuBubble from './MenuBubble/index.vue';
// @ts-ignore
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import QuickInsertView from '@/components/ExtensionViews/QuickInsertView.vue';

const COMMON_EMIT_EVENTS: EVENTS[] = [
  EVENTS.TRANSACTION,
  EVENTS.FOCUS,
  EVENTS.BLUR,
  EVENTS.PASTE,
  EVENTS.DROP,
];

@Component({
  components: {
    QuickInsertView,
    MenuBar,
    MenuBubble,
    EditorContent,
  },
  // fix @ProvideReactive
  // https://github.com/kaorun343/vue-property-decorator/issues/277#issuecomment-558594655
  inject: [],
})
export default class ElTiptap extends Mixins(EditorStylesMixin) {
  @Prop({
    type: Array,
    default: () => [],
  })
  readonly extensions!: any[];

  @Model('onUpdate', {
    default: '',
  })
  readonly content!: string | object;

  @Prop({
    type: String,
    default: '',
  })
  readonly placeholder!: string;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  readonly editorProperties!: Object;

  @Prop({
    type: String,
    default: 'html',
    validator (output): boolean {
      return ['html', 'json'].includes(output);
    },
  })
  readonly output!: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  readonly readonly!: boolean;

  @Prop({
    type: Boolean,
    default: undefined,
  })
  readonly spellcheck!: boolean | undefined;

  @Prop({
    type: Boolean,
    default: true,
  })
  readonly tooltip!: boolean;

  @Prop({
    type: String,
    default: undefined,
    validator: (lang) => {
      return Trans.isLangSupported(lang);
    },
  })
  readonly lang!: string;

  @Prop({
    type: [String, Array, Object],
    default: undefined,
  })
  readonly editorClass!: string | any[] | object;

  @Prop({
    type: [String, Array, Object],
    default: undefined,
  })
  readonly editorContentClass!: string | any[] | object;

  @Prop({
    type: [String, Array, Object],
    default: undefined,
  })
  readonly editorMenubarClass!: string | any[] | object;

  @Prop({
    type: [String, Array, Object],
    default: undefined,
  })
  readonly editorBubbleMenuClass!: string | any[] | object;

  @Prop({
    type: [String, Array, Object],
    default: undefined,
  })
  readonly editorFooterClass!: string | any[] | object;

  // TODO: popper.js
  @Prop({
    type: Object,
    default: () => ({}),
  })
  readonly menuBubbleOptions!: Object;

  @Ref('editorWrap') readonly editorWrapDom!: any;
  @Ref('editorContentWrap') readonly contentWrapDom!: any;
  @Ref('editorContent') readonly contentDom!: any;

  editor: Editor | null = null;
  emitAfterOnUpdate: boolean = false;
  isFullscreen: boolean = false;
  zoom: number = 100;
  zoomWidth: string = '794px';
  zoomHeight: string = '1123px';
  zoomLeft: string = 'unset';

  isMobile: boolean = !!navigator.userAgent.match(/iPhone|Android|Mobile/);
  widthMode: number = 0;
  widthModeOptions: object = { 0: '自适应宽度', 1: '标准宽度(A4)', 2: '超宽页面(A3)' };

  @Provide() get et (): ElTiptap {
    return this;
  };

  get quickInsertVisible (): any {
    if (!this.editor || !this.editor.options) return false;
    return this.editor.options.quickInsertVisible;
  }

  get selectWords (): any {
    const result = { word: 0, paragraph: 0, character: 0, all: 0 };
    if (!this.editor) return result;
    const selection = this.editor.state.selection;
    if (!selection || !selection.content) return result;
    const content: any = selection.content().content;
    this.getWordsCount(content, result);
    return result;
  }

  get totalWords (): any {
    const result = { word: 0, paragraph: 0, character: 0, all: 0 };
    if (!this.editor) return result;
    const content: any = this.editor.state.doc.content;
    this.getWordsCount(content, result);
    return result;
  }

  getWordsCount (content: any, result: any) {
    if (content.content && content.content.length) {
      content.content.forEach((item: any) => {
        const { word, paragraph, character, all } = wordsCount(item.textContent);
        result.word += word;
        result.paragraph += paragraph;
        result.character += character;
        result.all += all;
      });
    }
  }

  get showFooter (): boolean {
    return this.charCounterCount;
  }

  get spellcheckEnabled (): boolean {
    return this.spellcheck == null
      ? this.$elementTiptapPlugin
        ? this.$elementTiptapPlugin.spellcheck
        : true
      : this.spellcheck;
  }

  get i18nHandler (): Function {
    const lang = this.lang || this.$elementTiptapPlugin.lang;
    return Trans.buildI18nHandler(lang);
  }

  @Watch('content')
  onContentChange (val: string): void {
    if (this.emitAfterOnUpdate) {
      this.emitAfterOnUpdate = false;
      return;
    }

    if (this.editor) this.editor.setContent(val);
  }

  @Watch('readonly')
  onReadonlyChange (): void {
    if (this.editor) {
      this.editor.setOptions({
        editable: !this.readonly,
      });
    }
  }

  private mounted () {
    const widthMode = localStorage.getItem('editorWidthMode');
    if (!this.isMobile && widthMode !== null) {
      this.widthMode = Number(widthMode);
    }
    const extensions = this.generateExtensions();

    const eventOptions = COMMON_EMIT_EVENTS.reduce((prev, event) => {
      return {
        ...prev,
        [`on${capitalize(event)}`]: () => this.emitEvent.bind(this)(event),
      };
    }, {});

    this.editor = new Editor({
      ...this.editorProperties,
      editable: !this.readonly,
      useBuiltInExtensions: false,
      extensions,
      ...eventOptions,
      content: this.content,
      quickInsertVisible: false,
      addLinkVisible: false,
      onUpdate: this.onUpdate.bind(this),
      onPaste: this.onPaste.bind(this),
      onDrop: this.onDrop.bind(this),
    });

    this.$emit(this.genEvent(EVENTS.INIT), {
      editor: this.editor,
    });

    this.$nextTick(() => {
      addResizeListener(this.editorWrapDom, this.editorResize);
    });
  }

  private onPaste (...args: any) {
    this.$emit(this.genEvent(EVENTS.PASTE), ...args);
  }

  private onDrop (...args: any) {
    this.$emit(this.genEvent(EVENTS.DROP), ...args);
  }

  private beforeDestroy () {
    if (this.editorResize) {
      removeResizeListener(this.editorWrapDom, this.editorResize);
    }
    if (this.editor) this.editor.destroy();
  }

  private editorResize () {
    console.log('editor resize--------');
    this.setContentDomSize(this.zoom);
  }

  private contentZoom (type: string) {
    let zoom = 0;
    if (type === 'plus') {
      zoom = this.zoom + 10;
      if (zoom > 200) return;
    } else if (type === 'minus') {
      zoom = this.zoom - 10;
      if (zoom < 50) return;
    } else {
      zoom = 100;
    }
    this.setContentDomSize(zoom);
    this.$nextTick(() => {
      this.zoom = zoom;
    });
  }

  private setContentDomSize (zoom: number) {
    if (!this.contentWrapDom || !this.contentDom) return;
    const dom = this.contentDom.$el;
    const width = this.widthMode === 1 ? 794 * (zoom / 100) : 1123 * (zoom / 100);
    const height = dom.offsetHeight * (zoom / 100);
    const left = (this.contentWrapDom.offsetWidth - 14 - width) / 2;
    this.zoomLeft = left > 20 ? left - 20 + 'px' : '0';
    this.zoomWidth = width + 'px';
    this.zoomHeight = height + 'px';
  }

  changeWidthMode () {
    this.widthMode = this.widthMode >= 2 ? 0 : this.widthMode + 1;
    this.zoom = 100;
    if (!this.widthMode) {
      localStorage.removeItem('editorWidthMode');
    } else {
      this.contentZoom('reset');
      localStorage.setItem('editorWidthMode', String(this.widthMode));
    }
  }

  private generateExtensions (): Array<Extension> {
    const extensions: Extension[] = [...this.extensions];

    // spellcheck
    extensions.push(
      new ContentAttributes({
        spellcheck: this.spellcheckEnabled,
      }),
    );

    // placeholder
    extensions.push(this.initPlaceholderExtension());

    return extensions;
  }

  emitEvent (event: EVENTS) {
    this.$emit(this.genEvent(event), {
      editor: this.editor,
    });
  }

  onUpdate (options: EditorUpdateEvent) {
    this.emitAfterOnUpdate = true;

    let output;
    if (this.output === 'html') {
      output = options.getHTML();
    } else {
      output = JSON.stringify(options.getJSON());
    }

    this.$emit(this.genEvent(EVENTS.UPDATE), output, options);
  }

  // i18n
  t (...args: any[]): string {
    return this.i18nHandler.apply(this, args);
  }

  private genEvent (event: EVENTS) {
    return `on${capitalize(event)}`;
  }

  private getTitleExtension (): Title | null {
    const doc = this.extensions.find(e => e.name === 'doc');
    if (doc.options.title) {
      const title = this.extensions.find(e => e.name === 'title');
      if (title) return title;
    }
    return null;
  }

  private initPlaceholderExtension (): Placeholder {
    const title = this.getTitleExtension();
    if (title) {
      // @ts-ignore
      return new Placeholder({
        emptyEditorClass: 'el-tiptap-editor--empty',
        emptyNodeClass: 'el-tiptap-editor__with-title-placeholder',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
        // @ts-ignore
        emptyNodeText: (node: ProsemirrorNode) => {
          if (node.type.name === 'title') {
            return title.options.placeholder;
          }
          return this.placeholder;
        },
      });
    }
    return new Placeholder({
      emptyEditorClass: 'el-tiptap-editor--empty',
      emptyNodeClass: 'el-tiptap-editor__placeholder',
      emptyNodeText: this.placeholder,
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    });
  }
};
</script>

<style lang="scss">
@import '../styles/editor.scss';
@import '../styles/command_button.scss';
</style>
