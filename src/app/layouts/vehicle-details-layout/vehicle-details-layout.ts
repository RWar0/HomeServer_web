import { ApplicationRef, Component, inject, input, resource } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { VehicleService } from '../../core/services/vehicles/vehicle.service';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../core/helpers/error-handler';
import { VehicleBaseDataDto } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-details-layout',
  imports: [RouterLink, RouterLinkActive, HlmButtonImports, RouterOutlet],
  templateUrl: './vehicle-details-layout.html',
  styleUrl: './vehicle-details-layout.css',
})
export class VehicleDetailsLayout {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  // Signals
  protected readonly vehicleId = input.required<string>();

  // Resources
  protected readonly vehicle = resource({
    params: () => ({
      vehicleId: this.vehicleId(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.vehicleService.getBaseData(params.vehicleId).pipe(
          catchError((err) => {
            displayApiError(err);
            this.appRef.tick();
            this.router.navigate(['/vehicles']);
            return of({
              id: params.vehicleId,
              brand: 'Brak danych',
              model: 'Brak danych',
              production: 0,
            });
          }),
        ),
      ),
  });

  protected get vehicleRecord(): VehicleBaseDataDto {
    return (
      this.vehicle.value() ?? {
        id: this.vehicleId(),
        brand: 'Brak danych',
        model: 'Brak danych',
        production: 0,
      }
    );
  }
}
