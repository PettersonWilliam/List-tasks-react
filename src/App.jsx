import Tasks from './components/Tasks';
import AddTasks from './components/AddTasks';
import { useState } from 'react';

function App() {
	const [tasks, setTasks] = useState([
		{
			id: 1,
			title: 'Estudar React',
			description: 'Estudar React para criar uma aplicação de gerenciador de tarefas',
			completed: false
		},
		{
			id: 2,
			title: 'Estudar Node.js',
			description: 'Estudar Node.js para criar uma aplicação de gerenciador de tarefas',
			completed: false
		},
		{
			id: 3,
			title: 'Estudar Tailwind CSS',
			description: 'Estudar Tailwind CSS para criar uma aplicação de gerenciador de tarefas',
			completed: false
		}
	]);

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
				<Tasks tasks={tasks} onTaskClick={ onTaskClick } onClickRemoveTask={ onClickRemoveTask } />
			</div>
		</div>
	)
}

export default App;
