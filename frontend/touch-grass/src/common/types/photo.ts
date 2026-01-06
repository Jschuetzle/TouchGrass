export type ImageAsset = {
    id: string;
    content_type?: string;
    size?: number;
}

export type ImageAssetWithId = {
    uri: string;
    asset: ImageAsset;
}