import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import DetailTaskPage from './components/Pages/DetailTaskPage.jsx'


const router = createBrowserRouter([
	{
		path: '/home',
		element: <App />
	},
	{
		path: '/detail-task',
		element: <DetailTaskPage />
	}
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)
