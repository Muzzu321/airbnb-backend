import React from 'react';
import Hotels from './hotels';
import PaginationFilter from './filter/components/pagination-filter';
import useGetHotels from './hotels/hooks/use-get-hotels';
import { SEARCH_RESULT_PAGE_LIMIT } from '@/config/app.config';

const SearchPage = () => {
  const { hotels, totalEntries, pending, error, city, hasCity } = useGetHotels();

  return (
    <div className="container mt-6 mb-12">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {!hasCity
              ? 'Search for a destination'
              : pending || error
                ? city
                : `${city}: ${totalEntries} ${totalEntries === 1 ? 'property' : 'properties'} found`}
          </h1>
        </div>
        <Hotels error={error} isLoading={pending} data={hotels} hasCity={hasCity} />
        {!pending && !error && hotels.length > 0 && (
          <PaginationFilter
            totalEntries={totalEntries}
            limit={SEARCH_RESULT_PAGE_LIMIT}
          />
        )}
      </section>
    </div>
  );
};

export default SearchPage;
