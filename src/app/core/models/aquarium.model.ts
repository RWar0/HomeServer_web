export interface AquariumListItem {
  id: string;
  name: string;
  volume: number;
  lastPhotoId?: string;
  lastWaterChange?: Date;
  lastParametersCheck?: Date;
}

export interface CreateEditAquariumDto {
  name: string;
  volume: number;
  creationDate: string;
}
