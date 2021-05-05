import { Extension } from 'tiptap';
import { Plugin } from 'prosemirror-state';

export default class QuickInsert extends Extension {
  get name () {
    return 'quick_insert';
  }

  get defaultOptions () {
    return {
      trigger: '',
      currentIndex: 0,
    };
  }

  get plugins () {
    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event: any) => {
            if (event.keyCode === 13 && this.editor.options.quickInsertVisible) {
              event.preventDefault();
              return true;
            }
            return false;
          },
          handleDOMEvents: {
            input: (view, event: any) => {
              const node: any = view.domAtPos(view.state.selection.to);
              const dom = node.node;
              if (dom.tagName === 'H1' && dom.classList.contains('doc-title')) {
                return false;
              }
              if (this.options.trigger) {
                this.editor.options.quickInsertVisible = event.data === this.options.trigger;
                return false;
              }
              this.editor.options.quickInsertVisible = event.data === '/' || event.data === '、' || event.data === '=' || event.data === '+';
              return false;
            },
          },
        },
      }),
    ];
  }
}
