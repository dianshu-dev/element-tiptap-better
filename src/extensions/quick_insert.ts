import { Extension } from 'tiptap';
import { Plugin } from 'prosemirror-state';

export default class QuickInsert extends Extension {
  get name () {
    return 'quick_insert';
  }

  get plugins () {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            input: (view, event: any) => {
              this.editor.options.quickInsertVisible = event.data === '/';
              return true;
            },
          },
        },
      }),
    ];
  }
}
