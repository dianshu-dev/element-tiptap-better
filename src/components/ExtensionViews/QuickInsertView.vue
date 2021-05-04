<template>
  <div
    ref="quickInsert"
    class="quick-insert-wrap"
    :style="{left: left + 'px', top: top + 'px', height: height + 'px'}">

    <div
      v-for="(item, index) in tools"
      :key="`tool_${index}`" :class="{'quick-insert-item': true, active: current === index}"
      @mousedown.prevent=""
      @click.stop.prevent="insertItem(item, index)">
      <v-icon :name="item.icon" style="font-size: 14px; color: #606266"/>
      <span class="quick-insert-title">{{item.name}}</span>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/heading';
import 'vue-awesome/icons/link';
import 'vue-awesome/icons/image';
import 'vue-awesome/icons/video';
import 'vue-awesome/icons/code';
import 'vue-awesome/icons/quote-right';
import 'vue-awesome/icons/list-ul';
import 'vue-awesome/icons/list-ol';
import 'vue-awesome/icons/tasks';
import 'vue-awesome/icons/minus';
import 'vue-awesome/icons/table';
import { QUICK_INSERT_LIST, normaliseNestedLayout } from '@/utils/quick_insert';
import { safeInsert } from 'prosemirror-utils';

export default {
  props: {
    editor: {
      type: Object,
      default: null,
    },
  },
  components: {
    'v-icon': Icon,
  },
  data () {
    return {
      left: 0,
      top: 0,
      height: 260,
      tools: QUICK_INSERT_LIST,
      // current: 0,
    };
  },
  computed: {
    current: {
      get () {
        return this.editor.extensions.options.quick_insert.currentIndex;
      },
      set (val) {
        this.editor.extensions.options.quick_insert.currentIndex = val;
      }
    }
  },
  created () {
    this.getPosition();
    document.addEventListener('keydown', this.keyDownListener);
    document.addEventListener('scroll', this.getPosition);
    const wrap = this.$parent.$refs.editorContentWrap;
    wrap.addEventListener('scroll', this.getPosition);
  },
  mounted () {
    document.body.appendChild(this.$el);
    this.$nextTick(() => {
      this.$refs.quickInsert.scrollTop = this.current * 44;
    });
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keyDownListener);
    document.removeEventListener('scroll', this.getPosition);
    const wrap = this.editor.view.dom.parentNode.parentNode.parentNode;
    wrap.removeEventListener('scroll', this.getPosition);
  },
  methods: {
    getPosition () {
      const coords = this.editor.view.coordsAtPos(this.editor.state.selection.to);
      this.left = coords.left;
      if (coords.top + 30 + this.height < document.body.offsetHeight) {
        this.top = coords.top + 24;
      } else {
        this.top = coords.top - this.height;
      }
    },

    insertItem (item, index) {
      this.current = index;
      this.editor.options.quickInsertVisible = false;
      const { view, state } = this.editor;
      const { tr, selection } = state;

      if (item.command === 'view') {
        view.dispatch(tr.replaceWith(selection.to - 1, selection.to, ''));
        this.editor.options[item.param] = true;
        return;
      }
      const node = state.schema.nodeFromJSON(item.json);
      if (node.isText) {
        console.log('isText-------');
        const transaction = tr.replaceWith(selection.to - 1, selection.to, node);
        view.dispatch(transaction);
      } else {
        console.log('isBlock-------');
        tr.replaceWith(selection.to - 1, selection.to, '');
        const transaction = safeInsert(normaliseNestedLayout(state, node), undefined, true)(tr);
        view.dispatch(transaction);
      }
    },

    keyDownListener (e) {
      if (e.code === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        this.insertItem(this.tools[this.current], this.current);
        this.editor.options.quickInsertVisible = false;
      } else if (e.code === 'ArrowDown' || e.keyCode === 40) {
        this.current = this.current < this.tools.length - 1 ? this.current + 1 : 0;
        this.$refs.quickInsert.scrollTop = this.current * 44;
        e.preventDefault();
      } else if (e.code === 'ArrowUp' || e.keyCode === 38) {
        this.current = this.current !== 0 ? this.current - 1 : this.tools.length - 1;
        this.$refs.quickInsert.scrollTop = this.current * 44;
        e.preventDefault();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.quick-insert-wrap {
  position: fixed;
  left: 0;
  top: 0;
  width: 150px;
  height: 260px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: white;
  font-size: 13px;
  color: #333;
  overflow-y: auto;
  z-index: 3000;

  .quick-insert-item {
    height: 44px;
    line-height: 44px;
    padding: 0 10px;
    box-sizing: border-box;
    cursor: pointer;

    &.active {
      background: #f5f6f7;
    }
  }

  .quick-insert-title {
    padding-left: 8px;
  }

  .fa-icon {
    width: auto;
    height: 1em;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
