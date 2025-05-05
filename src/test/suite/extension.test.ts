import * as assert from 'assert';
import { Mapper } from '../../mapper';
import { ISetting, MappedSetting, CategorizedSettings, VscodeSetting } from '../../settings';
import * as testData from './testData';

suite('Importer Tests', async () => {

    const expected = new Map<string, MappedSetting>([
        ['numberSetting', new MappedSetting({ name: 'tab_size$test', value: 12 }, new VscodeSetting('editor.tabSize$test', 12))],
        ['stringSetting', new MappedSetting({ name: 'word_separators$test', value: "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?" }, new VscodeSetting('editor.wordSeparators$test', "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?"))],
        ['boolSetting', new MappedSetting({ name: 'ensure_newline_at_eof_on_save$test', value: false }, new VscodeSetting('files.insertFinalNewline$test', false))],
        ['complexSetting', new MappedSetting({ name: 'draw_white_space$test', value: 'boundary' }, new VscodeSetting('editor.renderWhitespace$test', 'boundary'))],
    ]);

    test('Import different types', async () => {
        const mapper: Mapper = new Mapper({ mappings: testData.testMappings, defaults: [] });
        const settings: CategorizedSettings = await mapper.getMappedSettings(JSON.stringify(testData.sublimeSettings.mapped));
        assert.ok(settings.mappedSettings.length === 4, `mappedSettings.length is ${settings.mappedSettings.length} instead of 4`);
        expected.forEach((expSetting) => {
            const setting = settings.mappedSettings.find(m => m.sublime.name === expSetting.sublime.name);
            if (!setting) {
                assert.fail(JSON.stringify(expSetting), 'Could not find mapped setting');
            } else {
                assert.ok(setting.vscode.name === expSetting.vscode.name
                    && setting.vscode.value === expSetting.vscode.value,
                    `Setting ${setting.vscode.name}: ${setting.vscode.value} failed`);
            }
        });
    });

    const alreadyExistingVsSettings: ISetting[] = [
        { name: 'editor.sameKeySameValue', value: testData.sublimeSettings.mappedSpecialCases.sameKeyVal.sameKeySameValue },
        { name: 'editor.sameKeyDiffVal', value: testData.sublimeSettings.mappedSpecialCases.sameKeyDiffVal.sameKeyDiffVal + 'different' },
    ];

    test('Categorization of settings works', async () => {
        const mockConfig = {
            inspect: ((s: string) => {
                const foundSetting: ISetting | undefined = alreadyExistingVsSettings.find((setting) => setting.name === s);
                if (foundSetting) {
                    return { globalValue: foundSetting.value };
                }
                return undefined;
            }),
        };

        const defaultSettings = [
            new VscodeSetting(testData.testMappings.tab_size$test, 6),  // already exists in sublime settings and should be removed
            new VscodeSetting('thisShouldStay', true),
        ];

        const mapper: Mapper = new Mapper({ mappings: testData.testMappings, defaults: defaultSettings }, mockConfig);
        const sublimeSettings = JSON.stringify({ ...testData.sublimeSettings.mapped, ...testData.sublimeSettings.mappedSpecialCases.sameKeyDiffVal, ...testData.sublimeSettings.mappedSpecialCases.sameKeyVal, ...testData.sublimeSettings.noMapping });
        const settings: CategorizedSettings = await mapper.getMappedSettings(sublimeSettings);

        assert.ok(settings.alreadyExisting.length === 1, 'settings.alreadyExisting.length === 1');
        assert.ok(settings.noMappings.length === 1, 'settings.noMappings.length === 1');
        assert.ok(settings.mappedSettings.filter(s => s.vscode.overwritesValue).length === 1, 'settings.mappedSettings.filter(s => s.vscode.overwritesValue).length === 1');
        assert.ok(settings.defaultSettings.length === 1, 'settings.defaultSettings.length === 1');
        assert.ok(settings.defaultSettings[0].name === 'thisShouldStay', "settings.defaultSettings[0].name === 'thisShouldStay'");
    });
});
