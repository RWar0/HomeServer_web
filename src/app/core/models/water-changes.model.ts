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
}
