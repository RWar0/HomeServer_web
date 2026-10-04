import { type BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, Directive, HOST_TAG_NAME, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDropdownMenuFocusOnHover } from './hlm-dropdown-menu-focus-on-hover';

@Directive({
  selector: '[hlmDropdownMenuItem],hlm-dropdown-menu-item',
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
    HlmDropdownMenuFocusOnHover,
  ],
  host: {
    'data-slot': 'dropdown-menu-item',
    '[attr.disabled]': '_isButton && disabled() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-inset]': 'inset() ? "" : null',
  },
})
export class HlmDropdownMenuItem {
  protected readonly _isButton = inject(HOST_TAG_NAME) === 'button';

  public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  public readonly variant = input<'default' | 'destructive' | 'primary' | 'secondary' | 'success'>(
    'default',
  );

  public readonly inset = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  constructor() {
    classes(
      () =>
        `hover:bg-accent 
      focus:bg-accent 
      hover:text-accent-foreground 
      focus:text-accent-foreground 
      
      data-[variant=destructive]:text-destructive 
      data-[variant=destructive]:hover:bg-destructive/5
      data-[variant=destructive]:focus:bg-destructive/5
      dark:data-[variant=destructive]:hover:bg-destructive/20 
      dark:data-[variant=destructive]:focus:bg-destructive/20 
      data-[variant=destructive]:hover:text-destructive 
      data-[variant=destructive]:focus:text-destructive 
      data-[variant=destructive]:*:[ng-icon]:text-destructive 
      
      
      data-[variant=primary]:text-primary 
      data-[variant=primary]:hover:bg-primary/5
      data-[variant=primary]:focus:bg-primary/5
      dark:data-[variant=primary]:hover:bg-primary/20 
      dark:data-[variant=primary]:focus:bg-primary/20 
      data-[variant=primary]:hover:text-primary 
      data-[variant=primary]:focus:text-primary 
      data-[variant=primary]:*:[ng-icon]:text-primary 
      
      data-[variant=secondary]:text-secondary 
      data-[variant=secondary]:hover:bg-secondary/5
      data-[variant=secondary]:focus:bg-secondary/5
      dark:data-[variant=secondary]:hover:bg-secondary/20 
      dark:data-[variant=secondary]:focus:bg-secondary/20 
      data-[variant=secondary]:hover:text-secondary 
      data-[variant=secondary]:focus:text-secondary 
      data-[variant=secondary]:*:[ng-icon]:text-secondary 
      
      data-[variant=success]:text-success-foreground 
      data-[variant=success]:hover:bg-success/5
      data-[variant=success]:focus:bg-success/5
      dark:data-[variant=success]:hover:bg-success/20 
      dark:data-[variant=success]:focus:bg-success/20 
      data-[variant=success]:hover:text-success-foreground 
      data-[variant=success]:focus:text-success-foreground 
      data-[variant=success]:*:[ng-icon]:text-success-foreground 
      
      data-[variant=default]:hover:**:text-accent-foreground 
      data-[variant=default]:focus:**:text-accent-foreground
      
      gap-1.5 
      rounded-md 
      px-1.5 
      py-1 
      text-sm 
      data-inset:ps-7 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] 
      group/dropdown-menu-item 
      relative 
      flex 
      w-full 
      cursor-default 
      items-center 
      outline-hidden 
      select-none 
      data-disabled:pointer-events-none 
      data-disabled:opacity-50 
      [&_ng-icon]:pointer-events-none 
      [&_ng-icon]:shrink-0`,
    );
  }
}
