import { Extension } from 'tiptap';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export default class Cursors extends Extension {
  get name () {
    return 'cursors';
  }

  get defaultOptions () {
    return {
      userID: 0,
      showName: false,
      update: (selections: any) => {
        const { tr } = this.editor.state;
        this.selections = selections;
        const transaction = tr
          .setMeta('selections', selections)
          .setMeta('addToHistory', false);

        this.editor.view.dispatch(transaction);
      },
    };
  }

  getDecorations ({ doc, selections }: any) {
    // const userID = this.options.userID;
    const decorations = selections
      .filter((v: any) => v.userID && v.from && v.to && v.name && v.color)
      .map((selection: any) => {
        const decors = [];
        const { from, to, name, color } = selection;
        const dom: any = document.createElement('div');

        const className = `cursor-wrap client-${selection.clientID}`;
        const style = `style="background: ${color}"`;

        dom.className = className;
        dom.innerHTML = `<div class="cursor" ${style}></div><div class="cursor-name" ${style}>${name}</div>`;
        decors.push(Decoration.widget(to, dom));

        if (from !== to) {
          decors.push(Decoration.inline(from, to, {
            nodeName: 'span',
            class: `selection client-${selection.clientID}`,
            style: `background-color: ${color}32`,
          }));
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
