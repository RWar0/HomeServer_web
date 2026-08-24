import { ApplicationRef, Component, inject, resource, signal } from '@angular/core';
import { RefreshListButton } from '../../../../components/common/refresh-list-button/refresh-list-button';
import { UserService } from '../../../../core/services/users/user.service';
import { PaginationStore } from '../../../../core/stores/pagination.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideKeyRound, lucideNotebookPen, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { syncPaginationQueryParams } from '../../../../core/helpers/pagination-query-sync';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../../constants/empty-pagination-state';
import { UserListItem } from '../../../../core/models/user.model';
import { TableColumn } from '../../../../core/models/data-table.model';
import { translateRole } from '../../../../core/helpers/role-translator';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { Pagination } from '../../../../components/common/pagination/pagination';
import { DataTable } from '../../../../components/data-table/data-table/data-table';
import { DeleteConfirmDialog } from '../../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { UserCreateDialog } from '../../../../components/users/user-create-dialog/user-create-dialog';
import { RolesEnum } from '../../../../core/enums/roles.enum';
import { UserEditDialog } from '../../../../components/users/user-edit-dialog/user-edit-dialog';
import { UserEditPasswordDialog } from '../../../../components/users/user-edit-password-dialog/user-edit-password-dialog';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-user-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    UserCreateDialog,
    UserEditDialog,
    UserEditPasswordDialog,
  ],
  templateUrl: './user-list-page.html',
  styleUrl: './user-list-page.css',
  providers: [
    PaginationStore,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideKeyRound }),
  ],
})
export class UserListPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly userService = inject(UserService);
  protected readonly paginationStore = inject(PaginationStore);
  private readonly authService = inject(AuthService);

  // Signals
  private readonly refreshSignal = signal(0);
  protected readonly currentUserName = this.authService.user()?.name ?? '';

  // Table columns
  protected readonly userColumns: TableColumn<UserListItem>[] = [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'name',
      label: 'Imię i nazwisko',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rola',
      sortable: true,
      format: (value) => {
        return translateRole(value as unknown as RolesEnum);
      },
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'username',
      label: 'Nazwa użytkownika',
      sortable: true,
    },
  ];

  constructor() {
    syncPaginationQueryParams();
  }

  // Resources
  protected readonly usersList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.userService.getAll(params.paginationState).pipe(
          tap((res) => {
            this.paginationStore.setPagination(res.pagination);
          }),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<UserListItem>());
          }),
        ),
      ),
  });

  protected get userRecords(): UserListItem[] {
    return this.usersList.value()?.data ?? [];
  }

  // Methods
  refreshList() {
    this.refreshSignal.update((value) => value + 1);
  }

  // Row actions
  protected onDelete(userId: string): void {
    if (!userId) {
      toast.error('Brak danych', { description: 'Identyfikator użytkownika jest wymagany' });
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (error) => {
        displayApiError(error);
      },
    });
  }
}
