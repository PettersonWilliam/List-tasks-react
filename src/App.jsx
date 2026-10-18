import { useState } from 'react';
import {
	Archive,
	Check,
	History,
	ShoppingBasket,
	ShoppingCart,
} from 'lucide-react';
import useMarket from './hooks/useMarket';
import {
	CATEGORIES,
	formatQuantity,
	normalize,
	quantityValid,
	round,
} from './domain/market';
import ProductCard from './components/market/ProductCard';
import ProductIcon from './components/market/ProductIcon';
import QuantityControl from './components/market/QuantityControl';
import ProductEditor from './components/market/ProductEditor';
import Dialog from './components/market/Dialog';
import './App.css';

function Heading({ eyebrow, title, subtitle, children }) {
	return (
		<header className="heading">
			<div>
				<div className="eyebrow">{eyebrow}</div>
				<h1>{title}</h1>
				<p className="subtitle">{subtitle}</p>
			</div>
			{children}
		</header>
	);
}

function Flow({ phase }) {
	const active = ['review', 'shopping', 'done'].indexOf(phase);

	return (
		<div className="flow" aria-label="Etapas da compra">
			{[
				'Conferir em casa',
				'Comprar no mercado',
				'Guardar e repetir',
			].map((label, index) => (
				<div
					key={label}
					className={`flow-item ${index === active ? 'active' : ''}`}
					aria-current={index === active ? 'step' : undefined}
				>
					<span className="step">
						{index < active ? <Check size={13} /> : index + 1}
					</span>
					<span className="label">{label}</span>
				</div>
			))}
		</div>
	);
}

function Progress({ title, text, count, total, label }) {
	return (
		<section className="summary">
			<div>
				<div className="summary-title">{title}</div>
				<p>{text}</p>
			</div>
			<div className="summary-right">
				<div className="progress-label" aria-live="polite">
					<span>{label}</span>
					<span>
						{count} de {total}
					</span>
				</div>
				<div
					className="track"
					role="progressbar"
					aria-label={label}
					aria-valuemin={0}
					aria-valuemax={total || 1}
					aria-valuenow={count}
				>
					<div
						className="fill"
						style={{
							width: `${total ? (count / total) * 100 : 0}%`,
						}}
					/>
				</div>
			</div>
		</section>
	);
}

function Groups({ items, query, category, children }) {
	const visible = items.filter(
		(item) =>
			normalize(item.name).includes(normalize(query)) &&
			(category === 'Todas' || item.category === category),
	);

	if (!visible.length) {
		return (
			<div className="empty">
				Nenhum produto encontrado. Experimente outra busca ou categoria.
			</div>
		);
	}

	return CATEGORIES.map((group) => {
		const list = visible.filter((item) => item.category === group);

		return list.length ? (
			<section key={group}>
				<div className="section-head">
					<h2>{group}</h2>
					<span>
						{list.length}{' '}
						{list.length === 1 ? 'produto' : 'produtos'}
					</span>
				</div>
				<div className="products">{list.map(children)}</div>
			</section>
		) : null;
	});
}

export default function App() {
	const { state, dispatch, warning, writable } = useMarket();
	const [view, setView] = useState('pantry');
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('Todas');
	const [editor, setEditor] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const reviewing = state.phase === 'review';
	const checked = state.products.filter((p) => p.checked).length;
	const unconfigured = state.products.filter((p) => !p.configured).length;
	const activeOrder = state.order.filter((o) => o.qty > 0);
	const bought = activeOrder.filter((o) => o.bought);
	const canFinish =
		state.products.every((p) => p.configured) &&
		bought.every((o) => quantityValid(o.qty)) &&
		state.products.every((p) =>
			quantityValid(
				round(p.stock + (bought.find((o) => o.id === p.id)?.qty || 0)),
			),
		);

	function navigate(next) {
		setView(next);
		setQuery('');
		setCategory('Todas');
	}

	function ask(title, text, action, label) {
		setConfirmation({ title, text, action, label });
	}

	function newCycle() {
		ask(
			'Começar a próxima compra?',
			'Seus produtos e o histórico serão mantidos. Confira novamente o que sobrou em casa.',
			() => {
				dispatch({ type: 'new-cycle' });
				navigate('pantry');
			},
			'Iniciar conferência',
		);
	}

	const toolbar = (
		<div className="toolbar">
			<label className="search">
				<span className="sr-only">Buscar produto</span>
				<input
					type="search"
					placeholder="Buscar na sua lista…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</label>
			<label>
				<span className="sr-only">Filtrar categoria</span>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				>
					{['Todas', ...CATEGORIES].map((c) => (
						<option key={c}>{c}</option>
					))}
				</select>
			</label>
		</div>
	);

	return (
		<div className="market-app">
			<div className="layout">
				<aside className="sidebar">
					<div className="brand">
						<span className="brand-icon">
							<ShoppingBasket aria-hidden="true" size={23} />
						</span>
						<div>
							Minha Feira<small>MENOS ESQUECIMENTO.</small>
						</div>
					</div>
					<nav className="nav" aria-label="Navegação principal">
						{[
							{ key: 'pantry', label: 'Despensa', Icon: Archive },
							{
								key: 'shopping',
								label: 'Compras',
								Icon: ShoppingCart,
							},
							{ key: 'history', label: 'Histórico', Icon: History },
						].map(({ key, label, Icon }) => (
							<button
								key={key}
								aria-current={view === key ? 'page' : undefined}
								onClick={() => navigate(key)}
							>
								<Icon size={18} aria-hidden="true" />
								{label}
							</button>
						))}
					</nav>
					<div className="side-note">
						<strong>Uma rotina mais leve.</strong>
						Confira o que ficou em casa.
						<br />
						Leve só o que falta.
					</div>
				</aside>
				<main className="main">
					<div className="topline">
						<span>
							Compra do mês ·{' '}
							{new Date().toLocaleDateString('pt-BR', {
								month: 'long',
								year: 'numeric',
							})}
						</span>
						<span className="tag">SUA LISTA DO MÊS</span>
					</div>
					{warning && (
						<div className="notice storage-warning" role="alert">
							{warning}
						</div>
					)}
					{!writable ? (
						<div className="empty">
							<h1>Seus dados precisam de atenção</h1>
							<p>
								Para evitar sobrescrever sua lista, as
								alterações estão pausadas.
							</p>
							<button
								className="button"
								onClick={() => window.location.reload()}
							>
								Tentar novamente
							</button>
						</div>
					) : (
						<>
							{view === 'pantry' && (
								<>
									<Heading
										eyebrow="Sua rotina, sem começar do zero"
										title="O que tem em casa?"
										subtitle="Confira as quantidades antes de sair para a feira."
									>
										{reviewing &&
											state.products.length > 0 && (
												<button
													className="button secondary"
													onClick={() =>
														setEditor({
															product: null,
														})
													}
												>
													+ Novo produto
												</button>
											)}
									</Heading>
									<Flow phase={state.phase} />
									{unconfigured > 0 && (
										<div className="notice">
											{unconfigured} produtos precisam de
											revisão. Abra “Editar produto” para
											definir a unidade e as quantidades
											inteiras. Anotações e valores
											anteriores foram preservados.
										</div>
									)}
									{reviewing && state.products.length > 0 && (
										<Progress
											title={
												checked ===
												state.products.length
													? 'Tudo conferido. Vamos à lista?'
													: 'Uma olhada na despensa, uma compra mais certa.'
											}
											text="Marcou como conferido? A quantidade fica protegida. Para mudar, desmarque ou use Editar produto."
											count={checked}
											total={state.products.length}
											label="Produtos conferidos"
										/>
									)}
									{!reviewing && (
										<div className="notice">
											{state.phase === 'shopping'
												? 'Sua lista já está pronta. Para mudar a despensa, use “Rever despensa” na aba Compras.'
												: 'Compra encerrada. Estas quantidades são uma referência: confira novamente antes da próxima feira.'}
										</div>
									)}
									{state.products.length > 0 ? (
										<>
											{toolbar}
											<Groups
												items={state.products}
												query={query}
												category={category}
											>
												{(p) => (
													<ProductCard
														key={p.id}
														product={p}
														reviewing={reviewing}
														dispatch={dispatch}
														onEdit={(product) =>
															setEditor({
																product,
															})
														}
														onRemove={(product) =>
															ask(
																'Excluir este produto?',
																`${product.name} será removido da despensa. As compras anteriores permanecerão no histórico.`,
																() =>
																	dispatch({
																		type: 'remove',
																		id: product.id,
																	}),
																'Excluir produto',
															)
														}
													/>
												)}
											</Groups>
										</>
									) : (
										<div className="empty">
											<h2>Sua despensa começa aqui.</h2>
											<p>
												Cadastre os produtos que costuma
												comprar e quanto quer ter para o
												mês.
											</p>
											<button
												className="button"
												onClick={() =>
													setEditor({ product: null })
												}
											>
												Cadastrar primeiro produto
											</button>
										</div>
									)}
									{state.products.length > 0 && (
										<div className="footer-action">
											<p>
												{reviewing
													? `${state.products.length - checked} produtos pendentes. A lista usa as quantidades conferidas.`
													: 'Seus produtos continuam aqui para a próxima compra.'}
											</p>
											{reviewing ? (
												<button
													className="button"
													disabled={
														checked !==
															state.products
																.length ||
														unconfigured > 0
													}
													onClick={() => {
														dispatch({
															type: 'generate',
														});
														navigate('shopping');
													}}
												>
													Preparar lista de compras →
												</button>
											) : (
												<button
													className="button"
													onClick={
														state.phase ===
														'shopping'
															? () =>
																	navigate(
																		'shopping',
																	)
															: newCycle
													}
												>
													{state.phase === 'shopping'
														? 'Ver lista de compras →'
														: 'Iniciar próxima compra →'}
												</button>
											)}
										</div>
									)}
								</>
							)}
							{view === 'shopping' && (
								<>
									<Heading
										eyebrow={
											reviewing
												? 'Um passo de cada vez'
												: 'No mercado'
										}
										title={
											reviewing
												? 'Sua lista começa em casa.'
												: state.phase === 'done'
													? 'Compra encerrada!'
													: 'Leve só o que falta.'
										}
										subtitle={
											reviewing
												? 'Confira a despensa para saber exatamente o que falta.'
												: state.phase === 'done'
													? 'O que você levou já foi somado à sua despensa.'
													: 'Ajuste a quantidade e marque o que entrou no carrinho.'
										}
									>
										{state.phase === 'shopping' && (
											<button
												className="button secondary"
												onClick={() =>
													ask(
														'Rever a despensa?',
														'As marcações do carrinho e os ajustes da lista serão descartados. Os produtos conferidos serão mantidos; desmarque ou edite para ajustar.',
														() => {
															dispatch({
																type: 'review'
															});
															navigate('pantry');
														},
														'Voltar à conferência'
													)
												}
											>
												Rever despensa
											</button>
										)}
									</Heading>
									<Flow phase={state.phase} />
									{reviewing && (
										<div className="empty">
											<h2>
												Primeiro, confira seus produtos
											</h2>
											<p>
												A lista será calculada quando
												todos os produtos estiverem
												conferidos.
											</p>
											<button
												className="button"
												onClick={() =>
													navigate('pantry')
												}
											>
												Conferir despensa →
											</button>
										</div>
									)}
									{state.phase === 'done' && (
										<div className="empty">
											<h2>Pronto para o próximo mês.</h2>
											<p>
												Seu histórico foi salvo. Na
												próxima compra, confira
												novamente as quantidades.
											</p>
											<button
												className="button"
												onClick={newCycle}
											>
												Iniciar próxima compra →
											</button>
										</div>
									)}
									{state.phase === 'shopping' && (
										<>
											<Progress
												title={
													activeOrder.length
														? 'Sua compra está tomando forma.'
														: 'Nada faltando por aqui.'
												}
												text="Ajuste quanto vai levar. Use zero para deixar um produto fora desta compra."
												count={bought.length}
												total={activeOrder.length}
												label="No carrinho"
											/>
											{state.order.length > 0 ? (
												<>
													{toolbar}
													<Groups
														items={[
															...state.order,
														].sort(
															(a, b) =>
																Number(
																	a.bought,
																) -
																Number(
																	b.bought,
																),
														)}
														query={query}
														category={category}
													>
														{(o) => (
															<article
																key={o.id}
																className={`product ${o.bought ? 'bought' : ''}`}
																aria-label={
																	o.name
																}
															>
																<div className="product-head">
																	<ProductIcon
																		product={
																			o
																		}
																	/>
																	<div>
																		<div className="product-name">
																			{
																				o.name
																			}
																		</div>
																		<div className="product-meta">
																			{o.qty ===
																			0
																				? 'Fora desta compra'
																				: o.bought
																					? 'Já está no carrinho'
																					: `Faltava ${formatQuantity(o.suggested)} ${o.unit}`}
																		</div>
																	</div>
																</div>
																<QuantityControl
																	id={o.id}
																	name={
																		o.name
																	}
																	label="Levar"
																	unit={
																		o.unit
																	}
																	value={
																		o.qty
																	}
																	onChange={(
																		value,
																	) =>
																		dispatch(
																			{
																				type: 'order-quantity',
																				id: o.id,
																				value,
																			},
																		)
																	}
																/>
																<label className="check">
																	<input
																		type="checkbox"
																		checked={
																			o.bought
																		}
																		disabled={
																			o.qty ===
																			0
																		}
																		onChange={(
																			e,
																		) =>
																			dispatch(
																				{
																					type: 'buy',
																					id: o.id,
																					value: e
																						.target
																						.checked,
																				},
																			)
																		}
																	/>
																	No carrinho
																</label>
															</article>
														)}
													</Groups>
												</>
											) : (
												<div className="empty">
													Sua despensa já tem as
													quantidades desejadas.
												</div>
											)}
											{!canFinish && (
												<p
													className="error"
													role="alert"
												>
													Revise as quantidades: use
													inteiros até 999.999. Se
													houver um valor antigo
													fracionado, volte à despensa
													e edite o produto.
												</p>
											)}
											<div className="footer-action">
												<p>
													Só os produtos marcados
													serão somados à despensa.
													Você pode encerrar mesmo que
													algum item fique faltando.
												</p>
												<button
													className="button"
													disabled={!canFinish}
													onClick={() =>
														ask(
															'Encerrar esta compra?',
															`${bought.length} produtos serão somados à despensa. ${activeOrder.length - bought.length} produtos ainda estão fora do carrinho e não serão somados.`,
															() =>
																dispatch({
																	type: 'finish',
																	id: crypto.randomUUID(),
																	date: new Date().toISOString(),
																}),
															'Encerrar compra',
														)
													}
												>
													Encerrar compra →
												</button>
											</div>
										</>
									)}
								</>
							)}
							{view === 'history' && (
								<>
									<Heading
										eyebrow="Um mês de cada vez"
										title="Suas últimas compras."
										subtitle="Veja o que realmente foi comprado em cada visita ao mercado."
									/>
									{state.history.length > 0 ? (
										[...state.history]
											.reverse()
											.map((h) => (
												<article
													className="history-card"
													key={h.id}
												>
													<header>
														<div>
															<h2>
																{new Date(
																	h.date,
																).toLocaleDateString(
																	'pt-BR',
																	{
																		day: 'numeric',
																		month: 'long',
																		year: 'numeric',
																	},
																)}
															</h2>
															<p>
																{h.items.length}{' '}
																produtos
																comprados
																{h.pending > 0
																	? ` · ${h.pending} não comprados`
																	: ''}
															</p>
														</div>
														<span className="pill">
															Encerrada
														</span>
													</header>
													{h.items.length ? (
														<ul>
															{h.items.map(
																(o) => (
																	<li
																		key={
																			o.id
																		}
																	>
																		{o.name}{' '}
																		<strong>
																			·{' '}
																			{formatQuantity(
																				o.qty,
																			)}{' '}
																			{
																				o.unit
																			}
																		</strong>
																	</li>
																),
															)}
														</ul>
													) : (
														<p>
															Nenhum produto
															comprado neste
															ciclo.
														</p>
													)}
												</article>
											))
									) : (
										<div className="empty">
											<h2>
												A primeira compra conta a
												história.
											</h2>
											<p>
												Encerre uma compra para ver os
												produtos e as quantidades aqui.
											</p>
											<button
												className="button"
												onClick={() =>
													navigate('pantry')
												}
											>
												Ir para a despensa →
											</button>
										</div>
									)}
								</>
							)}
						</>
					)}
				</main>
				{editor && (
					<ProductEditor
						product={editor.product}
						products={state.products}
						onClose={() => setEditor(null)}
						onSave={(product) => {
							dispatch({ type: 'save-product', product });
							setEditor(null);
						}}
					/>
				)}
				{confirmation && (
					<Dialog
						title={confirmation.title}
						onClose={() => setConfirmation(null)}
					>
						<p>{confirmation.text}</p>
						<div className="dialog-actions">
							<button
								className="button secondary"
								onClick={() => setConfirmation(null)}
							>
								Voltar
							</button>
							<button
								className="button"
								onClick={() => {
									confirmation.action();
									setConfirmation(null);
								}}
							>
								{confirmation.label}
							</button>
						</div>
					</Dialog>
				)}
			</div>
		</div>
	);
}
