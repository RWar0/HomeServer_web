export interface VehicleServiceItemDto {
  id: string;
  title: string;
  description?: string;
  cost?: number;
}

export interface CreateEditVehicleServiceItemDto {
  id: string | null;
  title: string;
  description: string | null;
  cost: number | null;
}
