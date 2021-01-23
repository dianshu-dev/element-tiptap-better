<template>
  <div ref="searchPanelWrap" style="display: inline-block; vertical-align: middle">
    <command-button
      :icon="icon"
      :command="() => changeVisible(!searchVisible)"
      :enable-tooltip="et.tooltip"
      :tooltip="tooltip"
    />

    <div v-show="searchVisible" ref="searchPanel" class="el-titap-editor__search-panel">
      <div class="search-panel-wrap">
        <div class="search-panel-header">
          <div>
            <span :class="{active: !showReplace}" @click="showReplace = false">搜索</span>
            <span :class="{active: showReplace}" @click="showReplace = true">替换</span>
          </div>
          <i class="el-icon-close" @click.stop="searchPanelClose"></i>
        </div>
        <div class="search-input-wrap">
          <el-input
            ref="searchInput"
            v-model="searchTerm"
            size="small"
            placeholder="输入搜索内容"
            clearable
            @input="findDebounce"
            @keydown.enter.native="find">
          </el-input>
          <button class="button" @click="runCommand('findPrev', searchTerm)">
            <i class="el-icon-top"></i>
          </button>
          <button class="button" @click="runCommand('findNext', searchTerm)">
            <i class="el-icon-bottom"></i>
          </button>
          <span v-if="resultLength">{{resultIndex}}/{{resultLength}}</span>
          <span v-else>无结果</span>
          <!--<el-checkbox-->
          <!--  v-model="regexSwitch"-->
          <!--  @change="runCommand('findRegexSwitch', regexSwitch)">Regex-->
          <!--</el-checkbox>-->
        </div>
        <div v-if="showReplace" class="replace-input-wrap">
          <el-input
            v-model="replaceWith"
            size="small"
            placeholder="输入替换内容"
            clearable
            @keydown.enter.native="runCommand('replace', replaceWith)">
          </el-input>
          <button class="button" @click="runCommand('replace', replaceWith)">替换</button>
          <button class="button" @click="runCommand('replaceAll', replaceWith)">替换全部</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Ref } from 'vue-property-decorator';
import { MenuData } from 'tiptap';
import { Button, Popover, Input, Checkbox, Tooltip } from 'element-ui';

import CommandButton from './CommandButton.vue';
import { debounce } from '@/utils/debounce';

@Component({
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Input.name]: Input,
    [Checkbox.name]: Checkbox,
    [Tooltip.name]: Tooltip,
    CommandButton,
  },
})
export default class SearchPanel extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Prop({
    type: String,
    required: true,
  })
  readonly tooltip!: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly icon!: string;

  searchVisible: boolean = false;
  regexSwitch: boolean = false;
  showReplace: boolean = false;
  searchTerm: string = '';
  searchTermLast: string = '';
  replaceWith: string = '';
  resultLength: number = 0;
  resultIndex: number = 0;

  @Inject() readonly et!: any;

  @Ref('searchPanelWrap') readonly panelWrapDom!: any;
  @Ref('searchPanel') readonly panelDom!: any;
  @Ref('searchInput') readonly inputRef!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private get container () {
    return this.panelWrapDom.parentNode.parentNode;
  }

  mounted (): void {
    this.container.appendChild(this.panelDom);
    document.addEventListener('keydown', this.keyDownSearch, false);
  }

  beforeDestroy (): void {
    this.container.removeChild(this.panelDom);
    document.removeEventListener('keydown', this.keyDownSearch, false);
  }

  private keyDownSearch (e: any): void {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault();
      this.showReplace = true;
      this.setSearchTerm();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      this.showReplace = false;
      this.setSearchTerm();
    }
  }

  setSearchTerm () {
    const selection: any = this.editor.state.selection;
    if (!selection.empty) {
      const content: any = selection.content().content;
      if (content && content.content) {
        this.searchTerm = content.content[0].textContent || '';
      }
    }
    this.changeVisible(true);
  }

  findDebounce = debounce(this.find, 300, { isImmediate: false });

  find () {
    console.log('find-----');
    if (this.searchTerm !== this.searchTermLast) {
      this.runCommand('find', this.searchTerm);
      this.searchTermLast = this.searchTerm;
    } else if (this.searchTerm) {
      this.runCommand('findNext', this.searchTerm);
    }
    this.$nextTick(() => {
      const length = this.searchTerm.length;
      this.inputRef.$el.selectionStart = length;
      this.inputRef.$el.selectionEnd = length;
      this.inputRef.focus();
    });
  }

  changeVisible (visible: boolean) {
    this.searchVisible = visible;
    if (visible) {
      this.editor.commands.clearSearch();
      this.runCommand('find', this.searchTerm);
      this.searchTermLast = this.searchTerm;
      this.$nextTick(() => {
        this.searchInputFocus();
      });
    }
  }

  searchInputFocus () {
    if (this.searchTerm) {
      this.inputRef.select();
    } else {
      this.inputRef.focus();
    }
  }

  searchPanelClose () {
    this.searchVisible = false;
    this.searchTermLast = '';
    this.editor.commands.clearSearch();
  }

  runCommand (type: string, arg?: any):void {
    const searchResult = this.editor.commands[type](arg);
    if (!searchResult) {
      return;
    }
    this.resultLength = searchResult.length || 0;
    this.resultIndex = searchResult.index !== null ? searchResult.index + 1 : 0;
  }
};
</script>

<style lang="scss">
  .el-titap-editor__search-panel {
    position: absolute;
    width: 380px;
    right: -1px;
    top: 40px;
    background: white;
    padding: 2px 10px 10px;
    border-radius: 4px;
    border: 1px solid #e4e4e4;
    z-index: 2001;

    .search-panel-wrap {
      font-size: 14px;

      .search-panel-header {
        position: relative;

        span {
          display: inline-block;
          border-bottom: 2px solid transparent;
          margin-right: 15px;
          width: 36px;
          height: 36px;
          line-height: 36px;
          text-align: center;
          cursor: pointer;

          &.active {
            border-bottom: 2px solid #409eff;
          }
        }

        .el-icon-close {
          position: absolute;
          top: 10px;
          right: 0;
          font-size: 16px;
          cursor: pointer;
        }
      }

      .el-input {
        width: 200px;
        margin-right: 6px;
      }

      button {
        border-radius: 4px;
        background: none;
        outline: none;
        cursor: pointer;

        &:hover {
          background: #f2f2f2;
        }
      }

      .search-input-wrap {
        display: flex;
        margin-top: 8px;

        button {
          width: 32px;
          border: none;
        }

        > span {
          margin: auto 0 auto 10px;
          font-size: 12px;
          color: #999;
        }

        .el-checkbox {
          margin: auto 10px;
        }
        .el-checkbox__label {
          font-size: 12px;
          font-weight: normal;
        }
      }

      .replace-input-wrap {
        display: flex;
        margin-top: 8px;

        button {
          width: 70px;
          margin-right: 5px;
          border: 1px solid #ededed;
          font-size: 12px;
        }
      }
    }
  }
</style>
