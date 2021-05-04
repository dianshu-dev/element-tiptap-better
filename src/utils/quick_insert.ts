const paragraph = { type: 'paragraph' };

const tableHeader = {
  type: 'table_header',
  attrs: {
    colspan: 1,
    rowspan: 1,
    colwidth: [150],
    background: '#f4f5f7',
  },
  content: [paragraph],
};

const tableCell = {
  type: 'table_cell',
  attrs: {
    colspan: 1,
    rowspan: 1,
    colwidth: [150],
    background: null,
  },
  content: [paragraph],
};

const tableHeaderRow = {
  type: 'table_row',
  content: [
    tableHeader, tableHeader, tableHeader,
  ],
};

const tableCellRow = {
  type: 'table_row',
  content: [
    tableCell, tableCell, tableCell,
  ],
};

export const QUICK_INSERT_LIST = [
  {
    name: '标题1',
    value: 'heading',
    command: 'insert',
    letter: 'biaoti1',
    icon: 'heading',
    json: {
      type: 'heading',
      attrs: { level: 1 },
    },
  },
  {
    name: '标题2',
    value: 'heading',
    command: 'insert',
    letter: 'biaoti2',
    icon: 'heading',
    json: {
      type: 'heading',
      attrs: { level: 2 },
    },
  },
  {
    name: '标题3',
    value: 'heading',
    command: 'insert',
    letter: 'biaoti3',
    icon: 'heading',
    json: {
      type: 'heading',
      attrs: { level: 3 },
    },
  },
  {
    name: '标题4',
    value: 'heading',
    command: 'insert',
    letter: 'biaoti4',
    icon: 'heading',
    json: {
      type: 'heading',
      attrs: { level: 4 },
    },
  },
  {
    name: '无序列表',
    value: 'bullet_list',
    command: 'insert',
    letter: 'wuxuliebiao',
    icon: 'list-ul',
    json: {
      type: 'bullet_list',
      content: [
        {
          type: 'list_item',
          content: [paragraph],
        }
      ],
    },
  },
  {
    name: '有序列表',
    value: 'ordered_list',
    command: 'insert',
    letter: 'youxuliebiao',
    icon: 'list-ol',
    json: {
      type: 'ordered_list',
      attrs: {
        order: 1,
      },
      content: [
        {
          type: 'list_item',
          content: [paragraph],
        }
      ],
    },
  },
  {
    name: '任务列表',
    value: 'todo_list',
    command: 'insert',
    letter: 'renwuliebiao',
    icon: 'tasks',
    json: {
      type: 'todo_list',
      content: [
        {
          type: 'todo_item',
          attrs: {
            done: false,
          },
          content: [paragraph],
        }
      ],
    },
  },
  {
    name: '表格',
    value: 'createTable',
    command: 'insert',
    letter: 'biaoge',
    icon: 'table',
    json: {
      type: 'table',
      content: [
        tableHeaderRow,
        tableCellRow,
        tableCellRow,
      ],
    },
  },
  // {
  //   name: '图片',
  //   value: 'image',
  //   command: 'view',
  //   letter: 'tupian',
  //   icon: 'image',
  //   json: {},
  // },
  // {
  //   name: '视频',
  //   value: 'iframe',
  //   command: 'view',
  //   letter: 'shipin',
  //   icon: 'video',
  //   json: {},
  // },
  {
    name: '链接',
    value: 'link',
    command: 'view',
    letter: 'lianjie',
    icon: 'link',
    param: 'addLinkVisible',
  },
  {
    name: '引用',
    value: 'blockquote',
    command: 'insert',
    letter: 'yinyong',
    icon: 'quote-right',
    json: {
      type: 'blockquote',
      attrs: {
        textAlign: null,
        indent: null
      },
      content: [paragraph],
    },
  },
  {
    name: '代码块',
    value: 'code_block',
    command: 'insert',
    letter: 'daimakuai',
    icon: 'code',
    json: {
      type: 'code_block',
    },
  },
  {
    name: '分隔线',
    value: 'horizontal_rule',
    command: 'insert',
    letter: 'fengexian',
    icon: 'minus',
    json: {
      type: 'horizontal_rule',
    },
  },
];

export const normaliseNestedLayout = (state: any, node: any) => {
  if (state.selection.$from.depth > 1) {
    if (node.attrs.layout && node.attrs.layout !== 'default') {
      return node.type.createChecked(
        {
          ...node.attrs,
          layout: 'default',
        },
        node.content,
        node.marks,
      );
    }

    // If its a breakout layout, we can remove the mark
    // Since default isn't a valid breakout mode.
    const breakoutMark: any = state.schema.marks.breakout;
    if (breakoutMark && breakoutMark.isInSet(node.marks)) {
      const newMarks = breakoutMark.removeFromSet(node.marks);
      return node.type.createChecked(node.attrs, node.content, newMarks);
    }
  }

  return node;
};
