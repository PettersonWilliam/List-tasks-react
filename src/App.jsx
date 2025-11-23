import Tasks from './components/Tasks';
import AddTasks from './components/AddTasks';
import { useEffect, useState } from 'react';

function App() {
	
	const [tasks, setTasks] = useState(localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : []);

	//ARMAZENANDO AS TAREFAS NO LOCAL STORAGE
    useEffect(() => {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}, [tasks]);

	// BUSCANDO AS TAREFAS NA API: JSONPLACEHOLDER
	// Para usar o async/await precisamos criar dentro do hook useEffect uma função assíncrona e depois no final executar ela
	// Criando o hook com "[]vazio", para executar apenas uma vez, assim que entrar na página. O useEffect executa uma vez, após o componente ser renderizado.
	useEffect(() => {
		async function fetchTasks() {
			const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=6', {
				method: 'GET'
			});

			const data = await response.json();
			setTasks(data);
		}
		// Descomentar fetchTasks() para buscar as tarefas na API JSONPLACEHOLDER
		// fetchTasks();
	}, []);

	function addTaskSubmit(title, description) {
		setTasks([
			...tasks,
			{
				id: tasks.length + 1,
				title,
				description,
				completed: false
			}
		]);
	}

	function onTaskClick(taskId) {
		const newTasks = tasks.map(task => {
			if (task.id === taskId) {
				return { ...task,
					completed: !task.completed 
				}
			} else {
				return task;
			}
		});
		
		setTasks(newTasks);
	}

	function onClickRemoveTask(taskId) {
		const newTasks = tasks.filter(task => task.id !== taskId);
		setTasks(newTasks);
	}

	return (
		<div className='w-screen h-screen bg-slate-500 flex justify-center p-6'>
			<div className='w-[500px] mb-4'>
				<h1 className='text-3xl text-slate-100 font-bold text-center mb-4'>
					Gerenciador de Tarefas
				</h1>
				<AddTasks onAddTaskSubmit={ addTaskSubmit }/>
				<Tasks tasks={ tasks } onTaskClick={ onTaskClick } onClickRemoveTask={ onClickRemoveTask } />
			</div>
		</div>
	)
}

export default App;
