// children é uma prop que recebe o conteúdo do componente Title

function Title({ children }) {
	return (
		<h1 className='text-3xl text-slate-100 font-bold text-center mb-4'>
			{ children }
		</h1>
	)
}

export default Title;
