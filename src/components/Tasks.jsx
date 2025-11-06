import { ChevronRightIcon, Trash2Icon } from 'lucide-react';

function Tasks({ tasks, onTaskClick, onClickRemoveTask }) {
    return (
        // espaçamento entre as tarefas na vertical x, y
        <ul className='space-y-4 p-6 bg-slate-200 rounded-md shadow mt-6'>
            {tasks.map(task => (
                <li key={task.id} className="flex gap-2">
                    <button onClick={ () => onTaskClick(task.id) } 
                        className={`space-y-4 p-2 w-full text-left bg-slate-400 rounded-md shadow outline-slate-700 ${task.completed && 'line-through'}`}>
                        {task.title}
                    </button>
                    <button className='p-2 bg-slate-400 rounded-md shadow outline-slate-700'>
                        <ChevronRightIcon />
                    </button>
                    <button onClick={ () => onClickRemoveTask(task.id) }
                        className='p-2 bg-slate-400 rounded-md shadow outline-slate-700'
                    >
                        <Trash2Icon />
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default Tasks;
