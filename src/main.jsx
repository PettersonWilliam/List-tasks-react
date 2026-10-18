import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from 'react-router-dom';
import './index.css';
import App from './App';

const router = createBrowserRouter([
	{ path: '/', element: <App /> },
	{ path: '/home', element: <Navigate to="/" replace /> },
	{ path: '*', element: <Navigate to="/" replace /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
