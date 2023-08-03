import { createContext, useContext, useReducer } from "react";
import initialState from "./DataStore";
const AppContext = createContext();



const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    return { ...state, [action.name]: action.value };
  }, initialState);

  const updateState = (name, value) => {
    return dispatch({ name, value });
  };
  return (
    <AppContext.Provider value={{ ...state, dispatch, updateState }}>
      {children}
    </AppContext.Provider>
  );
};
//global context hook
const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext, useGlobalContext };
