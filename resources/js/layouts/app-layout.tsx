import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  headerProps?: {
    categories?: string[];
    hideGlobalFilter?: boolean;
    showCategoryFilter?: boolean;
  };
}

export default function AppLayout({ children, breadcrumbs, headerProps, ...props }: AppLayoutProps) {
  return (
    <AppLayoutTemplate
      breadcrumbs={breadcrumbs}
      headerProps={headerProps} // <-- pass the whole object
      {...props}
    >
      {children}
    </AppLayoutTemplate>
  );
}

