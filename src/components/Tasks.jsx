import { ChevronRightIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './ButtonActionList';
function Tasks({ tasks, onTaskClick, onClickRemoveTask, onStartEditTask, isEditing }) {
    const navigate = useNavigate();

    const detailTask = task => {
        navigate(`/detail-task/?title=${task.title}&description=${task.description}`);
    }

    return (
        // espaçamento entre as tarefas na vertical x, y
        // <> <> é um fragment, é um grupo de elementos que não serão renderizados no DOM, mas serão renderizados no componente
        // <> Nao e um componente, mais caso precise retornar mais de um elemento, ou seja mais de uma ação, deve ser usado o fragment
        <div className='flex-1 min-h-0'>
            {tasks.length > 0 ? (
                <ul className='space-y-4 p-6 pb-16 bg-slate-200 rounded-md shadow mt-10 overflow-y-auto h-[600px]'>
                    {tasks.map((task, index) => (
                        <li key={`${task.id}-${index}`} className="flex gap-2">
                            <Button onClick={ () => onTaskClick(task.id) } 
                                className={`space-y-4 p-2 w-full text-left bg-slate-400 rounded-md shadow outline-slate-700 ${task.completed && 'line-through'} flex-1 min-w-0`}>
                                <span className='block truncate' title={task.title}>
                                    {task.title}
                                </span>
                            </Button>
                            <Button onClick={ () => detailTask(task) } title="Detalhes">
                                <ChevronRightIcon />
                            </Button>
                            <Button onClick={() => onStartEditTask(task)} title="Editar">
                                <PencilIcon />
                            </Button>
                            <Button
                                onClick={ () => onClickRemoveTask(task.id) }
                                title={ isEditing ? 'Finalize a edição para excluir' : 'Excluir' }
                                disabled={ isEditing }
                                className='p-2 bg-slate-400 rounded-md shadow outline-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <Trash2Icon />
                            </Button>
                        </li>
                    ))}
                </ul>
                ) : null
            }
        </div>
    );
}

export default Tasks;
