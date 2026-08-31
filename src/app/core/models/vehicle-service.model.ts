import { CreateEditVehicleServiceItemDto } from './vehicle-service-item.model';

export interface VehicleServiceListItemDto {
  id: string;
  title: string;
  date: Date;
  cost?: number;

  vehicleId: string;
  vehicleName: string;

  itemsCount: number;
}

export interface CreateEditVehicleServiceDto {
  title: string;
  date: Date;
  cost: number | null;
  vehicleId: string;

  items: CreateEditVehicleServiceItemDto[];
}

export interface VehicleServiceFilterDto {
  vehicleId: string | null;
  title: string | null;
  fromCost: number | null;
  toCost: number | null;
  fromDate: Date | null;
  toDate: Date | null;
}
