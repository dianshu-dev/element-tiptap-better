<template>
  <div class="el-tiptap-editor__wrapper">
    <el-tiptap
      :extensions="extensions"
      :content="content"
      :spellcheck="false"
      :menu-bubble-options="{ 'keep-in-bounds': false }"
      placeholder="Write something ..."
      @onPaste="onPaste"
      @onDrop="onDrop"
    />
  </div>
</template>

<script>
import {
  Title,
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  Code,
  Link,
  Image,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  TextAlign,
  Indent,
  HardBreak,
  HorizontalRule,
  Fullscreen,
  History,
  Preview,
} from 'element-tiptap';

export default {
  data () {
    return {
      extensions: [
        new Title(),
        new Doc({ title: true }),
        new Text(),
        new Paragraph(),
        new Heading({ level: 4 }),
        new Bold({ bubble: true }),
        new Underline({ bubble: true }),
        new Italic({ bubble: true }),
        new Strike({ bubble: true }),
        new Code(),
        new Link({ bubble: true }),
        new Image({
          uploadRequest: (file) => {
            return this.uploadImage(file);
          }
        }),
        new Blockquote(),
        new TextAlign(),
        new ListItem(),
        new BulletList({ bubble: true }),
        new OrderedList({ bubble: true }),
        new TodoItem(),
        new TodoList(),
        new Indent(),
        new HardBreak(),
        new HorizontalRule({ bubble: true }),
        new Fullscreen(),
        new History(),
        new Preview(),
      ],

      content: '<h2 style="text-align: center;">Welcome To Element Tiptap Editor Demo</h2><p>🔥 <strong>Element Tiptap Editor </strong>🔥is a WYSIWYG rich-text editor using&nbsp; <a href="https://github.com/scrumpy/tiptap" target="_blank" ref="nofollow noopener noreferrer">tiptap</a>&nbsp;and <a href="https://github.com/ElemeFE/element" target="_blank" ref="nofollow noopener noreferrer">element-ui</a>&nbsp;for Vue.js <img src="https://i.ibb.co/nbRN3S2/undraw-upload-87y9.png" alt="" title="" height="200" data-display="right"> that\'s easy to use, friendly to developers, fully extensible and clean in design.</p><p></p><p style="text-align: right;">👉Click on the image to get started image features 👉</p><p></p><p>You can switch to <strong>Code View </strong>💻 mode and toggle <strong>Fullscreen</strong> 📺 in this demo.</p><p></p><p><strong>Got questions or need help or feature request?</strong></p><p>🚀 <strong>welcome to submit an <a href="https://github.com/Leecason/element-tiptap/issues" target="_blank" ref="nofollow noopener noreferrer">issue</a></strong> 😊</p><p>I\'m continuously working to add in new features.</p><p></p><blockquote><p>This demo is simple, switch tab for more features.</p><p>All demos source code: <a href="https://github.com/Leecason/element-tiptap/blob/master/examples/views/Index.vue" target="_blank" ref="nofollow noopener noreferrer">source code 🔗</a></p></blockquote>',
    };
  },
  methods: {
    onPaste (view, event, slice) {
      console.log(view, event, slice, 'onPaste-------------------');
    },
    onDrop (view, event, slice, moved) {
      console.log(view, event, slice, moved, 'onDrop-------------------');
    },

    async uploadImage (file) {
      const data = new FormData();
      data.append('file', file);
      data.append('fname', file.name);

      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', 'https://jsonplaceholder.typicode.com/posts/');
        request.onload = function (e) {
          if (!e.target.response) {
            this.$message.error('上传失败!');
            reject(new Error('上传失败!'));
          }
          const res = JSON.parse(e.target.response);
          if (!res.key) {
            this.$message.error('上传失败!');
            reject(new Error('上传失败!'));
          }
          console.log(res, 123456);
          resolve('');
        };
        request.send(data);
      });
    },
  }
};
</script>
