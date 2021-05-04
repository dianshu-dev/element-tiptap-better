<template>
  <div style="display: inline-block">
    <command-button
      :is-active="editorContext.isActive.link()"
      :readonly="et.isCodeViewMode"
      :command="openAddLinkDialog"
      :enable-tooltip="et.tooltip"
      :tooltip="et.t('editor.extensions.Link.add.tooltip')"
      icon="link"
    />

    <el-dialog
      :title="et.t('editor.extensions.Link.add.control.title')"
      :visible.sync="addLinkDialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      width="400px"
      custom-class="el-tiptap-edit-link-dialog"
      @close="closeAddLinkDialog"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="addLinkForm"
        label-position="right"
        size="small"
      >
        <el-form-item
          :label="et.t('editor.extensions.Link.add.control.text')"
          prop="text"
        >
          <el-input
            v-model="form.text"
            ref="linkTextInput"
            autocomplete="off"
            @keydown.native.enter.prevent="addLink"
          />
        </el-form-item>

        <el-form-item
          :label="et.t('editor.extensions.Link.add.control.href')"
          prop="href"
        >
          <el-input
            v-model="form.href"
            ref="linkHrefInput"
            autocomplete="off"
            @keydown.native.enter.prevent="addLink"
          />
        </el-form-item>

        <el-form-item prop="openInNewTab">
          <el-checkbox v-model="form.openInNewTab">
            {{ et.t('editor.extensions.Link.add.control.open_in_new_tab') }}
          </el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          size="small"
          round
          @click="closeAddLinkDialog"
        >
          {{ et.t('editor.extensions.Link.add.control.cancel') }}
        </el-button>

        <el-button
          type="primary"
          size="small"
          round
          @mousedown.prevent
          @click="addLink"
        >
          {{ et.t('editor.extensions.Link.add.control.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue, Watch, Ref } from 'vue-property-decorator';
import { Dialog, Form, FormItem, Input, Checkbox, Button, Message } from 'element-ui';
import { MenuData } from 'tiptap';
import CommandButton from '../CommandButton.vue';

@Component({
  components: {
    [Dialog.name]: Dialog,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Input.name]: Input,
    [Checkbox.name]: Checkbox,
    [Button.name]: Button,
    CommandButton,
  },
})
export default class AddLinkCommandButton extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Inject() readonly et!: any;

  form = { text: '', href: 'http://', openInNewTab: true };
  rules = {
    text: [
      { required: true, message: '请输入内容', trigger: 'blur' },
    ],
    href: [
      { required: true, message: '请输入链接', trigger: 'blur' },
    ],
  };

  addLinkDialogVisible = false;

  @Watch('editor.options.addLinkVisible')
  onAddLinkVisible (visible: boolean) {
    if (visible) this.addLinkDialogVisible = true;
  }

  @Watch('addLinkDialogVisible', { immediate: true })
  onDialogVisibleChange (visible: boolean) {
    if (!visible) return;
    this.form = { text: '', href: 'http://', openInNewTab: true };
    const { selection } = this.editor.state;
    if (selection.from !== selection.to) {
      if (Math.abs(selection.to - selection.from) > 255) {
        this.closeAddLinkDialog();
        Message.error('选择内容过长，最多255个字符');
        return;
      }
      const text = this.editor.state.doc.cut(selection.from, selection.to);
      this.form.text = text.textContent;
    }
    this.$nextTick(() => {
      if (!this.form.text) {
        this.linkTextInput.focus();
      } else {
        this.linkHrefInput.focus();
      }
    });
  }

  @Ref('addLinkForm') readonly addLinkForm!: any;
  @Ref('linkTextInput') readonly linkTextInput!: any;
  @Ref('linkHrefInput') readonly linkHrefInput!: any;

  private get editor () {
    return this.editorContext.editor;
  }

  private addLink () {
    this.addLinkForm.validate((valid: boolean) => {
      if (valid) {
        const { view, state } = this.editor;
        const { tr, selection } = state;
        const node = state.schema.nodeFromJSON({
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: { href: this.form.href, openInNewTab: this.form.openInNewTab },
            }
          ],
          text: this.form.text,
        });
        const transaction = tr.replaceWith(selection.from, selection.to, node);
        view.dispatch(transaction);
        view.focus();
        this.closeAddLinkDialog();
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  }

  private openAddLinkDialog () {
    this.addLinkDialogVisible = true;
  }

  private closeAddLinkDialog () {
    this.addLinkDialogVisible = false;
    this.editor.options.addLinkVisible = false;
  }
};
</script>
