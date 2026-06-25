import { createContext, useContext, useReducer } from 'react';
import { getPersistedAuthState } from '@/lib/persisted-auth-state';

export const StateContext = createContext();

function mergeInitialState(baseState, stateOverrides = {}) {
  if (typeof window === 'undefined') {
    return { ...baseState, ...stateOverrides };
  }

  const persisted = getPersistedAuthState();
  return { ...baseState, ...persisted, ...stateOverrides };
}

export const StateProvider = ({ initialState, reducer, stateOverrides, children }) => (
  <StateContext.Provider
    value={useReducer(reducer, initialState, (base) => mergeInitialState(base, stateOverrides))}
  >
    {children}
  </StateContext.Provider>
);

export const useStateProvider = () => useContext(StateContext);
