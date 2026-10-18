import { useEffect, useRef } from 'react';

export default function Dialog({ title, children, onClose }) {
	const ref = useRef(null);
	useEffect(() => {
		const dialog = ref.current;
		dialog.showModal();
		return () => dialog.close();
	}, []);

	return (
		<dialog
			ref={ref}
			aria-labelledby="dialog-title"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<h2 id="dialog-title">{title}</h2>
			{children}
		</dialog>
	);
}
