export interface Tag {
  key: string;
  name: string;
  color: string;
}

export interface LoadedTags {
  tags: Tag[];
  otherLines: string[];
  exists: boolean;
}
