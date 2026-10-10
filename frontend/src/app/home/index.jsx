import React from 'react';
import HeroSection from './hero-section';
import TrendingDestination from './trending-destination';
import Search from '@/features/search';

const Home = () => {
  return (
    <>
      <HeroSection />
      <div className='-mt-8 relative z-[2]'>
        <Search />
      </div>

      <TrendingDestination />
    </>
  );
};

export default Home;
