import { getProductIcon } from '../../domain/productIcons';

export default function ProductIcon({ product }) {
	const icon = getProductIcon(product);
	return (
		<span className="food-icon product-illustration" aria-hidden="true">
			{icon.emoji}
		</span>
	);
}
