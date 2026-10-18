import test from 'node:test';
import assert from 'node:assert/strict';
import {
	getProductIcon,
	getProductCategory,
} from '../src/domain/productIcons.js';
import { emptyState, marketReducer } from '../src/domain/market.js';

test('recognizes product names, accents and word boundaries', () => {
	for (const [name, id] of [
		['Arroz integral', 'rice'],
		['FEIJÃO carioca', 'beans'],
		['Café 250g', 'coffee'],
		['Leite integral', 'milk'],
		['Macarrão', 'pasta'],
		['Banana prata', 'banana'],
		['Sabonete', 'soap'],
	]) {
		assert.equal(getProductIcon({ name }).id, id);
	}
	assert.notEqual(getProductIcon({ name: 'Cafeteira' }).id, 'coffee');
});

test('name determines identity even when old manual choices exist', () => {
	assert.equal(getProductIcon({ name: 'Arroz', icon: 'grain' }).id, 'rice');
	assert.equal(
		getProductIcon({ name: 'Produto especial', category: 'Limpeza' }).id,
		'basket',
	);
});

test('icon choice survives shopping list generation', () => {
	const state = {
		...emptyState(),
		products: [
			{
				id: '1',
				name: 'Arroz',
				icon: 'grain',
				category: 'Alimentos',
				unit: 'kg',
				stock: 1,
				target: 3,
				checked: true,
				configured: true,
				notes: '',
			},
		],
	};
	const next = marketReducer(state, { type: 'generate' });
	assert.equal(next.order[0].icon, 'grain');
});

test('classifies names automatically and distinguishes cleaning from hygiene', () => {
	for (const [name, category] of [
		['Arroz', 'Alimentos'],
		['Banana', 'Hortifruti'],
		['Sabonete', 'Higiene'],
		['Shampoo', 'Higiene'],
		['Sabão em pó', 'Limpeza'],
		['Detergente', 'Limpeza'],
		['Papel higiênico', 'Higiene'],
		['Produto desconhecido', 'Outros'],
	])
		assert.equal(getProductCategory(name), category);
});
