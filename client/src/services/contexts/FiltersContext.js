import { createContext } from "react";

const FiltersContext = createContext({
  productsList: [],
  setProductsList: () => {},
  changedProductsList: [],
  setChangedProductsList: () => {},
});

export default FiltersContext;
