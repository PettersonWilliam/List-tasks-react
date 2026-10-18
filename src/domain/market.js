import { getProductCategory } from './productIcons.js';

export const STORAGE_KEY = 'minha-feira:v1';
export const CATEGORIES = [
	'Alimentos',
	'Hortifruti',
	'Limpeza',
	'Higiene',
	'Outros',
];
export const UNITS = ['kg', 'L', 'un', 'pacotes'];

export const emptyState = () => ({
	version: 1,
	phase: 'review',
	products: [],
	order: [],
	history: [],
});

export const round = (value) => Math.round(value);
export const needed = (product) =>
	Math.max(0, round(product.target - product.stock));

const storedQuantityValid = (value) =>
	typeof value === 'number' &&
	Number.isFinite(value) &&
	value >= 0 &&
	value <= 999999;

export const quantityValid = (value) =>
	storedQuantityValid(value) && Number.isInteger(value);

export const normalize = (value) =>
	value
		.trim()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

export const formatQuantity = (value) =>
	value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

const productFields = ['name', 'category', 'unit', 'stock', 'target', 'notes'];

export function validProduct(product) {
	return (
		product &&
		typeof product.id === 'string' &&
		typeof product.name === 'string' &&
		product.name.trim().length > 0 &&
		CATEGORIES.includes(product.category) &&
		UNITS.includes(product.unit) &&
		storedQuantityValid(product.stock) &&
		storedQuantityValid(product.target) &&
		typeof product.checked === 'boolean' &&
		typeof product.configured === 'boolean' &&
		typeof product.notes === 'string'
	);
}

export function validState(state) {
	if (
		!state ||
		state.version !== 1 ||
		!['review', 'shopping', 'done'].includes(state.phase) ||
		!Array.isArray(state.products) ||
		!state.products.every(validProduct) ||
		new Set(state.products.map((p) => p.id)).size !==
			state.products.length ||
		!Array.isArray(state.order) ||
		!Array.isArray(state.history)
	)
		return false;

	const validOrder = (item) =>
		item &&
		typeof item.id === 'string' &&
		typeof item.name === 'string' &&
		CATEGORIES.includes(item.category) &&
		UNITS.includes(item.unit) &&
		storedQuantityValid(item.qty) &&
		storedQuantityValid(item.suggested) &&
		typeof item.bought === 'boolean';
	return (
		state.order.every(
			(item) =>
				validOrder(item) &&
				state.products.some((p) => p.id === item.id),
		) &&
		new Set(state.order.map((o) => o.id)).size === state.order.length &&
		state.history.every(
			(h) =>
				h &&
				typeof h.id === 'string' &&
				typeof h.date === 'string' &&
				Number.isFinite(Date.parse(h.date)) &&
				Number.isInteger(h.pending) &&
				h.pending >= 0 &&
				Array.isArray(h.items) &&
				h.items.every(validOrder),
		)
	);
}

// The old key is deliberately left untouched: it is the original-data backup.
export function loadMarket(storage) {
	try {
		const saved = storage.getItem(STORAGE_KEY);
		if (saved !== null) {
			const parsed = JSON.parse(saved);
			if (!validState(parsed)) throw new Error('invalid saved data');
			// Preserve existing fractional values; require explicit correction instead of rounding them.
			parsed.products = parsed.products.map((p) =>
				quantityValid(p.stock) && quantityValid(p.target)
					? { ...p, category: getProductCategory(p.name) }
					: {
							...p,
							category: getProductCategory(p.name),
							configured: false,
							checked: false,
						},
			);
			parsed.order = parsed.order.map((item) => ({
				...item,
				category: getProductCategory(item.name),
			}));
			return { state: parsed, warning: '', writable: true };
		}
		const legacy = storage.getItem('tasks');
		if (legacy === null)
			return { state: emptyState(), warning: '', writable: true };
		const tasks = JSON.parse(legacy);
		if (
			!Array.isArray(tasks) ||
			!tasks.every(
				(t) =>
					t &&
					typeof t.title === 'string' &&
					typeof t.description === 'string',
			)
		)
			throw new Error('invalid legacy data');
		const products = tasks.map((task, index) => ({
			id: `legacy-${index}`,
			name: task.title.trim() || 'Produto sem nome',
			notes: task.description,
			category: getProductCategory(task.title),
			unit: 'un',
			stock: 0,
			target: 0,
			configured: false,
			checked: false,
		}));
		return {
			state: { ...emptyState(), products },
			warning: '',
			writable: true,
		};
	} catch {
		return {
			state: emptyState(),
			warning:
				'Não foi possível ler os dados salvos. Eles foram preservados. Recarregue a página após verificar o armazenamento do navegador.',
			writable: false,
		};
	}
}

export function marketReducer(state, action) {
	switch (action.type) {
		case 'stock':
			if (state.phase !== 'review' || !quantityValid(action.value))
				return state;
			return {
				...state,
				products: state.products.map((p) =>
					p.id === action.id && !p.checked && p.configured
						? { ...p, stock: round(action.value) }
						: p,
				),
			};
		case 'check':
			if (state.phase !== 'review') return state;
			return {
				...state,
				products: state.products.map((p) =>
					p.id === action.id && p.configured
						? { ...p, checked: action.value === true }
						: p,
				),
			};
		case 'save-product': {
			if (state.phase !== 'review') return state;
			const next = {
				...action.product,
				category: getProductCategory(action.product.name || ''),
				checked: false,
				configured: true,
			};
			delete next.icon;
			if (
				!validProduct(next) ||
				!quantityValid(next.stock) ||
				!quantityValid(next.target)
			)
				return state;
			const existing = state.products.find((p) => p.id === next.id);
			if (
				existing &&
				existing.configured &&
				productFields.every((field) => existing[field] === next[field])
			)
				return state;
			return {
				...state,
				products: existing
					? state.products.map((p) => (p.id === next.id ? next : p))
					: [...state.products, next],
			};
		}
		case 'remove':
			if (state.phase !== 'review') return state;
			return {
				...state,
				products: state.products.filter((p) => p.id !== action.id),
			};
		case 'generate':
			if (
				state.phase !== 'review' ||
				!state.products.length ||
				!state.products.every((p) => p.configured && p.checked)
			)
				return state;
			return {
				...state,
				phase: 'shopping',
				order: state.products
					.filter((p) => needed(p) > 0)
					.map((p) => ({
						id: p.id,
						name: p.name,
						category: p.category,
						unit: p.unit,
						icon: p.icon,
						suggested: needed(p),
						qty: needed(p),
						bought: false,
					})),
			};
		case 'order-quantity':
			if (state.phase !== 'shopping' || !quantityValid(action.value))
				return state;
			return {
				...state,
				order: state.order.map((o) =>
					o.id === action.id
						? {
								...o,
								qty: round(action.value),
								bought: action.value > 0 && o.bought,
							}
						: o,
				),
			};
		case 'buy':
			if (state.phase !== 'shopping') return state;
			return {
				...state,
				order: state.order.map((o) =>
					o.id === action.id
						? { ...o, bought: o.qty > 0 && action.value === true }
						: o,
				),
			};
		case 'review':
			if (state.phase !== 'shopping') return state;
			return { ...state, phase: 'review', order: [] };
		case 'finish': {
			if (
				state.phase !== 'shopping' ||
				typeof action.id !== 'string' ||
				!Number.isFinite(Date.parse(action.date))
			)
				return state;
			const bought = state.order.filter((o) => o.bought && o.qty > 0);
			if (
				!state.products.every((p) => p.configured) ||
				!bought.every((o) => quantityValid(o.qty))
			)
				return state;
			const products = state.products.map((p) => ({
				...p,
				stock: round(
					p.stock + (bought.find((o) => o.id === p.id)?.qty || 0),
				),
			}));
			if (!products.every((p) => quantityValid(p.stock))) return state;
			return {
				...state,
				phase: 'done',
				products,
				history: [
					...state.history,
					{
						id: action.id,
						date: action.date,
						items: bought.map((o) => ({ ...o })),
						pending: state.order.filter(
							(o) => o.qty > 0 && !o.bought,
						).length,
					},
				],
			};
		}
		case 'new-cycle':
			if (state.phase !== 'done') return state;
			return {
				...state,
				phase: 'review',
				order: [],
				products: state.products.map((p) => ({ ...p, checked: false })),
			};
		default:
			return state;
	}
}
