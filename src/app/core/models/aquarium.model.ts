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

export interface AquariumDetailsDto {
  id: string;
  name: string;
  volume: number;
  creationDate: Date;
  photosCount: number;
  lastPhotoId?: string;
  lastWaterChange?: Date;
  lastParametersCheck?: Date;
}

export interface AquariumPhotoDto {
  id: string;
  originalName: string;
  createdBy: string;
  createdAt: Date;
}

export interface AquariumPhotoWithMetadata {
  id: string;
  originalName: string;
  createdBy: string;
  createdAt: Date;
  imageUrl: string | null;
}
