export interface ISetting {
  readonly name: string;
  readonly value: any;
}

export class VscodeSetting implements ISetting {
  public overwritesValue?: boolean;
  public oldValue?: any;

  constructor(public readonly name: string, public readonly value: any) { }

  public markAsOverride(oldValue: any): void {
    this.overwritesValue = true;
    this.oldValue = oldValue;
  }
}

export class MappedSetting {
  constructor(public readonly sublime: ISetting, public readonly vscode: VscodeSetting) {}
}

export class CategorizedSettings {
  public mappedSettings: MappedSetting[] = [];
  public alreadyExisting: MappedSetting[] = [];
  public noMappings: ISetting[] = [];
  public defaultSettings: VscodeSetting[] = [];   // default sublime settings that are not in the mappings file but improve the sublime feel & look in VS Code
}
