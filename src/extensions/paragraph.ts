import { DOMOutputSpec, Node as ProsemirrorNode, NodeSpec, Fragment } from 'prosemirror-model';
import { Paragraph as TiptapParagraph } from 'tiptap';
import { canSplit } from 'prosemirror-transform';
import { TextSelection, NodeSelection } from 'prosemirror-state';
import {
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode,
} from 'prosemirror-commands';

import { transformCSStoLineHeight, transformLineHeightToCSS } from '@/utils/line_height';
import { ALIGN_PATTERN } from '@/constants';

export const ParagraphNodeSpec: NodeSpec = {
  attrs: {
    textAlign: { default: null },
    indent: { default: null },
    lineHeight: { default: null },
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [{
    tag: 'p',
    getAttrs,
  }],
  toDOM,
};

// @ts-ignore
function getAttrs (dom): { [key: string]: any } {
  let {
    textAlign,
    lineHeight,
  } = dom.style;

  let align = dom.getAttribute('data-text-align') || textAlign || '';
  align = ALIGN_PATTERN.test(align) ? align : null;

  const indent = parseInt(dom.getAttribute('data-indent'), 10) || 0;

  lineHeight = transformCSStoLineHeight(lineHeight) || null;

  return {
    textAlign: align,
    indent,
    lineHeight,
  };
}

function toDOM (node: ProsemirrorNode): DOMOutputSpec {
  const {
    textAlign,
    indent,
    lineHeight,
  } = node.attrs;

  let style = '';
  const attrs: { [key: string]: any } = {};

  if (textAlign && textAlign !== 'left') {
    style += `text-align: ${textAlign};`;
  }

  if (indent) {
    attrs['data-indent'] = indent;
  }

  if (lineHeight) {
    const cssLineHeight = transformLineHeightToCSS(lineHeight);
    style += `line-height: ${cssLineHeight};`;
  }

  style && (attrs.style = style);

  return ['p', attrs, 0];
}

function defaultBlockAt (match: any) {
  for (let i = 0; i < match.edgeCount; i++) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) return type;
  }
  return null;
}

function customSplitBlock (state: any, dispatch: any): boolean {
  const { $from, $to } = state.selection;
  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false;
    if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView());
    return true;
  }
  if (!$from.parent.isBlock) return false;
  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size;
    const tr = state.tr;
    if (state.selection instanceof TextSelection) tr.deleteSelection();
    const deflt = $from.depth === 0 ? null : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
    let types: any = atEnd && deflt ? [{ type: deflt, attrs: $from.node().attrs }] : null;
    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
    if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])) {
      types = [{ type: deflt, attrs: $from.node().attrs }];
      can = true;
    }
    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (!atEnd && !$from.parentOffset && $from.parent.type !== deflt &&
        $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from([deflt.create(), $from.parent]))) {
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
      }
    }
    const marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
    if (marks) tr.ensureMarks(marks);
    dispatch(tr.scrollIntoView());
  }
  return true;
}

export default class Paragraph extends TiptapParagraph {
  get schema () {
    return ParagraphNodeSpec;
  }

  keys () {
    return {
      Enter (state: any, dispatch: any, view: any) {
        chainCommands(
          newlineInCode,
          createParagraphNear,
          liftEmptyBlock,
          customSplitBlock
        )(state, dispatch, view);
        return true;
      }
    };
  }
}

export const toParagraphDOM = toDOM;
export const getParagraphNodeAttrs = getAttrs;
