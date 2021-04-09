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
              this.editor.extensions.options.collaboration.changeEnable(false);
              this.editor.extensions.options.cursors.changeEnable(false);
              return true;
            },
            compositionend: () => {
              this.editor.setOptions({ composing: false });
              this.editor.extensions.options.collaboration.changeEnable(true);
              this.editor.extensions.options.cursors.changeEnable(true);
              return true;
            },
          }
        },
      }),
    ];
  }
}
