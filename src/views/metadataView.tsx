import { App } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Metadata } from '../metadata';
import { MetadataManager } from '../../src/metadata/api/metadataManager';
import { getFileTypeFromPath } from '../../src/metadata/utils/fileHelpers';

export class MetadataView {
    private app: App;
    private root: Root | null = null;
    private metadataManager: MetadataManager;
    private currentFilePath: string | null = null;
    private debug: boolean = true;

    constructor(app: App) {
        this.app = app;
        this.metadataManager = new MetadataManager(app);
        this.log('MetadataView initialized');
    }

    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[MetadataView]', ...args);
        }
    }

    private error(...args: any[]): void {
        console.error('[MetadataView]', ...args);
    }

    async render(container: HTMLElement, filePath: string): Promise<void> {
        this.log('Rendering view for path:', filePath);
        
        // Prüfen ob bereits eine Instanz existiert
        const existingContent = container.querySelector('.metadata-content');
        if (existingContent) {
            this.log('Removing existing content');
            existingContent.remove();
        }
        
        this.currentFilePath = filePath;

        try {
            // Dateipfad bereinigen
            const sanitizedFilePath = this.sanitizeFilePath(filePath);
            this.log('Sanitized path:', sanitizedFilePath);

            // Dateityp ermitteln und validieren
            const fileType = getFileTypeFromPath(sanitizedFilePath);
            if (!fileType) {
                throw new Error('Invalid file path: Could not determine file type.');
            }
            this.log('Detected file type:', fileType);

            // Metadaten abrufen
            this.log('Fetching metadata...');
            const metadata = await this.metadataManager.getAllMetadata(sanitizedFilePath, fileType);
            this.log('Full metadata:', metadata);

            // Subjects extrahieren
            const subjects = await this.metadataManager.getMetadataTypeByFile(
                sanitizedFilePath,
                fileType,
                'subject',
                true
            );
            this.log('Extracted subjects:', subjects);

            // Container erstellen und React-Komponente rendern
            const metadataContent = document.createElement('div');
            metadataContent.classList.add('metadata-content');
            container.appendChild(metadataContent);

            this.root = createRoot(metadataContent);
            this.root.render(
                <React.StrictMode>
                    <ErrorBoundary onError={this.handleError}>
                        <Metadata 
                            app={this.app} 
                            metadata={metadata}
                            subjects={subjects} 
                            filePath={sanitizedFilePath}
                            onError={this.handleError}
                        />
                    </ErrorBoundary>
                </React.StrictMode>
            );

            this.log('View rendered successfully');
        } catch (error) {
            this.error('Error rendering view:', error);
            this.handleRenderError(container, error);
        }
    }

    private handleError = (error: Error): void => {
        this.error('Component error:', error);
        // Hier könnten weitere Fehlerbehandlungen implementiert werden
    };

    private handleRenderError(container: HTMLElement, error: any): void {
        // Existierende Fehleranzeige entfernen
        const existingError = container.querySelector('.metadata-error');
        if (existingError) {
            existingError.remove();
        }

        const errorContent = document.createElement('div');
        errorContent.classList.add('metadata-error');
        errorContent.innerHTML = `
            <div class="metadata-error-content">
                <h3>Error Loading Metadata</h3>
                <p>${error.message || 'An unknown error occurred'}</p>
                ${error.stack ? `<pre>${error.stack}</pre>` : ''}
            </div>
        `;
        container.appendChild(errorContent);
    }

    private sanitizeFilePath(filePath: string): string {
        try {
            return filePath.split('?')[0].trim();
        } catch (error) {
            this.error(`Error sanitizing path "${filePath}":`, error);
            return filePath;
        }
    }

    unload(): void {
        this.log('Unloading view');
        if (this.root) {
            try {
                this.root.unmount();
                this.root = null;
                this.log('React root unmounted');
            } catch (error) {
                this.error('Error unmounting React root:', error);
            }
        }
        this.currentFilePath = null;
    }

    getCurrentFilePath(): string | null {
        return this.currentFilePath;
    }
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Metadata component error:', error, errorInfo);
        this.props.onError?.(error);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="metadata-error-boundary">
                    <h3>Component Error</h3>
                    <p>{this.state.error?.message || 'An unknown error occurred'}</p>
                    {this.state.error?.stack && (
                        <pre className="error-stack">{this.state.error.stack}</pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}