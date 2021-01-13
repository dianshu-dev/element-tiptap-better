// @ts-nocheck
import { Node, MenuData } from 'tiptap';
import { MenuBtnView } from '@/../types';
import DragItemButton from '@/components/MenuCommands/DragItemButton.vue';

export default class DragItem extends Node implements MenuBtnView {
  get name () {
    return 'drag_item';
  }

  get schema () {
    return {
      group: 'block',
      draggable: true,
      content: 'paragraph+',
      toDOM: () => ['div', { 'data-type': this.name }, 0],
      parseDOM: [{
        tag: `[data-type="${this.name}"]`,
      }],
    };
  }

  commands ({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state;
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
    };
  }

  // Attention! For the data-drag-handle to work, the component must contain another element with `ref="content"` somewhere (it can be invisible).
  get view () {
    return {
      template: `
        <div data-type="drag_item" contenteditable="false">
          <div ref="content" contenteditable="true"></div>
          <div data-drag-handle>≡</div>
        </div>
      `,
    };
  }

  menuBtnView (editorContext: MenuData) {
    return {
      component: DragItemButton,
      componentProps: {
        editorContext,
        icon: 'stream',
        tooltip: editorContext.t('editor.extensions.DragItem.tooltip'),
      },
    };
  }
}
