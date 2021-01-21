import { Extension, MenuData } from 'tiptap';
import { CommandFunction } from 'tiptap-commands';
import { Plugin, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { MenuBtnView } from '@/../types';
import SearchPanel from '@/components/MenuCommands/SearchPanel.vue';

export default class Search extends Extension implements MenuBtnView {
  constructor (options = {}) {
    super(options);

    this.results = [];
    this.searchTerm = null;
    this.index = null;
    this._updating = false;
  }

  get name () {
    return 'search';
  }

  get defaultOptions () {
    return {
      autoSelectNext: true,
      findClass: 'find',
      currentClass: 'find-current',
      searching: false,
      caseSensitive: false,
      disableRegex: true,
      alwaysSearch: false,
    };
  }

  commands () {
    return {
      find: (attrs: any): CommandFunction => {
        return this.find(attrs);
      },
      findNext: (attrs: any): CommandFunction => {
        return this.findNextOrPrev(attrs, 'next');
      },
      findPrev: (attrs: any): CommandFunction => {
        return this.findNextOrPrev(attrs, 'prev');
      },
      findRegexSwitch: (attrs: any): CommandFunction => {
        return this.regexSwitch(attrs);
      },
      replace: (attrs: any): CommandFunction => {
        return this.replace(attrs);
      },
      replaceAll: (attrs: any): CommandFunction => {
        return this.replaceAll(attrs);
      },
      clearSearch: (): CommandFunction => (state: any, dispatch: any) => {
        this.searchTerm = null;
        this.results = [];
        this.index = null;
        this.updateView(state, dispatch);
        return true;
      },
    };
  }

  get findRegExp (): any {
    return RegExp(this.searchTerm, !this.options.caseSensitive ? 'gui' : 'gu');
  }

  get decorations (): any {
    const arr: any[] = [];
    this.results.forEach((deco: any, key: number) => {
      const findClass = key !== this.index ? this.options.findClass : this.options.currentClass;
      arr.push(Decoration.inline(deco.from, deco.to, { class: findClass }));
    });
    return arr;
  }

  _search (tr: any): void {
    console.log('searching...');
    this.results = [];
    const { doc } = tr;
    const mergedTextNodes: any[] = [];
    let index = 0;

    if (!this.searchTerm) {
      return;
    }

    doc.descendants((node: any, pos: any) => {
      if (node.isText) {
        if (mergedTextNodes[index]) {
          mergedTextNodes[index] = {
            text: mergedTextNodes[index].text + node.text,
            pos: mergedTextNodes[index].pos,
          };
        } else {
          mergedTextNodes[index] = {
            text: node.text,
            pos,
          };
        }
      } else {
        index += 1;
      }
    });

    mergedTextNodes.forEach(({ text, pos }) => {
      const search = this.findRegExp;
      let m;
      // eslint-disable-next-line no-cond-assign
      while ((m = search.exec(text))) {
        if (m[0] === '') {
          break;
        }
        this.results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        });
      }
    });

    if (this.index === null) {
      const { from, to } = tr.selection;
      if (from !== to) {
        const index = this.results.findIndex((item: any) => item.from === from && item.to === to);
        this.index = index !== -1 ? index : 0;
      } else {
        this.index = 0;
      }
    }
  }

  replace (replace: string): any {
    return (state: any, dispatch: any) => {
      if (!this.results.length || this.index === null) {
        return;
      }
      const { from, to } = this.results[this.index];
      dispatch(state.tr.insertText(replace, from, to));
      this.editor.commands.findNext(this.searchTerm);
      return { length: this.results.length, index: this.index };
    };
  }

  rebaseNextResult (replace: any, index: number, lastOffset: number = 0): any {
    const nextIndex = index + 1;

    if (!this.results[nextIndex]) {
      return null;
    }

    const { from: currentFrom, to: currentTo } = this.results[index];
    const offset = (currentTo - currentFrom - replace.length) + lastOffset;
    const { from, to } = this.results[nextIndex];

    this.results[nextIndex] = {
      to: to - offset,
      from: from - offset,
    };

    return offset;
  }

  replaceAll (replace: string): any {
    return ({ tr }: { tr: any }, dispatch: any) => {
      let offset: any;

      if (!this.results.length) {
        return;
      }

      this.results.forEach(({ from, to }: { from: any, to: any }, index: number) => {
        tr.insertText(replace, from, to);
        offset = this.rebaseNextResult(replace, index, offset);
      });

      dispatch(tr);

      this.editor.commands.find(this.searchTerm);
      return { length: this.results.length, index: this.index };
    };
  }

  find (searchTerm: string): any {
    return (state: any, dispatch: any) => {
      this.searchTerm = this.options.disableRegex
        ? searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
        : searchTerm;
      this.updateView(state, dispatch);
      return { length: this.results.length, index: this.index };
    };
  }

  findNextOrPrev (searchTerm: string, type: string): any {
    return (state: any, dispatch: any) => {
      this.searchTerm = this.options.disableRegex
        ? searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
        : searchTerm;
      this.updateView(state, dispatch);
      if (!this.searchTerm || !this.results.length) {
        return true;
      }
      const { from, to } = state.selection;
      if (type === 'next') {
        const index = this.results.findIndex((item: any) => item.from >= from && item.from >= to);
        this.index = index !== -1 && index !== this.results.length ? index : 0;
      } else if (type === 'prev') {
        let index = -1;
        for (let i = this.results.length - 1; i >= 0; i--) {
          const item = this.results[i];
          if (item.from < from && item.to <= from) {
            index = i;
            break;
          }
        }
        this.index = index !== -1 ? index : this.results.length - 1;
      }
      this.updateView(state, dispatch);
      this.resultSelectionView(state, dispatch);
      return { length: this.results.length, index: this.index };
    };
  }

  resultSelectionView (state: any, dispatch: any): void {
    if (this.index == null || !this.results.length) {
      return;
    }
    const result = this.results[this.index];
    const { tr, doc } = state;
    const $start = doc.resolve(result.from);
    const $end = doc.resolve(result.to);
    const transaction = tr.setSelection(new TextSelection($start, $end));
    transaction.scrollIntoView();
    dispatch(transaction);
  }

  regexSwitch (attrs: any): any {
    return () => {
      this.disableRegex = !attrs;
      return true;
    };
  }

  updateView ({ tr }: { tr: any }, dispatch: any): void {
    this._updating = true;
    dispatch(tr);
    this._updating = false;
  }

  createDeco (tr: any): any {
    this._search(tr);
    return this.decorations ? DecorationSet.create(tr.doc, this.decorations) : [];
  }

  get plugins (): any {
    return [
      new Plugin({
        state: {
          init () {
            return DecorationSet.empty;
          },
          apply: (tr, old) => {
            if (this._updating || this.options.searching || (tr.docChanged && this.options.alwaysSearch)) {
              return this.createDeco(tr);
            }

            if (tr.docChanged) {
              return old.map(tr.mapping, tr.doc);
            }

            return old;
          },
        },
        props: {
          decorations (state) {
            return this.getState(state);
          },
        },
      }),
    ];
  }

  menuBtnView (editorContext: MenuData) {
    return {
      component: SearchPanel,
      componentProps: {
        editorContext,
        icon: 'search',
        tooltip: editorContext.t('editor.extensions.Search.tooltip'),
      },
    };
  }
}
