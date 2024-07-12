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
    GPT35Turbo0125 = 'gpt-3.5-turbo-0125',
    GPT35Turbo = 'gpt-3.5-turbo',
    GPT4o = 'gpt-4o',
}
