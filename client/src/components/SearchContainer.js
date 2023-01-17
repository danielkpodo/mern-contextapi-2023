import { FormRow, FormRowSelect } from "."; // we use this because they are in the same folder
import { useMemo, useState } from "react";

import Wrapper from "../assets/wrappers/SearchContainer";
import { useAppContext } from "../context/appContext";

const SearchContainer = () => {
  const [localSearch, setLocalSearch] = useState("");
  const {
    isLoading,
    search,
    searchStatus,
    searchType,
    sort,
    sortOptions,
    statusOptions,
    jobTypeOptions,
    handleChange,
    clearFilters,
  } = useAppContext();

  const handleSearch = (e) => {
    // if (isLoading) return;
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const debounce = () => {
    let timeoutID;
    console.log("Debounce");
    return (e) => {
      setLocalSearch(e.target.value);
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => {
        const { name, value } = e.target;
        handleChange(name, value);
      }, 2000);
    };
  };

  const optimizedDebounce = useMemo(() => debounce(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalSearch("");
    clearFilters();
  };

  return (
    <Wrapper>
      <form className="form">
        <h4>search form</h4>
        {/* search position */}
        <div className="form-center">
          <FormRow
            type="text"
            name="search"
            value={localSearch}
            handleChange={optimizedDebounce}
          ></FormRow>
          {/* rest of the inputs */}
          {/* search by status */}
          <FormRowSelect
            labelText="job status"
            name="searchStatus"
            value={searchStatus}
            handleChange={handleSearch}
            list={["all", ...statusOptions]}
          ></FormRowSelect>
          {/* search by type */}

          <FormRowSelect
            labelText="job type"
            name="searchType"
            value={searchType}
            handleChange={handleSearch}
            list={["all", ...jobTypeOptions]}
          ></FormRowSelect>
          {/* sort */}

          <FormRowSelect
            name="sort"
            value={sort}
            handleChange={handleSearch}
            list={sortOptions}
          ></FormRowSelect>
          <button
            className="btn btn-block btn-danger"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            clear filters
          </button>
        </div>
      </form>
    </Wrapper>
  );
};
export default SearchContainer;
