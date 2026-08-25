export interface VehicleFuelingListItemDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
  vehicleName: string;
}

export interface VehicleFuelingForEditDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
}

export interface CreateEditVehicleDto {
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
}

export interface VehicleFuelingFilterDto {
  vehicleId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
