import { Pencil, Trash2 } from 'lucide-react';
import { formatQuantity, needed } from '../../domain/market';
import ProductIcon from './ProductIcon';
import QuantityControl from './QuantityControl';

export default function ProductCard({
	product,
	reviewing,
	dispatch,
	onEdit,
	onRemove,
}) {
	const locked = !reviewing || product.checked || !product.configured;

	return (
		<article
			className={`product ${product.checked ? 'checked' : ''}`}
			aria-label={product.name}
		>
			<div className="product-head">
				<ProductIcon product={product} />
				<div>
					<div className="product-name">{product.name}</div>
					<div className="product-meta">
						{product.configured
							? `Quero ter ${formatQuantity(product.target)} ${product.unit}`
							: 'Revise unidade e quantidades'}
					</div>
					{product.notes && (
						<p className="product-notes">
							<strong>OBS:</strong> {product.notes}
						</p>
					)}
					{reviewing && (
						<div className="row-actions">
							<button
								className="edit"
								onClick={() => onEdit(product)}
							>
								<Pencil size={12} /> Editar produto
							</button>
							<button
								className="remove"
								aria-label={`Excluir ${product.name}`}
								onClick={() => onRemove(product)}
							>
								<Trash2 size={14} />
							</button>
						</div>
					)}
				</div>
			</div>
			<div>
				<QuantityControl
					id={product.id}
					name={product.name}
					label="Em casa"
					unit={product.unit}
					value={product.stock}
					disabled={locked}
					onChange={(value) =>
						dispatch({ type: 'stock', id: product.id, value })
					}
				/>
				<div className={`need ${needed(product) === 0 ? 'ok' : ''}`}>
					{!product.configured
						? 'Configure em Editar produto'
						: needed(product) > 0
							? `Faltam ${formatQuantity(needed(product))} ${product.unit}`
							: 'Quantidade suficiente'}
				</div>
			</div>
			<label className="check">
				<input
					type="checkbox"
					disabled={!reviewing || !product.configured}
					checked={product.checked}
					onChange={(event) =>
						dispatch({
							type: 'check',
							id: product.id,
							value: event.target.checked,
						})
					}
				/>
				{product.checked ? 'Conferido' : 'Conferir'}
			</label>
		</article>
	);
}
