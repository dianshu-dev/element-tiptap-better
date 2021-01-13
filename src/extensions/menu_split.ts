// @ts-ignore
import { Extension } from 'tiptap';
import { MenuBtnView } from '@/../types';

export default class MenuSplit extends Extension implements MenuBtnView {
  menuBtnView () {
    return {
      component: { name: 'MenuSplit' },
    };
  }
}
