import { Role } from './role.type';

interface SidebarItem {
  title: string;
  url: string;
  icon?: string;
}

export interface SidebarSection {
  title?: string;
  icon?: string;
  roles?: Role[];
  items: SidebarItem[];
}
