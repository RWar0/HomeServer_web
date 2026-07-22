export interface AquariumListItem {
  id: string;
  name: string;
  volume: number;
  lastPhotoId?: string;
}

export interface CreateAquariumDto {
  name: string;
  volume: number;
  creationDate: string;
}
