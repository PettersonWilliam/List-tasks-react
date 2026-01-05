import Tasks from './components/Tasks';
import AddTasks from './components/AddTasks';
import Title from './components/Title';
import { useEffect, useState } from 'react';

function App() {
	
	const [tasks, setTasks] = useState(localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : []);
	const [editingTask, setEditingTask] = useState(null);

	//ARMAZENANDO AS TAREFAS NO LOCAL STORAGE
    useEffect(() => {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}, [tasks]);

	// BUSCANDO AS TAREFAS NA API: JSONPLACEHOLDER (desativado)
	// Para ativar, reimplemente o useEffect com a chamada ao endpoint e setTasks.

	function addTaskSubmit(title, description) {
		const nextId = tasks.reduce((maxId, task) => {
			const idNum = typeof task.id === 'number' ? task.id : parseInt(task.id, 10);
			return Number.isFinite(idNum) && idNum > maxId ? idNum : maxId;
		}, 0) + 1;

		setTasks([
			...tasks,
			{
				id: nextId,
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

	function onEditTaskSubmit(taskId, newTitle, newDescription) {
		setTasks(prevTasks =>
			prevTasks.map(task =>
				task.id === taskId
					? { ...task, title: newTitle, description: newDescription }
					: task
			)
		);
		setEditingTask(null);
	}

	function onStartEditTask(task) {
		setEditingTask(task);
	}

	function onCancelEditTask() {
		setEditingTask(null);
	}

	return (
		<div className='w-screen h-screen bg-slate-500 flex justify-center p-6 overflow-hidden'>
			<div className='w-[500px] mb-4 flex flex-col h-full min-h-0'>
				<Title>Gerenciador de Tarefas</Title>
				<AddTasks
					onAddTaskSubmit={ addTaskSubmit }
					editingTask={ editingTask }
					onEditTaskSubmit={ onEditTaskSubmit }
					onCancelEditTask={ onCancelEditTask }
				/>
				<div className='flex-1 min-h-0'>
					<Tasks
						tasks={ tasks }
						onTaskClick={ onTaskClick }
						onClickRemoveTask={ onClickRemoveTask }
						onStartEditTask={ onStartEditTask }
						isEditing={ Boolean(editingTask) }
					/>
				</div>
			</div>
		</div>
	)
}

export default App;
