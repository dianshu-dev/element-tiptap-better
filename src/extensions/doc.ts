import { Doc as TiptapDoc } from 'tiptap';
import { Plugin } from 'prosemirror-state';

export default class Doc extends TiptapDoc {
  get defaultOptions () {
    return {
      title: false,
    };
  }

  get schema () {
    const title = !!this.options.title;

    return {
      content: title ? 'title block+' : 'block+',
    };
  }

  get plugins () {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            compositionstart: () => {
              this.editor.setOptions({ composing: true });
              if (this.editor.extensions.options.collaboration) {
                this.editor.extensions.options.collaboration.changeEnable(false);
              }
              if (this.editor.extensions.options.cursors) {
                this.editor.extensions.options.cursors.changeEnable(false);
              }
              return true;
            },
            compositionend: (view, event: any) => {
              this.editor.setOptions({ composing: false });
              if (this.editor.extensions.options.collaboration) {
                this.editor.extensions.options.collaboration.changeEnable(true);
              }
              if (this.editor.extensions.options.cursors) {
                this.editor.extensions.options.cursors.changeEnable(true);
              }
              this.editor.options.quickInsertVisible = event.data === '/';
              return true;
            },
          }
        },
      }),
    ];
  }
}
