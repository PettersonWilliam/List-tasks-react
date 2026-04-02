import { useEffect, useState } from 'react';
import Input from './Input';

function AddTasks({ onAddTaskSubmit, editingTask, onEditTaskSubmit, onCancelEditTask }) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (editingTask) {
			setTitle(editingTask.title ?? '');
			setDescription(editingTask.description ?? '');
		}
	}, [editingTask]);

	function resetForm() {
		setTitle('');
		setDescription('');
	}

	return (
		<div className='space-y-4 p-6 bg-slate-200 rounded-md shadow flex flex-col'>
			<Input
				type="text"
				placeholder='Digite o título da tarefa'
				value={title}
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="none"
				spellCheck={false}
				onChange={event => setTitle(event.target.value)}
			/>
			<Input
				type="text"
				placeholder="Digite a descrição da tarefa"
				value={description}
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="none"
				spellCheck={false}
				onChange={event => setDescription(event.target.value)}
			/>
			<div className='flex gap-2'>
				<button 
					className='px-4 py-2 font-medium text-white bg-slate-500 rounded-md outline-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1'
					disabled={!title || !description }
					onClick={ 
						() => {
							if (!title || !description) return;
							if (editingTask) {
								onEditTaskSubmit(editingTask.id, title, description);
							} else {
								onAddTaskSubmit(title, description);
							}
							resetForm();
						}
					}
				>
					{ editingTask ? 'Salvar Edição' : ((title && !description) || (!title && description) ? 'Adicionando Tarefa...' : 'Adicionar Tarefa') }
				</button>
				{editingTask && (
					<button
						className='px-4 py-2 font-medium text-slate-700 bg-slate-300 rounded-md outline-slate-700'
						onClick={() => {
							onCancelEditTask?.();
							resetForm();
						}}
					>
						Cancelar
					</button>
				)}
			</div>
		</div>
	)
}

export default AddTasks;
