import { Extension } from 'tiptap';
import { Step } from 'prosemirror-transform';
// @ts-ignore
import { collab, sendableSteps, getVersion, receiveTransaction } from 'prosemirror-collab';

export default class Collaboration extends Extension {
  get name () {
    return 'collaboration';
  }

  get defaultOptions () {
    return {
      enable: true,
      clientID: String(Math.floor(Math.random() * 0xFFFFFFFF)),
      debounce: 250,
      keepFocusOnBlur: false,
      onUpdate: () => {
      },
      onUpdateSelection: () => {
      },
      onLocalSelection: () => {
      },
      changeEnable: (value: boolean) => {
        this.options.enable = value;
      },
      registerPlugin: (version: number, clientID: string) => {
        console.log('registerPlugin');
        this.version = version;
        this.options.clientID = clientID;
        this.editor.registerPlugin(collab({
          version: version,
          clientID: clientID,
        }));
        this.initDone = true;
      },
      update: ({ steps, version }: any) => {
        if (!this.options.enable) {
          return;
        }
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
    };
  }

  init () {
    // Default version
    this.version = 0;
    this.initDone = false;

    this.getSendableSteps = this.debounce((state: any) => {
      const selection = (this.options.keepFocusOnBlur || this.editor.focused) ? {
        from: state.selection.from,
        to: state.selection.to,
      } : null;
      const sendable = sendableSteps(state);
      if (sendable) {
        this.version = sendable.version;
        this.options.onUpdate({
          version: sendable.version,
          steps: sendable.steps.map((step: any) => step.toJSON()),
          selection,
        });
      } else {
        this.options.onUpdateSelection(selection);
      }
    }, this.options.debounce);

    this.editor.on('transaction', ({ state, transaction }: any) => {
      if (this.options.enable && this.initDone) {
        this.getSendableSteps(state, transaction);
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
