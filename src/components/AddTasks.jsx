import { useState } from 'react';

function AddTasks({ onAddTaskSubmit }) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	return (
		<div className='space-y-4 p-6 bg-slate-200 rounded-md shadow flex flex-col'>
			<input
				type="text"
				placeholder='Digite o título da tarefa'
				className='border border-slate-300 outline-slate-700 px-4 py-2 rounded-md'
				value={title}
				onChange={e => setTitle(e.target.value)}
			/>
			<input
				type="text"
				placeholder="Digite a descrição da tarefa"
				className='border border-slate-300 outline-slate-700 px-4 py-2 rounded-md'
				value={description}
				onChange={e => setDescription(e.target.value)}
			/>
			<button 
				className='px-4 py-2 font-medium text-white bg-slate-500 rounded-md outline-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
				disabled={!title || !description }
				onClick={() => onAddTaskSubmit(title, description)}
			>
				{ !title || !description ? 'Adicionar Tarefa' : 'Adicionando Tarefa...' }
			</button>
		</div>
	)
}

export default AddTasks;
