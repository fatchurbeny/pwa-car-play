import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Placeholder } from '../components/Placeholder'
import { RadioPage } from '../modules/radio/RadioPage'
import { AppShell } from './AppShell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/maps" replace /> },
      { path: '/maps', element: <Placeholder title="Navigasi" /> },
      { path: '/music', element: <Placeholder title="Musik" /> },
      { path: '/radio', element: <RadioPage /> },
    ],
  },
])
