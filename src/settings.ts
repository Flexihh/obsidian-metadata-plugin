import { App, PluginSettingTab, Setting } from "obsidian";

// Typen für die Plugin-Einstellungen
export interface Action {
    name: string;
    command: string;
    isSubmenu: boolean;
    showInCommandPalette: boolean;
}

export interface MetadataPluginSettings {
    actions: Action[];
}

// Standardwerte für die Einstellungen
export const DEFAULT_SETTINGS: MetadataPluginSettings = {
    actions: [
        { name: "Copy to Clipboard", command: "editor.copy", isSubmenu: false, showInCommandPalette: true },
        { name: "Custom Action", command: "editor.paste", isSubmenu: true, showInCommandPalette: false },
    ],
};

export class MetadataPluginSettingTab extends PluginSettingTab {
    plugin: any; // Typisiere dies spezifischer, falls die Plugin-Klasse bekannt ist

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl("h2", { text: "Metadata Plugin Settings" });

        // Tab-Navigation erstellen
        const tabContainer = containerEl.createDiv({ cls: "tab-container" });
        const tabNav = tabContainer.createDiv({ cls: "tab-nav" });
        const tabContent = tabContainer.createDiv({ cls: "tab-content" });

        const tabs = [
            { id: "general", label: "General Settings", render: () => this.renderGeneralSettings(tabContent) },
            { id: "actions", label: "Actions", render: () => this.renderActionsSettings(tabContent) },
        ];

        // Tabs initialisieren
        tabs.forEach((tab, index) => {
            const tabButton = tabNav.createEl("button", { text: tab.label, cls: "tab-button" });
            tabButton.addEventListener("click", () => {
                this.activateTab(tab.id, tabs, tabContent);
                tab.render();
            });

            // Beim ersten Tab automatisch aktivieren
            if (index === 0) {
                tabButton.classList.add("active");
                tab.render();
            }
        });
    }

    private activateTab(
        activeTabId: string,
        tabs: { id: string; label: string; render: () => void }[],
        tabContent: HTMLElement
    ): void {
        // Alle Buttons und Inhalte zurücksetzen
        const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
        tabButtons.forEach((btn) => btn.classList.remove("active"));

        // Aktivierten Button hervorheben
        const activeButton = document.querySelector(`.tab-nav .tab-button:nth-child(${tabs.findIndex((t) => t.id === activeTabId) + 1})`);
        if (activeButton) activeButton.classList.add("active");

        // Inhalt leeren
        tabContent.empty();
    }

    private renderGeneralSettings(container: HTMLElement): void {
        container.empty();
        container.createEl("h3", { text: "General Settings" });

        // Beispiel: Andere allgemeine Einstellungen
        new Setting(container)
            .setName("Example Setting")
            .setDesc("This is an example of a general setting.")
            .addToggle((toggle) =>
                toggle.setValue(true).onChange((value) => {
                    console.log("General setting changed:", value);
                })
            );
    }

    private renderActionsSettings(container: HTMLElement): void {
        container.empty();
        container.createEl("h3", { text: "Actions Settings" });

        // Actions anzeigen
        this.plugin.settings.actions.forEach((action: Action, index: number) => {
            this.createActionSetting(container, action, index);
        });

        // Dropdown zur Auswahl des Typs für neue Action
        const actionTypeDropdown = new Setting(container)
            .setName("Add New Action")
            .addDropdown((dropdown) => {
                dropdown.addOption("category", "Copy Metadata Category to Clipboard");
                dropdown.addOption("image", "Copy Metadata Image to Clipboard");
                dropdown.setValue("category");
            })
            .addButton((btn) =>
                btn
                    .setButtonText("Add")
                    .setCta()
                    .onClick(async () => {
                        const selectElement = actionTypeDropdown.settingEl.querySelector("select");
                        if (selectElement) {
                            const selectedType = selectElement.value;
                            const newAction: Action = {
                                name: "",
                                command:
                                    selectedType === "category"
                                        ? "metadata.copyCategory"
                                        : "metadata.copyImage",
                                isSubmenu: false,
                                showInCommandPalette: true,
                            };

                            this.plugin.settings.actions.push(newAction);
                            await this.plugin.saveSettings();
                            this.renderActionsSettings(container); // Aktualisiere die Ansicht
                        }
                    })
            );
    }

    private createActionSetting(container: HTMLElement, action: Action, index: number): void {
        const actionContainer = container.createDiv({ cls: "action-container" });

        new Setting(actionContainer)
            .setName(`Action ${index + 1}`)
            .addText((text) =>
                text.setValue(action.name).onChange(async (value) => {
                    action.name = value;
                    await this.plugin.saveSettings();
                })
            )
            .addDropdown((dropdown) => {
                dropdown.addOption("", "Select Command");
                const commands = (this.app as ExtendedApp).commands.commands;
                Object.keys(commands).forEach((commandId) => {
                    dropdown.addOption(commandId, commands[commandId]?.name || commandId);
                });
                dropdown.setValue(action.command);
                dropdown.onChange(async (value) => {
                    action.command = value;
                    await this.plugin.saveSettings();
                });
            })
            .addButton((btn) =>
                btn
                    .setButtonText("Delete")
                    .setCta()
                    .onClick(async () => {
                        this.plugin.settings.actions.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.renderActionsSettings(container);
                    })
            );
    }
}
