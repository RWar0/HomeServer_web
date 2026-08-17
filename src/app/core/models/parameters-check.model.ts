export interface ParametersCheckListItem {
  id: string;
  ph?: number;
  kh?: number;
  gh?: number;
  no3?: number;
  no2?: number;
  temperature?: number;
  measuredAt: Date;
  aquariumId: string;
  aquariumName: string;
}

export interface CreateEditParametersCheckDto {
  aquariumId: string;
  ph?: number | null;
  kh?: number | null;
  gh?: number | null;
  no3?: number | null;
  no2?: number | null;
  temperature?: number | null;
  measuredAt: string;
}

export interface ParametersCheckListFiltersDto {
  aquariumId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
