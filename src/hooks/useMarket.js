import { useEffect, useReducer, useState } from 'react';
import {
	emptyState,
	loadMarket,
	marketReducer,
	STORAGE_KEY,
} from '../domain/market';

function initialize() {
	try {
		return loadMarket(window.localStorage);
	} catch {
		return {
			state: emptyState(),
			writable: false,
			warning:
				'O navegador bloqueou o armazenamento. Libere o armazenamento e recarregue para usar sua lista.',
		};
	}
}

export default function useMarket() {
	const [initial] = useState(initialize);
	const [state, dispatch] = useReducer(marketReducer, initial.state);
	const [warning, setWarning] = useState(initial.warning);

	useEffect(() => {
		if (!initial.writable) return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			setWarning('');
		} catch {
			setWarning(
				'Não foi possível salvar as últimas alterações. Mantenha esta página aberta e libere espaço no navegador antes de continuar.',
			);
		}
	}, [state, initial.writable]);

	return { state, dispatch, warning, writable: initial.writable };
}
