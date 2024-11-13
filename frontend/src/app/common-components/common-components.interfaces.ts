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
    DallE3 = 'dall-e-3',
    SpeechToText = 'whisper-1',
}

export enum ImageModelSizeEnum {
    Landscape = '1792x1024',
    Quad = '1024x1024',
    Portrait = '1024x1792',
}

export enum ImageModelQualityEnum {
    Standard = 'standard',
    HD = 'hd',
}
