import { Role } from './role.type';

interface SidebarBaseItem {
  title: string;
  url: string;
  icon?: string;
}

interface SidebarItem {
  title: string;
  url: string;
  icon?: string;
  subItems?: SidebarBaseItem[];
}

export interface SidebarSection {
  title?: string;
  icon?: string;
  roles?: Role[];
  items: SidebarItem[];
}
