import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { quantityValid, round } from '../../domain/market';

export default function QuantityControl({
	id,
	name,
	unit,
	label,
	value,
	disabled,
	onChange,
}) {
	const [draft, setDraft] = useState(null);
	const [error, setError] = useState('');

	const commit = () => {
		if (draft === null) return;
		const number = Number(draft);
		if (draft.trim() !== '' && quantityValid(number)) {
			onChange(number);
			setError('');
		} else setError('Use um número inteiro, de 0 a 999.999.');
		setDraft(null);
	};

	return (
		<div>
			<label className="quantity-label" htmlFor={`quantity-${id}`}>
				{label} · {unit}
			</label>
			<div className="stepper">
				<button
					type="button"
					disabled={disabled || value === 0}
					aria-label={`Diminuir ${name}`}
					onClick={() => onChange(Math.max(0, round(value - 1)))}
				>
					<Minus size={16} />
				</button>
				<input
					id={`quantity-${id}`}
					aria-label={`${label}: ${name} em ${unit}`}
					type="number"
					inputMode="numeric"
					min="0"
					max="999999"
					step="1"
					disabled={disabled}
					aria-invalid={Boolean(error)}
					aria-describedby={
						error ? `quantity-error-${id}` : undefined
					}
					value={draft ?? value}
					onChange={(event) => setDraft(event.target.value)}
					onBlur={commit}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault();
							event.currentTarget.blur();
						}
					}}
				/>
				<button
					type="button"
					disabled={disabled || value >= 999999}
					aria-label={`Aumentar ${name}`}
					onClick={() => onChange(round(value + 1))}
				>
					<Plus size={16} />
				</button>
			</div>
			{error && (
				<p
					className="error quantity-error"
					id={`quantity-error-${id}`}
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}
