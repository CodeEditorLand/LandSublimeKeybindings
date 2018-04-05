import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { Importer } from './importer';
import { MappedSetting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';

export class HTMLPreviewEditor {

    constructor(context: vscode.ExtensionContext, private importer: Importer) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => this.open()));
    }

    private async open(sublimeSettingsPath?: vscode.Uri): Promise<void> {
        sublimeSettingsPath = sublimeSettingsPath || await sublimeFolderFinder.getExistingDefaultPaths();
        if (!sublimeSettingsPath) {
            return this.showBrowseButtonAsync({
                label: '$(issue-opened) No Sublime settings folder found. It\'s usually located here:',
                detail: sublimeFolderFinder.getOSDefaultPaths().join(' '),
            });
        }

        const mappedSettings: MappedSetting[] = await this.getSettings(sublimeSettingsPath.fsPath);
        if (!mappedSettings.length) {
            return await this.showBrowseButtonAsync({
                label: '$(issue-opened) No new settings to import from',
                detail: sublimeSettingsPath.fsPath,
            });
        }

        const pickedSettingNames: vscode.QuickPickItem[] | undefined = await vscode.window.showQuickPick(mappedSettings
            .map(this.setting2QuickPickItem), { canPickMany: true });
        if (pickedSettingNames) {
            const selSettings = pickedSettingNames.map(name => mappedSettings.find(set => this.setting2QuickPickItem(set).label === name.label)) as MappedSetting[];
            this.importSelectedSettings(selSettings);
        }
    }

    private async showBrowseButtonAsync(msgItem: vscode.QuickPickItem): Promise<void> {
        const browseString = 'Browse...';
        const browseItem: vscode.QuickPickItem = { label: browseString };
        const selectedItem: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick([msgItem, browseItem]);
        if (!selectedItem) {
            return undefined;
        }

        if (selectedItem.label === browseString) {
            this.pickFolder();
        }
    }

    private setting2QuickPickItem(setting: MappedSetting): vscode.QuickPickItem {
        return {
            detail: setting.isDuplicate
            ? `$(issue-opened) Overwrites existing value: ${setting.duplicateVscodeSetting && setting.duplicateVscodeSetting.value}`
            : '',
            label: `${setting.sublime.name} $(arrow-right) ${setting.vscode.name}`,
            picked: !setting.isDuplicate,
        };
    }
    private async pickFolder(): Promise<void> {
        const sublimeSettingsPath: vscode.Uri | undefined = await sublimeFolderFinder.pickSublimeSettings();
        if (sublimeSettingsPath) {
            this.open(sublimeSettingsPath);
        }
    }

    private async importSelectedSettings(selectedSettings: MappedSetting[]): Promise<void> {
        if (selectedSettings.length) {
            await this.importer.updateSettingsAsync(selectedSettings.map(selSettings => selSettings.vscode));
            await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        }
    }

    private async getSettings(sublimeSettingsPath: string): Promise<MappedSetting[]> {
        const importer = await this.importer;
        let settings: MappedSetting[] | undefined = await importer.getMappedSettingsAsync(await readFileAsync(sublimeSettingsPath, 'utf-8'));
        settings = settings.filter((s) => !MappedSetting.hasNoMatch(s));
        settings.sort((a, b) => {
            if (a.isDuplicate && b.isDuplicate) {
                return a.sublime.name.localeCompare(b.sublime.name);
            } else if (a.isDuplicate) {
                return -1;
            } else if (b.isDuplicate) {
                return 1;
            }
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        return settings;
    }
}
