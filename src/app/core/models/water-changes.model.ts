export interface AquariumWaterChangeListItem {
  id: string;
  amount: number;
  changeDate: Date;
}

export interface WaterChangeListItem {
  id: string;
  amount: number;
  changeDate: Date;
  aquariumId: string;
  aquariumName: string;
}

export interface CreateEditWaterChangeDto {
  amount: number;
  changeDate: string;
  aquariumId: string;
}

export interface CreateEditWaterChangeOfAquariumDto {
  amount: number;
  changeDate: string;
}

export interface WaterChangeListFiltersDto {
  aquariumId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
