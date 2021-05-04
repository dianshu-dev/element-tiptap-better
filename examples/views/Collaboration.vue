<template>
  <div style="width: 80%">
    <div>
      <span v-for="(item, index) in clientsIDs" :key="index">{{item.name}}</span>
    </div>
    <el-tiptap
      :extensions="extensions"
      :content="content"
      placeholder="输入内容..."
      style="width: 100%; height: 600px"
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
  MenuSplit,
  Collaboration,
  Cursors,
  Drop,
} from 'element-tiptap';

// import randomColor from 'randomcolor';

const io = require('socket.io-client');
// const clientID =  localStorage.getItem('clientID') || String(Math.floor(Math.random() * 0xFFFFFFFF));
// localStorage.setItem('clientID', clientID);
// console.log(clientID, 'clientID---------');

export default {
  name: 'Collaboration',
  data () {
    return {
      editor: null,
      socket: null,
      content: '',
      count: 0,
      options: {
        socketServerBaseURL: 'ws://localhost:7002',
        namespace: 'doc',
        room: '1853959866155008',
        joinOptions: {},
        name: '寒冬',
        color: '#666666',
      },
      extensions: [
        new Title(),
        new Doc({ title: true }),
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
        new TrailingNode(),
        new Collaboration({
          debounce: 300,
          onUpdate: (data) => {
            console.log(data, 'push update-----------------');
            // if(!data.version) return;
            this.socket.emit('update', data);
          },
          onUpdateSelection: (selection) => {
            if (!selection) return;
            console.log(selection, 'push selection--------------');
            this.socket.emit('updateSelection', {
              selection: {
                name: this.options.name,
                color: this.options.color,
                ...selection
              },
            });
          },
        }),
        new Cursors({ userID: 5 }),
        new Drop(),
      ],
      saving: false,
      clientsIDs: [],
      selections: [],
      colorsMap: {},
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
      this.socket = io('ws://127.0.0.1:7002/doc?room_id=1853959866155008', {
        path: '/socket'
      });
      this.socket.on('connect', () => {
        console.log('socket connect---------------');
        this.editor.unregisterPlugin('collab');
      }).on('init', (data) => {
        console.log(data, 'get init------------');
        this.options.color = this.getDisplayColor(this.socket.id);
        this.editor.setContent(data.doc);
        this.editor.extensions.options.collaboration.registerPlugin(data.version, this.socket.id);
      }).on('initFailed', (error) => {
        console.log(error);
      }).on('update', (data) => {
        console.log(data, 'get update------------');
        this.editor.extensions.options.collaboration.update(data);
        if (data.selections) {
          this.selections = data.selections;
          this.editor.extensions.options.cursors.update(data.selections);
        }
      }).on('getSelections', (data) => {
        console.log(data, 'get selections------------');
        this.selections = data;
        this.editor.extensions.options.cursors.update(data);
      }).on('getClients', (clientsIDs) => {
        console.log(clientsIDs, 'get clients------------------');
        this.clientsIDs = clientsIDs;
      }).on('disconnect', () => {
        console.log('disconnect------------------');
      });

      this.socket.emit('init', { options: this.options.joinOptions });
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

<style>
  .selection {
    position: relative;
  }
</style>
