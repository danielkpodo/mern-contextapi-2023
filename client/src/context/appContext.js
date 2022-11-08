import axios from 'axios';
import { useReducer, createContext, useContext } from 'react';
import reducer from './reducer';
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  REGISTER_USER_BEGIN,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
  LOGIN_USER_BEGIN,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  HANDLE_CHANGE,
  CLEAR_VALUES,
  CREATE_JOB_BEGIN,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  GET_JOBS_BEGIN,
  GET_JOBS_SUCCESS,
  SET_EDIT_JOB,
  DELETE_JOB_BEGIN,
  EDIT_JOB_BEGIN,
  EDIT_JOB_SUCCESS,
  EDIT_JOB_ERROR,
  SHOW_STATS_BEGIN,
  SHOW_STATS_SUCCESS,
  CLEAR_FILTERS,
  CHANGE_PAGE,
} from './actions';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
const userLocation = localStorage.getItem('location');

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  user: user ? JSON.parse(user) : null,
  token: token,
  userLocation: userLocation || '',
  showSidebar: false,

  //job state values
  /**
   * We added the position and company values so we can easily toggle add job and edit job
   * handle input change is also handled globally
   */
  position: '',
  company: '',
  jobLocation: userLocation || '',
  isEditing: false,
  editJobId: '',
  jobTypeOptions: ['full-time', 'part-time', 'remote', 'internship'],
  jobType: 'full-time',
  statusOptions: ['pending', 'interview', 'declined'],
  status: 'pending',
  // INFO: pagination values
  jobs: [],
  numOfPages: 1,
  page: 1, // currentPage number
  totalJobs: 0,
  stats: {},
  monthlyApplications: [],

  // search components state values
  search: '',
  searchStatus: 'all',
  searchType: 'all',
  sort: 'latest',
  sortOptions: ['latest', 'oldest', 'a-z', 'z-a'],
};

const AppContext = createContext({ ...initialState });

/** Wrapper around the entire app */
const AppProvider = ({ children }) => {
  //Using reducer with context
  const [state, dispatch] = useReducer(reducer, initialState);

  /** GLOBAL AXIOS CONFIGURATION
   * We can actually setup separate files where we do that and export axios
   * Down side of this is that bearer token will always be attached to header when we do this
   * I suggest we use this approach sparingly
   */
  //   axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;

  /** Custom Axios Configuration -> This is called Axios instance
   * This setup is useful for endpoints that require Authorization token
   * This setup is also great but does not give a way to handle errors programmatically esp. 401 errors
   */
  //   const authFetch = axios.create({
  //     baseURL: '/api/v1',
  //     headers: {
  //       Authorization: `Bearer ${state.token}`,
  //     },
  //   });

  /** USNG AXIOS INTERCEPTORS */
  const authFetch = axios.create({
    baseURL: '/api/v1',
  });

  //Interceptor for request
  authFetch.interceptors.request.use(
    //Intercept b4 request is sent
    (config) => {
      config.headers.common['Authorization'] = `Bearer ${state.token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  //Interceptor for response
  authFetch.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log('RESPONSE ERROR', error.response);
      //useful when token has expired
      if (error.response.status === 401) {
        /** In this case it means the user should not even be in the application, thus we logout the user */
        logoutUser();
        console.log('AUTH ERROR', error.response.data.msg);
      }
      return Promise.reject(error);
    }
  );

  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  };

  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT });
    }, 3000);
  };

  const addUserToLocalStorage = (user, token, location) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('location', location);
  };

  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('location');
  };

  /** Register user */
  const registerUser = async (currentUser) => {
    dispatch({ type: REGISTER_USER_BEGIN });

    try {
      const response = await axios.post('/api/v1/auth/register', currentUser);
      const { user, token, location } = response.data;
      dispatch({
        type: REGISTER_USER_SUCCESS,
        payload: { user, token, location },
      });
      //Add user to localStorage on successful registration
      addUserToLocalStorage(user, token, location);
    } catch (error) {
      console.log(error.response);
      dispatch({
        type: REGISTER_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }

    clearAlert();
  };

  const loginUser = async (currentUser) => {
    dispatch({ type: LOGIN_USER_BEGIN });

    try {
      const response = await axios.post('/api/v1/auth/login', currentUser);
      const { user, token, location } = response.data;
      dispatch({
        type: LOGIN_USER_SUCCESS,
        payload: { user, token, location },
      });
      //Add user to localStorage on successful registration
      addUserToLocalStorage(user, token, location);
    } catch (error) {
      console.log(error.response);
      dispatch({
        type: LOGIN_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }

    clearAlert();
  };

  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER });
    removeUserFromLocalStorage();
  };

  const updateUser = async (currentUser) => {
    dispatch({ type: UPDATE_USER_BEGIN });
    try {
      const { data } = await authFetch.patch('/auth/updateUser', currentUser);
      const { user, location, token } = data;
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { user, token, location },
      });
      addUserToLocalStorage(user, token, location);
    } catch (error) {
      if (error.response.status !== 401) {
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: { msg: error.response.data.msg },
        });
      }
    }
    clearAlert();
  };

  const handleChange = (name, value) => {
    dispatch({ type: HANDLE_CHANGE, payload: { name, value } });
  };

  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES });
  };

  const createJob = async () => {
    dispatch({ type: CREATE_JOB_BEGIN });
    try {
      const { position, company, jobLocation, jobType, status } = state;
      await authFetch.post('/jobs', {
        position,
        company,
        jobLocation,
        jobType,
        status,
      });
      dispatch({ type: CREATE_JOB_SUCCESS });
      // or you can simply call clearValues()
      dispatch({ type: CLEAR_VALUES });
    } catch (error) {
      if (error.response.status === 401) return;
      dispatch({
        type: CREATE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }

    clearAlert();
  };

  const getJobs = async () => {
    const { search, searchStatus, searchType, sort, page } = state;

    let url = `/jobs?&page=${page}&jobType=${searchType}&status=${searchStatus}&sort=${sort}`;

    if (search) {
      url = url + `&search=${search}`;
    }

    dispatch({ type: GET_JOBS_BEGIN });
    try {
      // By default, axios will send a GET request
      const { data } = await authFetch(url);
      const { jobs, numOfPages, totalJobs } = data;
      dispatch({
        type: GET_JOBS_SUCCESS,
        payload: { jobs, numOfPages, totalJobs },
      });
    } catch (error) {
      // if we getting an error, when fetching the jobs, the user should not be in the application
      logoutUser();
      console.error(error.response);
    }
    clearAlert();
  };

  const setEditJob = (id) => {
    dispatch({ type: SET_EDIT_JOB, payload: { id } });
  };

  const editJob = async () => {
    dispatch({ type: EDIT_JOB_BEGIN });
    try {
      const { position, company, editJobId, jobLocation, jobType, status } =
        state;
      await authFetch.patch(`/jobs/${editJobId}`, {
        company,
        position,
        status,
        jobType,
        jobLocation,
      });
      dispatch({
        type: EDIT_JOB_SUCCESS,
        payload: { msg: 'Job updated successfully' },
      });
    } catch (error) {
      if (error.response.status === 401) return;
      dispatch({
        type: EDIT_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

  const deleteJob = async (jobId) => {
    dispatch({ type: DELETE_JOB_BEGIN });
    try {
      await authFetch.delete(`/jobs/${jobId}`);
      getJobs(); // this will fetch the jobs again, but we can simply remove the job from the state
    } catch (error) {
      logoutUser();
    }
    clearValues();
  };

  const showStats = async () => {
    dispatch({ type: SHOW_STATS_BEGIN });
    try {
      const { data } = await authFetch('/jobs/stats');
      console.log('Stats', data);
      dispatch({
        type: SHOW_STATS_SUCCESS,
        payload: {
          stats: data.defaultStats,
          monthlyApplications: data.monthlyApplications,
        },
      });
    } catch (error) {
      logoutUser();
      console.log(error);
    }
    clearAlert();
  };

  const changePage = (page) => {
    dispatch({ type: CHANGE_PAGE, payload: { page } });
  };

  const clearFilters = () => {
    dispatch({ type: CLEAR_FILTERS });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        registerUser,
        loginUser,
        toggleSidebar,
        logoutUser,
        updateUser,
        handleChange,
        clearValues,
        createJob,
        getJobs,
        setEditJob,
        deleteJob,
        editJob,
        showStats,
        clearFilters,
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/** Set up custom hook
 * for getting app context values other than that in every place we need to do this manually
 */

/**
 *
 * In  a new app you will build always make sure that you create components and nest them in pages folder
 * All api call should be in the pages file. E.g when sending post request components for the form should be in components folder
 * and the components should be called inside of the pages folder. if any data it should be pass down to these componennts as props or using context
 * One nice convention am gonna use going forward is that my components will use .jsx and pages will use .js
 */

/**
 *
 * To use the add job form same as edit a particular job on the same page we need to manage the items in context
 * And we set isEditing to true, this way we can dynamically change the actions of the add job form
 */

/** Use state.jobs.find(job => job._id === id) for editing a page value globally and use generic handleChange
 * state must be setup in the context provider
 */
const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };
