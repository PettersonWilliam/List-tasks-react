import {useSearchParams} from 'react-router-dom';

function DetailTaskPage() {
	const [ searchParams ] = useSearchParams();
	const title = searchParams.get('title');
	const description = searchParams.get('description');

	return (
		<div className='w-screen h-screen bg-slate-500 flex justify-center p-6'>
			<div className='w-[500px] mb-4'>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
		</div>
	)
}

export default DetailTaskPage;
