// @ts-ignore
import { Extension } from 'tiptap';
import { MenuBtnView } from '@/../types';

export default class MenuSplit extends Extension implements MenuBtnView {
  get name () {
    return 'menu_split';
  }

  menuBtnView () {
    return {
      component: { name: 'MenuSplit' },
    };
  }
}
