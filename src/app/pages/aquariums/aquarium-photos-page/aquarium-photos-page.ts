import {
  Component,
  inject,
  input,
  resource,
  ApplicationRef,
  ResourceRef,
  signal,
} from '@angular/core';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { Pagination } from '../../../components/common/pagination/pagination';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { catchError, firstValueFrom, forkJoin, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { FilesService } from '../../../core/services/files/files.service';
import { AquariumPhotoWithMetadata } from '../../../core/models/aquarium.model';
import { AquariumDetailsPhotoCard } from '../../../components/aquariums/aquarium-details-photo-card/aquarium-details-photo-card';
import { toast } from '@spartan-ng/brain/sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { AquariumUploadPhotoDialog } from '../../../components/aquariums/aquarium-upload-photo-dialog/aquarium-upload-photo-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';

@Component({
  providers: [PaginationStore, provideIcons({ lucidePlus })],
  selector: 'app-aquarium-photos-page',
  imports: [
    HlmPaginationImports,
    HlmButtonImports,
    Pagination,
    AquariumDetailsPhotoCard,
    NgIcon,
    AquariumUploadPhotoDialog,
  ],
  templateUrl: './aquarium-photos-page.html',
  styleUrl: './aquarium-photos-page.css',
})
export class AquariumPhotosPage {
  private readonly aquariumService = inject(AquariumService);
  private readonly filesService = inject(FilesService);
  private readonly appRef = inject(ApplicationRef);

  protected readonly paginationStore = inject(PaginationStore);

  protected readonly aquariumId = input.required<string>();

  protected readonly refreshSignal = signal(0);

  constructor() {
    syncPaginationQueryParams();
  }

  protected readonly photosMetadataResponse = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.aquariumService.getAquariumPhotos(this.aquariumId(), params.paginationState).pipe(
          tap((res) => {
            this.paginationStore.setPagination(res.pagination);
          }),
          catchError((imagesMetadataErr) => {
            this.paginationStore.reset();
            displayApiError(imagesMetadataErr);
            this.appRef.tick();
            return of(emptyPaginatedResponse<AquariumPhotoWithMetadata>());
          }),
        ),
      ),
  });

  protected readonly photosResponse: ResourceRef<AquariumPhotoWithMetadata[]> = resource({
    params: () => this.photosMetadataResponse.value(),
    loader: async ({ params }) => {
      if (!params || !params.data || params.data.length === 0) {
        return [];
      }

      const blobs = await firstValueFrom(
        forkJoin(
          params.data.map((photo) =>
            this.filesService.getImageById(photo.id).pipe(
              catchError((imageFetchErr) => {
                displayApiError(imageFetchErr);
                return of(null);
              }),
            ),
          ),
        ).pipe(
          catchError((err) => {
            displayApiError(err);
            this.appRef.tick();
            return of([]);
          }),
        ),
      );

      return params.data.map((photo, index) => ({
        ...photo,
        imageUrl: blobs[index] ? URL.createObjectURL(blobs[index]) : null,
      }));
    },

    defaultValue: [],
  });

  protected deletePhoto(photoId: string) {
    this.aquariumService.deletePhoto(this.aquariumId(), photoId).subscribe({
      next: (res) => {
        this.refreshSignal.update((value) => value + 1);
        toast.success(res.message);
      },
      error: (err) => {
        displayApiError(err);
      },
    });
  }
}
