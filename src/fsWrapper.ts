import * as fs from 'fs';

export async function pathExists(stringPath: string): Promise<boolean> {
    try {
        await fsAccess(stringPath, fs.constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function fsAccess(stringPath: string, checks: number): Promise<any> {
    return promisifier(fs.access, stringPath, checks);
}

// adapted from vs/base/common/async
export function promisifier<T>(fn: Function, ...args: any[]): Promise<T> {
    return new Promise((c, e) => fn(...args, (err: any, result: any) => err ? e(err) : c(result)));
}

export async function readFileAsync(filePath: string, encoding?: string): Promise<string> {
    return await promisifier<string>(fs.readFile, filePath, encoding);
}
