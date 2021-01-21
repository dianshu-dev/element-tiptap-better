import { Extension } from 'tiptap';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export default class Cursors extends Extension {
  get name () {
    return 'cursors';
  }

  get defaultOptions () {
    return {
      update: (selections: any) => {
        const { tr } = this.editor.state;
        const transaction = tr
          .setMeta('selections', selections)
          .setMeta('addToHistory', false);

        this.editor.view.dispatch(transaction);
      },
    };
  }

  getDecorations ({ doc, selections }: { doc: any, selections: any }) {
    const { clientID } = this.editor.extensions.options.collaboration;
    const decorations = selections
      .filter((selection: any) => selection.clientID !== clientID)
      .map((selection: any) => {
        const decors = [];
        if (selection.selection) {
          const { from, to } = selection.selection;
          const span = document.createElement('span');
          span.className = `cursor client-${selection.clientID}`;
          span.title = `client-${selection.clientID}`;
          decors.push(Decoration.widget(to, span));
          if (from !== to) {
            decors.push(Decoration.inline(from, to, {
              nodeName: 'span',
              class: `selection client-${selection.clientID}`,
            }));
          }
        }
        return decors;
      })
      .flat();

    return DecorationSet.create(doc, decorations);
  }

  get plugins () {
    return [
      new Plugin({
        state: {
          init: (_, { doc }: any) => this.getDecorations({ doc, selections: [] }),
          apply: (transaction: any, decorationSet: any) => {
            const { mapping, doc } = transaction;
            const selections = transaction.getMeta('selections');

            if (selections) {
              return this.getDecorations({ doc, selections });
            }

            return decorationSet.map(mapping, doc);
          },
        },
        props: {
          decorations (state: any) {
            return this.getState(state);
          },
        },
      }),
    ];
  }
}
