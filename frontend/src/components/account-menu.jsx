import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Link } from 'react-router';
import Icon from './ui/icon';
import { PATHS } from '@/config/path.config';
import { LinkWithIcon } from './ui/link';
import useLogoutHandler from '@/app/auth/hooks/use-logout';
import { getDefaultProfile, isAdmin } from '@/lib/utils';

const AccountMenu = ({ user }) => {
  const { logoutHandler, pending } = useLogoutHandler();
  const isAdmin2 = isAdmin(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={getDefaultProfile(user.name)}
            alt={`Profile image for ${user.name}`}
          />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[230px] py-3 px-2 border-border">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2 px-1">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${user.name}`}
                alt={`Profile image for ${user.name}`}
              />
              <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 flex-1">
              <h4 className="text-sm font-medium max-w-[150px] truncate">
                {user.name}
              </h4>
              <p className="max-w-[150px] truncate text-muted-foreground text-xs">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-3" />
        {isAdmin2 && (
          <DropdownMenuItem>
            <Button
              asChild
              variant="ghost"
              className="w-full flex justify-start"
            >
              <Link
                to={PATHS.ADMIN.LIST_HOTELS}
                className="flex items-center justify-start gap-2"
              >
                <Icon icon="dashboard" size={20} />
                <span>Admin Dashboard</span>
              </Link>
            </Button>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Button asChild variant="ghost" className="w-full flex justify-start">
            <Link
              to={PATHS.PROFILE}
              className="flex items-center justify-start gap-2"
            >
              <Icon icon="user" size={20} />
              <span>My Profile</span>
            </Link>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LinkWithIcon
            icon="bookingHistory"
            variant="ghost"
            className="w-full flex justify-start"
            to={PATHS.BOOKING_HISTORY}
          >
            My Bookings
          </LinkWithIcon>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            onClick={logoutHandler}
            disabled={pending}
            variant="ghost"
            className="w-full flex justify-start"
          >
            <div className="flex items-center justify-start gap-2">
              <Icon icon="logout" size={20} />
              <span>Logout</span>
            </div>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
