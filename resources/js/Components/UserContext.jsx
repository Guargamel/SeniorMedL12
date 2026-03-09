import React, { createContext, useContext } from 'react';

/**
 * UserContext - shared user state set by RequireAuthLayout, consumed by RequireRole.
 * This avoids double API fetches and race conditions.
 */
export const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

