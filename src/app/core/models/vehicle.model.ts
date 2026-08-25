import { VehicleType } from '../enums/vehicle-type.enum';

export interface VehicleListItemDto {
  id: string;
  brand: string;
  model: string;
  production: number;
  type: VehicleType;
}

export interface VehicleForEditDto {
  id: string;
  brand: string;
  model: string;
  production: number;
  type: VehicleType;
}

export interface CreateEditVehicleDto {
  brand: string;
  model: string;
  production: number;
  type: VehicleType;
}
