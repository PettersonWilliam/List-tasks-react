import { useState } from 'react';
import { normalize, quantityValid } from '../../domain/market';
import { getProductCategory } from '../../domain/productIcons';
import ProductIcon from './ProductIcon';
import Dialog from './Dialog';

export default function ProductEditor({ product, products, onSave, onClose }) {
	const [error, setError] = useState('');
	const [name, setName] = useState(product?.name || '');
	const preview = { name };

	function submit(event) {
		event.preventDefault();
		const values = new FormData(event.currentTarget);
		const next = {
			id: product?.id || crypto.randomUUID(),
			name: values.get('name').trim(),
			category: getProductCategory(name),
			unit: product?.unit || 'un',
			stock: Number(values.get('stock')),
			target: Number(values.get('target')),
			notes: values.get('notes').trim(),
		};
		if (
			!next.name ||
			!quantityValid(next.stock) ||
			!quantityValid(next.target)
		) {
			setError('Informe um nome e quantidades inteiras válidas.');
			return;
		}
		if (
			products.some(
				(p) =>
					p.id !== next.id &&
					normalize(p.name) === normalize(next.name),
			) &&
			normalize(product?.name || '') !== normalize(next.name)
		) {
			setError(
				'Este produto já está cadastrado. Edite o produto existente.',
			);
			return;
		}
		onSave(next);
	}

	return (
		<Dialog
			title={product ? 'Editar produto' : 'Novo produto'}
			onClose={onClose}
		>
			<p>
				{product?.checked
					? 'Se salvar uma alteração, o produto precisará ser conferido novamente.'
					: 'Cadastre uma vez. Nas próximas compras, é só conferir.'}
			</p>
			<form onSubmit={submit}>
				<div className="form-grid">
					<label className="full">
						Nome do produto
						<input
							name="name"
							required
							maxLength={100}
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Ex.: Arroz · pacote de 1 kg"
							autoFocus
						/>
					</label>
					{name.trim() && (
						<div className="full product-preview">
							<ProductIcon product={preview} />
							<span>{name}</span>
						</div>
					)}
					<label>
						Quantidade em casa{' '}
						{product?.unit && product.unit !== 'un'
							? `(${product.unit})`
							: '(itens)'}
						<input
							name="stock"
							type="number"
							inputMode="numeric"
							min="0"
							max="999999"
							step="1"
							required
							defaultValue={product?.stock ?? 0}
						/>
					</label>
					<label>
						Quero ter após a feira{' '}
						{product?.unit && product.unit !== 'un'
							? `(${product.unit})`
							: '(itens)'}
						<input
							name="target"
							type="number"
							inputMode="numeric"
							min="0"
							max="999999"
							step="1"
							required
							defaultValue={product?.target ?? 1}
						/>
					</label>
					<label className="full">
						Observações
						<textarea
							name="notes"
							rows={3}
							defaultValue={product?.notes || ''}
							placeholder="Marca, tamanho da embalagem ou anotação anterior"
						/>
					</label>
				</div>
				<p className="error" role="alert">
					{error}
				</p>
				<div className="dialog-actions">
					<button
						className="button secondary"
						type="button"
						onClick={onClose}
					>
						Cancelar
					</button>
					<button className="button" type="submit">
						Salvar produto
					</button>
				</div>
			</form>
		</Dialog>
	);
}
