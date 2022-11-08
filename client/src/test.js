//This file helps me to manage multiple context in one file and wrap around index.js
import { AppProvider } from './context/appContext';

export default function AppProviders({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
