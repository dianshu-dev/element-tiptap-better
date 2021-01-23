<template>
  <el-tiptap
    :extensions="extensions"
    :content="content"
    placeholder="Please input..."
    style="width: 80%; height: 600px"
    lang="zh"
    @onInit="onInit"
  />
</template>

<script>
import {
  Doc,
  Title,
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
  MenuSplit,
  Collaboration,
} from 'element-tiptap';

const io = require('socket.io-client');
// const clientID =  localStorage.getItem('clientID') || String(Math.floor(Math.random() * 0xFFFFFFFF));
// localStorage.setItem('clientID', clientID);
// console.log(clientID, 'clientID---------');

export default {
  name: 'Collaboration',
  data () {
    return {
      extensions: [
        new Doc({ title: true }),
        new Title({ placeholder: 'Title' }),
        new Text(),
        new Paragraph(),
        new History(),
        new FormatClear(),
        new MenuSplit(),
        new Heading({ level: 6 }),
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
        new TrailingNode(),
        new Collaboration({
          version: 0,
          debounce: 300,
          onUpdate: (data) => {
            console.log('push update', data);
            // if(!data.version) return;
            this.socket.emit('update', data);
          },
          onCursorChange: (data) => {
            console.log('push cursorChange', data);
            this.socket.emit('cursorChange', data);
          },
        }),
      ],
      me: {
        cursor: null,
        focused: false,
        displayName: '用户' + (Math.random() * 1000).toFixed(0),
        displayColor: '',
        thumbnail: '',
      },
      content: '',
      editor: null,
      socket: null,
      participants: {},
      count: 0,
    };
  },
  mounted () {
  },
  methods: {
    onInit ({ editor }) {
      console.log('onInit');
      this.editor = editor;
      console.log(this.editor);
      this.initSocket();
    },

    initSocket () {
      this.socket = io('ws://localhost:7002/doc?room_id=1853959866155008&user_id=1');
      // this.socket = io('ws://localhost:3000/doc-99?room_id=1853959866155008&user_id=1');
      this.socket.on('connect', () => {
        console.log('get connect');
        this.editor.unregisterPlugin('collab');
      })
        .on('init', data => {
          console.log('get init', data, this.socket.id);
          this.me.displayColor = this.getDisplayColor(this.socket.id);
          this.editor.setContent(data.doc, true);
          this.editor.extensions.options.collaboration.me = this.me;
          this.editor.extensions.options.collaboration.registerPlugin(data.version, this.socket.id);
        })
        .on('update', data => {
          console.log('get update', data);
          this.editor.extensions.options.collaboration.update(data);
          this.editor.extensions.options.collaboration.updateCursors(data);
        })
        .on('getCount', count => {
          console.log('getCount', count);
          this.setCount(count);
        })
        .on('cursorUpdate', data => {
          console.log('get cursorUpdate', data);
          this.editor.extensions.options.collaboration.updateCursors(data);
          this.participants = data.participants;
        });

      this.socket.emit('init', this.me);
    },
    setCount (count) {
      this.count = count;
    },

    getDisplayColor (str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let colour = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }
      return colour;
    },
  },
  beforeDestroy () {
    if (this.socket) this.socket.close();
    if (this.editor) this.editor.destroy();
  },
};
</script>
