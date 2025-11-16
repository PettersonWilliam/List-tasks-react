import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import DetailTaskPage from './components/Pages/DetailTaskPage.jsx'
import ErrorPages from './components/Pages/ErrorPages.jsx'
import { Navigate } from 'react-router-dom'
const router = createBrowserRouter([
	{
		path: '/home',
		element: <App />
	},
	{
		path: '/detail-task',
		element: <DetailTaskPage />
	},
	{
		path: '*',// QUANDO NÃO ENCONTRAR A ROTA
		Component: App , // COMPONENTE QUE SERÁ RENDERIZADO QUANDO A ROTA NÃO FOR ENCONTRADA
		errorElement: <Navigate replace to='/database-error' /> // REDIRECIONA PARA A PÁGINA DE ERRO
	},
	{
		path: '/database-error',
		element: <ErrorPages errorCode={404} />
	}
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)
