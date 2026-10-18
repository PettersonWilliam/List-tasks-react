import test from 'node:test';
import assert from 'node:assert/strict';
import {
	emptyState,
	loadMarket,
	marketReducer as reduce,
	needed,
	STORAGE_KEY,
	validState,
} from '../src/domain/market.js';

const product = (overrides = {}) => ({
	id: 'rice',
	name: 'Arroz',
	category: 'Alimentos',
	unit: 'kg',
	stock: 2,
	target: 5,
	checked: false,
	configured: true,
	notes: '',
	...overrides,
});

const stateWith = (...products) => ({ ...emptyState(), products });
const storage = (values) => ({ getItem: (key) => values[key] ?? null });

test('conferido blocks quantity changes in domain; unchecking unlocks it', () => {
	let state = stateWith(product());
	state = reduce(state, { type: 'check', id: 'rice', value: true });
	state = reduce(state, { type: 'stock', id: 'rice', value: 4 });
	assert.equal(state.products[0].stock, 2);
	assert.equal(state.products[0].checked, true);
	state = reduce(state, { type: 'check', id: 'rice', value: false });
	state = reduce(state, { type: 'stock', id: 'rice', value: 4 });
	assert.equal(state.products[0].stock, 4);
});

test('saving a changed product invalidates confirmation, unchanged save preserves it', () => {
	const state = stateWith(product({ checked: true }));
	assert.equal(
		reduce(state, {
			type: 'save-product',
			product: { ...state.products[0] },
		}),
		state,
	);
	const edited = reduce(state, {
		type: 'save-product',
		product: { ...state.products[0], target: 6 },
	});
	assert.equal(edited.products[0].checked, false);
	assert.equal(edited.products[0].target, 6);
});

test('legacy migration preserves descriptions, duplicates and original storage without guessing quantities', () => {
	const tasks = [
		{
			id: 1,
			title: 'Arroz',
			description: 'Tenho dois quilos',
			completed: true,
		},
		{
			id: 1,
			title: 'Arroz',
			description: 'Pacote especial',
			completed: false,
		},
	];
	const raw = JSON.stringify(tasks),
		source = { tasks: raw };
	const loaded = loadMarket(storage(source));
	assert.equal(loaded.writable, true);
	assert.equal(source.tasks, raw);
	assert.equal(loaded.state.products.length, 2);
	assert.notEqual(loaded.state.products[0].id, loaded.state.products[1].id);
	assert.equal(loaded.state.products[0].notes, tasks[0].description);
	assert.equal(loaded.state.products[0].configured, false);
	assert.equal(loaded.state.products[0].checked, false);
	assert.equal(reduce(loaded.state, { type: 'generate' }), loaded.state);
	assert.equal(
		reduce(loaded.state, { type: 'check', id: 'legacy-0', value: true })
			.products[0].checked,
		false,
	);
	assert.equal(validState(loaded.state), true);
});

test('corrupt, unsupported and unavailable storage is never silently overwritten', () => {
	for (const data of [
		{ [STORAGE_KEY]: '{' },
		{ [STORAGE_KEY]: JSON.stringify({ version: 99 }) },
		{ tasks: '{}' },
	]) {
		const result = loadMarket(storage(data));
		assert.equal(result.writable, false);
		assert.ok(result.warning);
	}
	assert.equal(
		loadMarket({
			getItem() {
				throw new Error('denied');
			},
		}).writable,
		false,
	);
});

test('current-format data takes priority over legacy and retains checked states', () => {
	const state = stateWith(product({ checked: true }));
	assert.deepEqual(
		loadMarket(
			storage({ [STORAGE_KEY]: JSON.stringify(state), tasks: 'broken' }),
		).state,
		state,
	);
});

test('monthly cycle uses integers, partial purchases, immutable history and cannot finish twice', () => {
	let state = stateWith(
		product({ stock: 1, checked: true }),
		product({
			id: 'coffee',
			name: 'Café',
			stock: 1,
			target: 3,
			checked: true,
		}),
		product({
			id: 'soap',
			name: 'Sabonete',
			stock: 4,
			target: 4,
			checked: true,
		}),
	);
	assert.equal(needed(state.products[0]), 4);
	state = reduce(state, { type: 'generate' });
	assert.equal(state.order.length, 2);
	state = reduce(state, { type: 'order-quantity', id: 'rice', value: 2 });
	state = reduce(state, { type: 'buy', id: 'rice', value: true });
	const finish = {
		type: 'finish',
		id: 'purchase-1',
		date: '2026-10-17T12:00:00Z',
	};
	state = reduce(state, finish);
	assert.equal(state.products[0].stock, 3);
	assert.equal(state.products[1].stock, 1);
	assert.equal(state.history[0].items[0].qty, 2);
	assert.equal(state.history[0].pending, 1);
	assert.equal(reduce(state, finish), state);
	assert.equal(validState(state), true);
	const snapshot = JSON.stringify(state.history);
	state = reduce(state, { type: 'new-cycle' });
	assert.ok(state.products.every((p) => !p.checked));
	state = reduce(state, {
		type: 'save-product',
		product: { ...state.products[0], name: 'Outro arroz' },
	});
	assert.equal(JSON.stringify(state.history), snapshot);
});

test('zero removes a purchase from cart and invalid quantities cannot enter state', () => {
	let state = reduce(stateWith(product({ checked: true })), {
		type: 'generate',
	});
	state = reduce(state, { type: 'buy', id: 'rice', value: true });
	state = reduce(state, { type: 'order-quantity', id: 'rice', value: 0 });
	assert.equal(state.order[0].bought, false);
	state = reduce(state, { type: 'buy', id: 'rice', value: true });
	assert.equal(state.order[0].bought, false);
	for (const value of [-1, 1.2, NaN, Infinity, 1000000])
		assert.equal(
			reduce(state, { type: 'order-quantity', id: 'rice', value }),
			state,
		);
});

test('return to review preserves confirmed cards but clears cart adjustments', () => {
	let state = reduce(stateWith(product({ checked: true })), {
		type: 'generate',
	});
	state = reduce(state, { type: 'order-quantity', id: 'rice', value: 1 });
	state = reduce(state, { type: 'review' });
	assert.equal(state.phase, 'review');
	assert.equal(state.products[0].checked, true);
	assert.equal(state.order.length, 0);
	state = reduce(state, { type: 'generate' });
	assert.equal(state.order[0].qty, 3);
});

test('fractional legacy quantities remain intact but require review', () => {
	const state = stateWith(product({ stock: 1.2, checked: true }));
	const result = loadMarket(
		storage({ [STORAGE_KEY]: JSON.stringify(state) }),
	);
	assert.equal(result.writable, true);
	assert.equal(result.state.products[0].stock, 1.2);
	assert.equal(result.state.products[0].checked, false);
	assert.equal(result.state.products[0].configured, false);
	assert.equal(reduce(result.state, { type: 'generate' }), result.state);
	assert.equal(
		reduce(result.state, {
			type: 'save-product',
			product: product({ stock: 1.2 }),
		}),
		result.state,
	);
	const corrected = reduce(result.state, {
		type: 'save-product',
		product: product({ stock: 1 }),
	});
	assert.equal(corrected.products[0].configured, true);
});
