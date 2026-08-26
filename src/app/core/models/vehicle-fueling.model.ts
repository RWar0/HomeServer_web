export interface VehicleFuelingListItemDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
  vehicleName: string;
}

export interface VehicleFuelingOfVehicleListItemDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
}

export interface VehicleFuelingForEditDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
}

export interface VehicleFuelingForEditWithoutVehicleDto {
  id: string;
  quantity: number;
  cost?: number;
  date: Date;
}

export interface CreateEditVehicleFuelingDto {
  quantity: number;
  cost?: number;
  date: Date;
  vehicleId: string;
}

export interface CreateEditVehicleFuelingForVehicleDto {
  quantity: number;
  cost?: number;
  date: Date;
}

export interface VehicleFuelingFilterDto {
  vehicleId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}
