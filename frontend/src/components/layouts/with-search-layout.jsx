import Search from '@/features/search';
import { Outlet } from 'react-router';

const WithSearchLayout = () => {
  return (
    <div>
      <div className="bg-gradient-to-b from-brand from-50% to-transparent to-50%">
        <Search />
      </div>
      <Outlet />
    </div>
  );
}

export default WithSearchLayout