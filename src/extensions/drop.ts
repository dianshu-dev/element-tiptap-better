import { Extension } from 'tiptap';
import { Plugin, NodeSelection } from 'prosemirror-state';
// @ts-ignore
// import { serializeForClipboard } from 'prosemirror-view/src/clipboard';

// (browser.ie && browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604)
// const brokenClipboardAPI = false;

function getDomByCursor (clientX: any, clientY: any, view: any) {
  const pos = view.posAtCoords({ left: clientX, top: clientY });
  if (!pos) return false;
  let node = view.domAtPos(pos.pos);

  node = node.node;
  if (node && node.classList && node.classList.contains('ProseMirror')) return false;
  while (node && node.parentNode) {
    if (node.parentNode.classList.contains('ProseMirror')) { // todo
      break;
    }
    node = node.parentNode;
  }
  return node;
}

function blockPosAtCoords (coords: any, view: any) {
  const pos = view.posAtCoords(coords);
  if (!pos) return null;
  let node = view.domAtPos(pos.pos);

  node = node.node;
  while (node && node.parentNode) {
    if (node.parentNode.classList.contains('ProseMirror')) { // todo
      break;
    }
    node = node.parentNode;
  }
  if (node && node.nodeType === 1) {
    const desc = view.docView.nearestDesc(node, true);
    if (!(!desc || desc === view.docView)) {
      return desc.posBefore;
    }
  }
  return null;
}

function dragStart (e: any, view: any) {
  if (!e.dataTransfer) return;
  const pos = blockPosAtCoords({ left: e.clientX + 50, top: e.clientY }, view);
  if (pos != null) {
    // const dragContent: any = document.querySelector('.draggable-content');
    // dragContent.classList.add('draggable-highlight');

    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
    const slice = view.state.selection.content();
    // const {dom, text} = serializeForClipboard(view, slice);
    // e.dataTransfer.clearData();
    // e.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML);
    // if (!brokenClipboardAPI) e.dataTransfer.setData('text/plain', text);
    view.dragging = { slice, move: true };
  }
}

export default class Drop extends Extension {
  get name () {
    return 'drop';
  }

  get plugins () {
    let dragHandle: any;

    return [
      new Plugin({
        view (editorView: any) {
          dragHandle = document.createElement('span');
          dragHandle.setAttribute('draggable', 'true');
          dragHandle.className = 'draggable-handle';

          const dragIcon = document.createElement('div');
          dragIcon.className = 'draggable-icon';
          dragIcon.innerHTML = '⠿';
          const dragContent = document.createElement('div');
          dragContent.className = 'draggable-content';

          dragIcon.addEventListener('mouseover', (e) => {
            const dom = getDomByCursor(e.clientX + 50, e.clientY, editorView);
            if (!dom) return false;
            dragHandle.style.width = '100%';
            dragContent.classList.add('draggable-highlight');
            dragContent.style.height = dom.clientHeight + 'px';
          });
          dragIcon.addEventListener('mouseout', () => {
            dragHandle.style.width = 'auto';
            dragContent.classList.remove('draggable-highlight');
          });

          dragHandle.addEventListener('dragstart', (e: any) => dragStart(e, editorView));
          dragHandle.addEventListener('dragend', () => {
            dragHandle.style.display = 'none';
            dragContent.innerHTML = '';
            dragContent.classList.remove('draggable-highlight');
          });
          dragHandle.appendChild(dragIcon);
          dragHandle.appendChild(dragContent);
          setTimeout(() => {
            editorView.dom.parentNode.appendChild(dragHandle);
          }, 50);

          return {
            // update (view, prevState) {
            //
            // },
            destroy () {
              if (dragHandle && dragHandle.parentNode) {
                dragHandle.parentNode.removeChild(dragHandle);
              }
              dragHandle = null;
            },
          };
        },
        props: {
          handleDOMEvents: {
            mousemove (view: any, event: any) {
              const width = view.dom.clientLeft + view.dom.clientWidth - 72;
              const clientX = event.clientX < width ? event.clientX + 72 : event.clientX - 72;
              const dom = getDomByCursor(clientX, event.clientY, view);
              if (!dom || (dom.tagName === 'H1' && dom.classList.contains('doc-title'))) {
                dragHandle.style.display = 'none';
              } else {
                dragHandle.style.display = 'flex';
                dragHandle.style.top = dom.offsetTop + 'px';
              }
              return true;
            },
          },
        },
      }),
    ];
  }
}
