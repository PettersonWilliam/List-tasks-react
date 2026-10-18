// Product identity is inferred locally from the name; no manual classification is needed.
export const PRODUCT_ICONS = [
	{ id: 'rice', emoji: '🍚', label: 'Arroz', words: /\barroz\b/ },
	{
		id: 'beans',
		emoji: '🫘',
		label: 'Feijão e grãos',
		words: /\b(feijao|lentilha|grao de bico|ervilha)\b/,
	},
	{
		id: 'pasta',
		emoji: '🍝',
		label: 'Macarrão',
		words: /\b(macarrao|espaguete|espagueti|lasanha|massa)\b/,
	},
	{
		id: 'coffee',
		emoji: '☕',
		label: 'Café',
		words: /\b(cafe|cappuccino)\b/,
	},
	{ id: 'milk', emoji: '🥛', label: 'Leite', words: /\bleite\b/ },
	{ id: 'bread', emoji: '🍞', label: 'Pão', words: /\b(pao|paes|torrada)\b/ },
	{ id: 'egg', emoji: '🥚', label: 'Ovos', words: /\bovos?\b/ },
	{
		id: 'cheese',
		emoji: '🧀',
		label: 'Queijo',
		words: /\b(queijo|mussarela|mucarela|requeijao)\b/,
	},
	{
		id: 'meat',
		emoji: '🥩',
		label: 'Carne',
		words: /\b(carne|bife|alcatra|picanha)\b/,
	},
	{
		id: 'chicken',
		emoji: '🍗',
		label: 'Frango',
		words: /\b(frango|galinha)\b/,
	},
	{
		id: 'fish',
		emoji: '🐟',
		label: 'Peixe',
		words: /\b(peixe|atum|sardinha|salmao)\b/,
	},
	{ id: 'banana', emoji: '🍌', label: 'Banana', words: /\bbananas?\b/ },
	{ id: 'apple', emoji: '🍎', label: 'Maçã', words: /\bmacas?\b/ },
	{
		id: 'orange',
		emoji: '🍊',
		label: 'Laranja',
		words: /\b(laranja|tangerina)s?\b/,
	},
	{ id: 'lemon', emoji: '🍋', label: 'Limão', words: /\b(limao|limoes)\b/ },
	{ id: 'tomato', emoji: '🍅', label: 'Tomate', words: /\btomates?\b/ },
	{ id: 'potato', emoji: '🥔', label: 'Batata', words: /\bbatatas?\b/ },
	{ id: 'carrot', emoji: '🥕', label: 'Cenoura', words: /\bcenouras?\b/ },
	{ id: 'onion', emoji: '🧅', label: 'Cebola', words: /\bcebolas?\b/ },
	{ id: 'garlic', emoji: '🧄', label: 'Alho', words: /\balho\b/ },
	{
		id: 'greens',
		emoji: '🥬',
		label: 'Verduras',
		words: /\b(alface|couve|repolho|verdura|espinafre)\b/,
	},
	{
		id: 'grain',
		emoji: '🌾',
		label: 'Farinha e cereais',
		words: /\b(farinha|aveia|trigo|fuba|cereal|cereais)\b/,
	},
	{
		id: 'oil',
		emoji: '🫗',
		label: 'Óleo e azeite',
		words: /\b(oleo|azeite)\b/,
	},
	{
		id: 'salt',
		emoji: '🧂',
		label: 'Sal e temperos',
		words: /\b(sal|tempero|pimenta)\b/,
	},
	{
		id: 'sugar',
		emoji: '🍬',
		label: 'Açúcar e doces',
		words: /\b(acucar|doce|bala)\b/,
	},
	{
		id: 'cookie',
		emoji: '🍪',
		label: 'Biscoitos',
		words: /\b(biscoito|bolacha|cookie)s?\b/,
	},
	{
		id: 'drink',
		emoji: '🧃',
		label: 'Bebidas',
		words: /\b(suco|refrigerante|bebida)\b/,
	},
	{
		id: 'cleaner',
		emoji: '🧴',
		label: 'Detergente e líquidos',
		words: /\b(detergente|amaciante|desinfetante|shampoo|xampu|condicionador|agua sanitaria)\b/,
	},
	{
		id: 'soap',
		emoji: '🧼',
		label: 'Sabão e sabonete',
		words: /\b(sabao|sabonete)\b/,
	},
	{
		id: 'paper',
		emoji: '🧻',
		label: 'Papel',
		words: /\b(papel|guardanapo)\b/,
	},
	{
		id: 'toothbrush',
		emoji: '🪥',
		label: 'Higiene bucal',
		words: /\b(dental|dente|dentes)\b/,
	},
	{
		id: 'sponge',
		emoji: '🧽',
		label: 'Esponja',
		words: /\b(esponja|bucha)\b/,
	},
	{ id: 'basket', emoji: '🛒', label: 'Outro produto' },
];

const normalize = (value) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

export function getProductIcon(product) {
	const match = PRODUCT_ICONS.find((icon) =>
		icon.words?.test(normalize(product.name || '')),
	);
	if (match) return match;
	return PRODUCT_ICONS.find((icon) => icon.id === 'basket');
}

export function getProductCategory(name) {
	const text = normalize(name);
	// Hygiene and cleaning terms can share a bottle icon, so classify them first.
	if (
		/\b(sabonete|shampoo|xampu|condicionador|dental|dente|dentes|desodorante|absorvente|fralda|papel higienico)\b/.test(
			text,
		)
	)
		return 'Higiene';
	if (
		/\b(detergente|sabao|amaciante|desinfetante|agua sanitaria|esponja|bucha|alvejante|limpador|papel toalha)\b/.test(
			text,
		)
	)
		return 'Limpeza';
	const icon = getProductIcon({ name });
	if (
		[
			'banana',
			'apple',
			'orange',
			'lemon',
			'tomato',
			'potato',
			'carrot',
			'onion',
			'garlic',
			'greens',
		].includes(icon.id)
	)
		return 'Hortifruti';
	if (
		[
			'rice',
			'beans',
			'pasta',
			'coffee',
			'milk',
			'bread',
			'egg',
			'cheese',
			'meat',
			'chicken',
			'fish',
			'grain',
			'oil',
			'salt',
			'sugar',
			'cookie',
			'drink',
		].includes(icon.id)
	)
		return 'Alimentos';
	return 'Outros';
}
