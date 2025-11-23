function Button(props) {
    return (
        <button
            className='p-2 bg-slate-400 rounded-md shadow outline-slate-700'
            {...props}
        >
            { props.children }
        </button>
    )
}

export default Button;
