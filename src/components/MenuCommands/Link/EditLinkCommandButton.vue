<template>
  <div>
    <command-button
      :command="openEditLinkDialog"
      :enable-tooltip="et.tooltip"
      :tooltip="et.t('editor.extensions.Link.edit.tooltip')"
      icon="edit"
    />

    <el-dialog
      :title="et.t('editor.extensions.Link.edit.control.title')"
      :visible.sync="editLinkDialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      width="400px"
      custom-class="el-tiptap-edit-link-dialog"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="editLinkForm"
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
            @keydown.native.enter.prevent="updateLinkAttrs"
          />
        </el-form-item>

        <el-form-item
          :label="et.t('editor.extensions.Link.edit.control.href')"
          prop="href"
        >
          <el-input
            v-model="form.href"
            ref="linkHrefInput"
            autocomplete="off"
            @keydown.native.enter.prevent="updateLinkAttrs"
          />
        </el-form-item>

        <el-form-item prop="openInNewTab">
          <el-checkbox v-model="form.openInNewTab">
            {{ et.t('editor.extensions.Link.edit.control.open_in_new_tab') }}
          </el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          size="small"
          round
          @click="closeEditLinkDialog"
        >
          {{ et.t('editor.extensions.Link.edit.control.cancel') }}
        </el-button>

        <el-button
          type="primary"
          size="small"
          round
          @mousedown.prevent
          @click="updateLinkAttrs"
        >
          {{ et.t('editor.extensions.Link.edit.control.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue, Ref } from 'vue-property-decorator';
import { Dialog, Form, FormItem, Input, Checkbox, Button } from 'element-ui';
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
export default class EditLinkCommandButton extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  readonly editorContext!: MenuData;

  @Prop({
    type: Object,
    required: true,
  })
  readonly initLinkAttrs!: object;

  @Inject() readonly et!: any;

  @Ref('editLinkForm') readonly editLinkForm!: any;
  @Ref('linkTextInput') readonly linkTextInput!: any;
  @Ref('linkHrefInput') readonly linkHrefInput!: any;

  form = { text: '', href: '', openInNewTab: true };
  rules = {
    text: [
      { required: true, message: '请输入内容', trigger: 'blur' },
      { max: 255, message: '最多 255 个字符', trigger: 'blur' },
    ],
    href: [
      { required: true, message: '请输入链接', trigger: 'blur' },
      { max: 2083, message: '最多 2083 个字符', trigger: 'blur' },
    ],
  };

  editLinkDialogVisible = false;

  private get editor () {
    return this.editorContext.editor;
  }

  private updateLinkAttrs () {
    this.editLinkForm.validate((valid: boolean) => {
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
        this.closeEditLinkDialog();
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  }

  private openEditLinkDialog () {
    Object.assign(this.form, this.initLinkAttrs);
    this.form.text = '';
    const { selection } = this.editor.state;
    if (selection.from !== selection.to) {
      const text = this.editor.state.doc.cut(selection.from, selection.to);
      this.form.text = text.textContent;
    }
    this.editLinkDialogVisible = true;
    this.$nextTick(() => {
      this.linkHrefInput.focus();
    });
  }

  private closeEditLinkDialog () {
    this.editLinkDialogVisible = false;
  }
};
</script>
