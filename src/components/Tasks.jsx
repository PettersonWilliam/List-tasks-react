import { ChevronRightIcon, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './ButtonActionList';
function Tasks({ tasks, onTaskClick, onClickRemoveTask }) {
    const navigate = useNavigate();

    const detailTask = task => {
        navigate(`/detail-task/?title=${task.title}&description=${task.description}`);
    }

    return (
        // espaçamento entre as tarefas na vertical x, y
        // <> <> é um fragment, é um grupo de elementos que não serão renderizados no DOM, mas serão renderizados no componente
        // <> Nao e um componente, mais caso precise retornar mais de um elemento, ou seja mais de uma ação, deve ser usado o fragment
        <>
            {tasks.length > 0 ? (
                <ul className='space-y-4 p-6 bg-slate-200 rounded-md shadow mt-6'>
                    {tasks.map(task => (
                        <li key={task.id} className="flex gap-2">
                            <Button onClick={ () => onTaskClick(task.id) } 
                                className={`space-y-4 p-2 w-full text-left bg-slate-400 rounded-md shadow outline-slate-700 ${task.completed && 'line-through'}`}>
                                {task.title}
                            </Button>
                            <Button onClick={ () => detailTask(task) }>
                                <ChevronRightIcon />
                            </Button>
                            <Button onClick={ () => onClickRemoveTask(task.id) }>
                                <Trash2Icon />
                            </Button>
                        </li>
                    ))}
                </ul>
                ) : null
            }
        </>
    );
}

export default Tasks;
