<template>
  <command-button
    :command="confirm"
    :enable-tooltip="et.tooltip"
    :tooltip="tooltip"
    :icon="icon"
  />
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue, Inject } from 'vue-property-decorator';
import { Button, Popover, Input, Tooltip } from 'element-ui';
import { MenuData } from 'tiptap';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Input.name]: Input,
    [Tooltip.name]: Tooltip,
    CommandButton,
  },
})
export default class DragItemButton extends Vue {
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

  @Inject() readonly et!: any;

  @Emit('confirm')
  confirm (): void {
    this.editorContext.commands.drag_item();
  }
}
</script>
