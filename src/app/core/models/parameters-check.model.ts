export interface ParametersCheckListItem {
  id: string;
  ph?: number;
  kH?: number;
  gH?: number;
  nO3?: number;
  nO2?: number;
  temperature?: number;
  measuredAt: Date;
  aquariumId: string;
  aquariumName: string;
}

export interface AddEditParametersCheckDto {
  aquariumId: string;
  ph?: number;
  kH?: number;
  gH?: number;
  nO3?: number;
  nO2?: number;
  temperature?: number;
  measuredAt: Date;
}

export interface ParametersCheckListFiltersDto {
  aquariumId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
