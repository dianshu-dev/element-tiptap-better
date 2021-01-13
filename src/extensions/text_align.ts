import { Extension, MenuData, CommandGetter } from 'tiptap';
import { CommandFunction } from 'tiptap-commands';
import { MenuBtnView } from '@/../types';
import { setTextAlign } from '@/utils/text_align';
import { Alignment, ALIGN_PATTERN } from '@/constants';
import TextAlignDropdown from '@/components/MenuCommands/TextAlignDropdown.vue';

export default class TextAlign extends Extension implements MenuBtnView {
  get name () {
    return 'text_align';
  }

  get defaultOptions () {
    return {
      alignments: [
        Alignment.left,
        Alignment.center,
        Alignment.right,
        Alignment.justify,
      ],
    };
  }

  commands () {
    return this.options.alignments.reduce((commands: CommandGetter, alignment: Alignment) => {
      if (!ALIGN_PATTERN.test(alignment)) return commands;

      return {
        ...commands,
        [`align_${alignment}`]: (): CommandFunction => (state, dispatch) => {
          const { selection } = state;
          const tr = setTextAlign(
            state.tr.setSelection(selection),
            alignment === 'left' ? null : alignment,
          );

          if (tr.docChanged) {
            dispatch && dispatch(tr);
            return true;
          } else {
            return false;
          }
        },
      };
    }, {});
  }

  menuBtnView (editorContext: MenuData) {
    return {
      component: TextAlignDropdown,
      componentProps: {
        editorContext: editorContext,
        tooltip: editorContext.t('editor.extensions.TextAlign.tooltip'),
      },
    };
  }
}
