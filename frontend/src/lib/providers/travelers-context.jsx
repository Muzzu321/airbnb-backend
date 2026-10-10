import { createContext, useContext, useEffect, useState } from 'react';
import useQuery from '../hooks/useQuery';
import API_CONFIG from '@/config/api.config';

const TravelerContext = createContext();

const TravelerContextProvider = ({ children }) => {
  const [travelers, setTravelers] = useState([]);

  const { data, pending, error } = useQuery({
    url: API_CONFIG.TRAVELLER.GET_TRAVELLERS,
  });

  useEffect(() => {
    if (data) {
      setTravelers(data);
    }
  }, [data]);

  const contextValue = {
    travelers,
    setTravelers,
    pending,
    error,
  };

  return (
    <TravelerContext.Provider value={contextValue}>
      {children}
    </TravelerContext.Provider>
  );
};

function useTravelerContext() {
  const context = useContext(TravelerContext);
  if(!context) {
    throw new Error(
      'useTravelerContext cannot be used outside of TravelerContextProvider'
    );
  }
  return context;
}

export {useTravelerContext};
export default TravelerContextProvider;
