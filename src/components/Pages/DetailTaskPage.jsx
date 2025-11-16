import { useSearchParams, useNavigate } from 'react-router-dom'; // TODA VEZ QUE IMPORTAMOS ALGO COMO "use..." O MESMO É UM HOOK
import { ArrowLeftIcon } from 'lucide-react';

function DetailTaskPage() {
	const [ searchParams ] = useSearchParams();
	const title = searchParams.get('title');
	const description = searchParams.get('description');
	const navigate = useNavigate();

	return (
		<div className='w-screen h-screen bg-slate-500 p-6'>
			<div className='w[500px] space-y-4'>
				<div className='flex items-center gap-2'>
					<span title="Voltar">
						<ArrowLeftIcon
							className='w-6 h-6 text-slate-100 cursor-pointer'
							onClick={() => { navigate('/home') }}
						/>
					</span>
					<h1 className='text-3xl text-slate-100 font-bold text-center'>
						Detalhes da tarefa
					</h1>
				</div>
	
				<div className=' bg-slate-200 rounded-md p-4'>
					<h2 className='text-xl font-bold text-slate-600'>{title}</h2>
					<p className='text-slate-600'>{description}</p>
				</div>
			</div>
		</div>
	)
}

export default DetailTaskPage;
