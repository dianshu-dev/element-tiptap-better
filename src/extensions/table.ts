import { Table as TiptapTable } from 'tiptap-extensions';
import { MenuData } from 'tiptap';
import { MenuBtnView } from '@/../types';
import FillColorPicker from '@/components/MenuCommands/TablePopover/FillColorPicker.vue';
import TablePopover from '@/components/MenuCommands/TablePopover/index.vue';

export default class Table extends TiptapTable implements MenuBtnView {
  menuBtnView (editorContext: MenuData) {
    const { commands, isActive, editor, t }: any = editorContext;
    return [
      {
        component: TablePopover,
        componentProps: {
          editorContext,
        },
      },
      {
        component: FillColorPicker,
        componentProps: {
          colorSet: this.options.colors,
          isActive: isActive.table(),
          lastColor: editor.view.lastFillColor || '#E2F0D9',
          tooltip: t('editor.extensions.FillColor.tooltip'),
          icon: 'fill-drip',
        },
        componentEvents: {
          confirm: (color: string) => {
            commands.setCellAttr({ name: 'background', value: color });
            editor.view.lastFillColor = color;
          },
        },
      },
    ];
  }
}
