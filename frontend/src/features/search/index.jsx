import { Form } from '@/components/ui/form';
import React from 'react';
import LocationInput from './location-input';
import DateSelectInput from './date-select-input';
import OccupancyInput from './occupancy-input';
import { Button } from '@/components/ui/button';
import useSearchForm from './use-search-form';

const Search = () => {

  const {form, searchSubmitHandler} = useSearchForm();

  return (
    <section className="container">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(searchSubmitHandler)}
          className="flex flex-col gap-1 p-1 bg-yellow-500 lg:flex-row lg:items-center rounded h-16"
        >
          <LocationInput form={form}/>
          <DateSelectInput form={form}/>
          <OccupancyInput form={form}/>
          <Button type="submit" className="text-lg h-full">Search</Button>
        </form>
      </Form>
    </section>
  );
};

export default Search;
