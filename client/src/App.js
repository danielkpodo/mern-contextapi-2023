import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, Error, Register, ProtectedRoute } from './pages';
import {
  AllJobs,
  Profile,
  Stats,
  AddJob,
  SharedLayout,
} from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This is how to setup nested layout  we also add the
         * the shared layout component into the root common route
         */}
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <SharedLayout />
            </ProtectedRoute>
          }
        >
          {/* Adding index makes the stats page the homepage */}
          <Route index element={<Stats />} />
          <Route path='all-jobs' element={<AllJobs />} />
          <Route path='add-jobs' element={<AddJob />} />
          <Route path='profile' element={<Profile />} />
        </Route>
        <Route path='/' element={<div>Dashboard</div>} />
        <Route path='/landing' element={<Landing />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
