export interface AquariumListItem {
  id: string;
  name: string;
  volume: number;
  lastPhotoId?: string;
  lastWaterChange?: Date;
  lastParametersCheck?: Date;
}

export interface CreateAquariumDto {
  name: string;
  volume: number;
  creationDate: string;
}
