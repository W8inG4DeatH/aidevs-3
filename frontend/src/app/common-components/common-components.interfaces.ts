export interface IAiFile {
    Name: string;
    FullPath: string;
    BackendFullPath?: string;
    UpdateTime?: Date;
    Content?: string;
    InputTokens?: number;
    OutputTokens?: number;
    CostInDollars?: number;
    Selected?: boolean;
    Processed?: boolean;
    Done?: boolean;
}

export enum IOpenAIModel {
    GPT4oMini = 'gpt-4o-mini',
    GPT4o = 'gpt-4o',
    O1Preview = 'o1-preview',
    SpeechToText = 'whisper-1',
}
