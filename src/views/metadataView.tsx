import { ItemView } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from '../App';
import { Toaster } from 'sonner';

export const VIEW_TYPE_METADATA = 'metadata-view';

export class MetadataView extends ItemView {
  private root: Root | null = null;
  private noticeRoot: Root | null = null;

  private toasterEl = document.body.createEl('div');

  getViewType(): string {
    return VIEW_TYPE_METADATA;
  }

  getDisplayText(): string {
    return 'Metadata View';
  }

  getIcon(): string {
    return 'calendar';
  }

  async onOpen(): Promise<void> {
    this.contentEl.toggleClass('custom-next', true);
    this.root = createRoot(this.contentEl);
    this.root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Use for calling sonner or toaster
    this.noticeRoot = createRoot(this.toasterEl);
    this.noticeRoot.render(
      <Toaster 
        richColors 
        theme={document.body.hasClass('theme-dark') ? 'dark' : 'light'} 
      />
    );
  }

  async onunload(): Promise<void> {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.noticeRoot) {
      this.noticeRoot.unmount();
      this.noticeRoot = null;
    }
    this.toasterEl?.detach();
    await super.onunload();
  }
}