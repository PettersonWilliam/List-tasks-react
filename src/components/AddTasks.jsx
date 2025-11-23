import { useState } from 'react';
import Input from './Input';

function AddTasks({ onAddTaskSubmit }) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	return (
		<div className='space-y-4 p-6 bg-slate-200 rounded-md shadow flex flex-col'>
			<Input
				type="text"
				placeholder='Digite o título da tarefa'
				value={title}
				onChange={event => setTitle(event.target.value)}
			/>
			<Input
				type="text"
				placeholder="Digite a descrição da tarefa"
				value={description}
				onChange={event => setDescription(event.target.value)}
			/>
			<button 
				className='px-4 py-2 font-medium text-white bg-slate-500 rounded-md outline-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
				disabled={!title || !description }
				onClick={ 
					() => {
						if (!title || !description) return;

						onAddTaskSubmit(title, description);
						setTitle('');
						setDescription('');
					}
				}
			>
				{ (title && !description) || (!title && description) ? 'Adicionando Tarefa...' : 'Adicionar Tarefa' }
			</button>
		</div>
	)
}

export default AddTasks;
