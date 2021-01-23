import { Extension } from 'tiptap';
import { Step } from 'prosemirror-transform';
import { Decoration, DecorationSet } from 'prosemirror-view';
// @ts-ignore
import { collab, sendableSteps, getVersion, receiveTransaction } from 'prosemirror-collab';

export default class Collaboration extends Extension {
  get name () {
    return 'collaboration';
  }

  get defaultOptions () {
    return {
      me: {
        cursor: null,
        focused: false,
        displayName: '',
        displayColor: '',
        thumbnail: '',
      },
      clientID: '',
      debounce: 250,
      onUpdate: () => {
      },
      onCursorChange: () => {
      },
      registerPlugin: (version: number, clientID: string) => {
        console.log('registerPlugin');
        this.options.clientID = clientID;
        this.editor.registerPlugin(collab({
          version: version,
          clientID: clientID,
        }));
        this.initDone = true;
      },
      update: ({ steps, version }: any) => {
        const { state, view, schema } = this.editor;
        if (getVersion(state) > version) {
          return;
        }
        view.dispatch(receiveTransaction(
          state,
          steps.map((item: any) => Step.fromJSON(schema, item.step)),
          steps.map((item: any) => item.clientID),
        ));
      },
      updateCursors: ({ participants }: any) => {
        this.participants = participants;
        const { view } = this.editor;
        const clientID = this.options.clientID;
        const props = {
          decorations (state: any) {
            const decos = [];
            if (participants) {
              let id: string;
              let dec: any;
              for ([id, dec] of Object.entries(participants)) {
                if (!id || !dec.cursor) continue;
                let className = 'cursor-wrap';
                const name = dec.displayName || dec.clientID;
                const style = `style="background:${dec.displayColor}"`;

                const dom: any = document.createElement('div');
                if (dec.focused === false) className += ' inactive';
                if (dec.clientID === clientID) className += ' me';
                dom.className = className;
                dom.innerHTML = `<div class="cursor" ${style}></div><div class="cursor-name" ${style}>${name}</div>`;
                decos.push(Decoration.widget(dec.cursor, dom));
              }
            }
            return DecorationSet.create(state.doc, decos);
          }
        };
        view.setProps(props);
      },
    };
  }

  init () {
    this.initDone = false;

    this.sendUpdate = this.debounce((state: any, transaction: any) => {
      try {
        const sendable = sendableSteps(state);
        this.options.me.cursor = state.selection.anchor;
        this.options.me.focused = state.selection.focused;

        if (sendable) {
          this.options.onUpdate({
            version: sendable.version,
            steps: sendable.steps.map((step: any) => step.toJSON()),
            clientID: this.options.clientID,
            participant: this.options.me,
          });
        } else if (transaction.updated > 0) {
          this.options.onCursorChange(this.options.me);
        }
      } catch (e) {

      }
    }, this.options.debounce);

    this.updateLocalCursors = (state: any) => {
      try {
        const sendable = sendableSteps(state);
        if (sendable) {
          for (const id in this.participants) {
            const cursor = this.participants[id].cursor;
            if (cursor !== undefined &&
              sendable.steps[0].slice !== undefined &&
              cursor >= sendable.steps[0].from) {
              const gap = sendable.steps[0].from - sendable.steps[0].to;
              this.participants[id].cursor = cursor + gap + sendable.steps[0].slice.content.size;
            }
          }
          this.options.updateCursors({ participants: this.participants });
        }
      } catch (e) {

      }
    };

    this.editor.on('transaction', ({ state, transaction }: any) => {
      if (this.initDone) {
        this.updateLocalCursors(state);
        this.sendUpdate(state, transaction);
      }
    });
  }

  debounce (fn: any, delay: number) {
    let timeout: any;
    return (...args: any) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, delay);
    };
  }
}
