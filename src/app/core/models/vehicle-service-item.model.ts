export interface VehicleServiceItemDto {
  title: string;
  description?: string;
  cost?: string;
}

export interface CreateEditVehicleServiceItemDto {
  id: string | null;
  title: string;
  description: string | null;
  cost: number | null;
}
