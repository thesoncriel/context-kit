export const entry: string;
export namespace module {
    const rules: {
        test: RegExp;
        use: string;
        exclude: RegExp;
    }[];
}
export namespace resolve {
    const extensions: string[];
}
export namespace output {
    const filename: string;
    const path: string;
}
