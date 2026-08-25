const vehicleTypeTranslations: Record<string, string> = {
  Car: 'Samochód',
  Motorcycle: 'Motocykl',
};

/**
 * Translates a vehicle type to a more user-friendly format.
 *
 * @param type - The vehicle type to translate.
 * @returns string - The translated vehicle type.
 *
 * @example
 * const translatedType = translateVehicleType('Car');
 */
export function translateVehicleType(type: string) {
  return vehicleTypeTranslations[type] ?? type;
}
