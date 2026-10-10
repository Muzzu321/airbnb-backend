import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DURATION_FILTER_OPTIONS, SEARCH_PARAMS_KEYS } from '@/config/admin.config';

import { useSearchParams } from 'react-router';

const OverviewFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Select
      value={
        Number(searchParams.get(SEARCH_PARAMS_KEYS.DURATION)) ||
        DURATION_FILTER_OPTIONS[1].value
      }
      onValueChange={(value) => {
        setSearchParams({ [SEARCH_PARAMS_KEYS.DURATION]: value });
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DURATION_FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default OverviewFilters;
