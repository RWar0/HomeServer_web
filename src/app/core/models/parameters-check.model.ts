export interface ParametersCheckListItem {
  id: string;
  ph?: number;
  kh?: number;
  gh?: number;
  no3?: number;
  no2?: number;
  nh3?: number;
  po4?: number;
  fe?: number;
  temperature?: number;
  measuredAt: Date;
  measuredTime?: string;
  aquariumId: string;
  aquariumName: string;
}

export interface ParametersCheckInfoItem {
  id: string;
  ph?: number;
  kh?: number;
  gh?: number;
  no3?: number;
  no2?: number;
  nh3?: number;
  po4?: number;
  fe?: number;
  temperature?: number;
  measuredAt: Date;
  measuredTime?: string;
  aquariumName: string;
}

export interface CreateEditParametersCheckDto {
  aquariumId: string;
  ph?: number | null;
  kh?: number | null;
  gh?: number | null;
  no3?: number | null;
  no2?: number | null;
  nh3?: number | null;
  po4?: number | null;
  fe?: number | null;
  temperature?: number | null;
  measuredAt: string;
  measuredTime?: string | null;
}

export interface CreateEditParametersCheckForAquariumDto {
  ph?: number | null;
  kh?: number | null;
  gh?: number | null;
  no3?: number | null;
  no2?: number | null;
  nh3?: number | null;
  po4?: number | null;
  fe?: number | null;
  temperature?: number | null;
  measuredAt: string;
  measuredTime?: string | null;
}

export interface ParametersCheckListFiltersDto {
  aquariumId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
