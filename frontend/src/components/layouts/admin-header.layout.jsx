import { SidebarTrigger } from '@/components/ui/sidebar';
import AccountMenu from '../account-menu';
import { useAuthContext } from '@/lib/providers/auth-context-provider';

const AdminHeader = () => {
  const { authenticatedUser } = useAuthContext();


  return (
    <header className="sticky top-0 z-10 flex items-center border-b h-14 bg-background">
      <div className="container px-4 flex items-center justify-between">
        <SidebarTrigger />
        <AccountMenu user={authenticatedUser.user} />
      </div>
    </header>
  );
};

export { AdminHeader };
