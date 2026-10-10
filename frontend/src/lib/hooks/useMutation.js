import React from 'react';
import axiosInstance from '../axios-instance';

/**
 * mutate(payload, { onSuccess(envelope), onError(apiError) })
 * `envelope.data` is the backend payload (undefined for 204 responses).
 */
function useMutation(url, method) {
  const [mutateState, setMutateState] = React.useState({
    data: null,
    pending: false,
    error: null,
  });

  const mutate = async (payload, cb) => {
    setMutateState({ data: null, pending: true, error: null });
    let response;
    try {
      response = await axiosInstance({ method, url, data: payload });
    } catch (err) {
      setMutateState({ data: null, pending: false, error: err.message });
      if (cb && typeof cb.onError === 'function') cb.onError(err);
      return undefined;
    }
    setMutateState({ data: response?.data ?? null, pending: false, error: null });
    // Called outside the try/catch so a bug in onSuccess is not misreported as an API failure.
    if (cb && typeof cb.onSuccess === 'function') cb.onSuccess(response);
    return response;
  };

  return { ...mutateState, mutate };
}

export default useMutation;
