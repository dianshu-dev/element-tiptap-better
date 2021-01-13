import { Extension, MenuData } from 'tiptap';
import { MenuBtnView } from '@/../types';
import { createLineHeightCommand } from '@/utils/line_height';
import LineHeightDropdown from '@/components/MenuCommands/LineHeightDropdown.vue';

export default class LineHeight extends Extension implements MenuBtnView {
  get name () {
    return 'line_height';
  }

  get defaultOptions () {
    return {
      lineHeights: [
        '1',
        '1.15',
        '1.5',
        '2',
        '2.5',
        '3',
      ]
    };
  }

  commands () {
    return ({ lineHeight }: { lineHeight: string }) => createLineHeightCommand(lineHeight);
  }

  menuBtnView (editorContext: MenuData) {
    return {
      component: LineHeightDropdown,
      componentProps: {
        editorContext,
      },
    };
  }
}
