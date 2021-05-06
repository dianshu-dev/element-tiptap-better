<template>
  <div class="el-tiptap-editor__wrapper">
    <el-tiptap
      :extensions="textExtensions"
      content="Text Extensions"
    />

    <el-tiptap
      :extensions="paragraphExtensions"
      content="Paragraph Extensions"
    />

    <el-tiptap
      :extensions="richAndToolsExtensions"
      placeholder="请输入内容"
      :content="content"
      style="height: 600px"
      lang="zh"
      @onInit="onInit"
    />
  </div>
</template>

<script>
import {
  Title,
  Doc,
  Text,
  Paragraph,
  // text extensions
  Bold,
  Underline,
  Italic,
  Strike,
  Code,
  FontType,
  FontSize,
  TextColor,
  TextHighlight,
  FormatClear,
  // paragraph extensions
  Heading,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  TextAlign,
  LineHeight,
  Indent,
  Blockquote,
  CodeBlock,
  // rich and tools extensions
  Link,
  Image,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Iframe,
  TrailingNode,
  HorizontalRule,
  Fullscreen,
  Print,
  Search,
  History,
  CodeBlockHighlight,
  DragItem,
  MenuSplit,
  Preview,
  QuickInsert,
  Drop,
} from 'element-tiptap';

import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';

export default {
  data () {
    return {
      textExtensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Bold({ bubble: true }),
        new Underline({ bubble: true }),
        new Italic({ bubble: true }),
        new Strike({ bubble: true }),
        new Code(),
        new FontType(),
        new FontSize(),
        new TextColor({ bubble: true }),
        new TextHighlight({ bubble: true }),
        new FormatClear(),
        new History(),
      ],
      paragraphExtensions: [
        new Title(),
        new Doc({ title: false }),
        new Text(),
        new Paragraph(),
        new Heading({ level: 4 }),
        new ListItem(),
        new BulletList(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new TextAlign(),
        new LineHeight(),
        new Indent(),
        new Blockquote(),
        new CodeBlock(),
        new History(),
      ],
      richAndToolsExtensions: [
        // new Title(),
        new Doc({ title: false }),
        new Text(),
        new Paragraph(),
        new History(),
        new FormatClear(),
        new MenuSplit(),
        new Heading({ level: 4 }),
        new FontType(),
        new FontSize(),
        new MenuSplit(),
        new Bold(),
        new Underline(),
        new Italic(),
        new Strike(),
        new TextColor(),
        new TextHighlight(),
        new LineHeight(),
        new MenuSplit(),
        new TextAlign(),
        new Code(),
        new ListItem(),
        new BulletList(),
        new OrderedList(),
        new TodoItem({ nested: true }),
        new TodoList(),
        new Indent(),
        new MenuSplit(),
        new Blockquote(),
        new CodeBlock(),
        new Link(),
        new Image(),
        new Iframe(),
        new Table({ resizable: true }),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new HorizontalRule(),
        new MenuSplit(),
        new Search(),
        new Fullscreen(),
        new Print(),
        new DragItem(),
        new CodeBlockHighlight({
          languages: {
            javascript,
            css,
          },
        }),
        new TrailingNode(),
        new Preview(),
        new QuickInsert(),
        new Drop(),
      ],
      content: '',
      // content: `<h2>
      //   Drag Handle
      // </h2>
      // <p>
      //   Add <code>data-drag-handle</code> to a DOM element within your node view to define your custom drag handle.
      // </p>
      // <div data-type="drag_item">
      //   Drag me!
      // </div>
      // <div data-type="drag_item">
      //   Try it!
      // </div>
      // <div data-type="drag_item">
      //   It works!
      // </div>`,
      editor: null,
    };
  },
  methods: {
    onInit ({ editor }) {
      this.editor = editor;
      console.log(this.editor);
    },

    onUpdate (output, options) {
      const { getJSON } = options;
      const json = getJSON();
      console.log(JSON.stringify(json, null, 2), 1111111);
    },
  },
};
</script>

<style lang="scss">
  [data-type="drag_item"] {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background-color: rgba(black, 0.05);
    margin: 0.5rem 0;
    border-radius: 6px;
    box-sizing: border-box;

    > :first-child {
      flex: 1;
      outline: none;
    }

    [data-drag-handle] {
      width: 24px;
      height: 24px;
      font-size: 20px;
      line-height: 24px;
      text-align: center;
      color: #606266;
      cursor: move;
    }
  }

  pre {
    &::before {
      content: attr(data-language);
      text-transform: uppercase;
      display: block;
      text-align: right;
      font-weight: bold;
      font-size: 0.6rem;
    }
    code {
      .hljs-comment,
      .hljs-quote {
        color: #999999;
      }
      .hljs-variable,
      .hljs-template-variable,
      .hljs-attribute,
      .hljs-tag,
      .hljs-name,
      .hljs-regexp,
      .hljs-link,
      .hljs-name,
      .hljs-selector-id,
      .hljs-selector-class {
        color: #f2777a;
      }
      .hljs-number,
      .hljs-meta,
      .hljs-built_in,
      .hljs-builtin-name,
      .hljs-literal,
      .hljs-type,
      .hljs-params {
        color: #f99157;
      }
      .hljs-string,
      .hljs-symbol,
      .hljs-bullet {
        color: #99cc99;
      }
      .hljs-title,
      .hljs-section {
        color: #ffcc66;
      }
      .hljs-keyword,
      .hljs-selector-tag {
        color: #6699cc;
      }
      .hljs-emphasis {
        font-style: italic;
      }
      .hljs-strong {
        font-weight: 700;
      }
    }
  }
</style>
