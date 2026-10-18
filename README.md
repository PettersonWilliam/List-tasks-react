# Minha Feira

Aplicativo pessoal em React para conferir a despensa, calcular a compra do mês e consultar compras anteriores. Os dados ficam no navegador, sem backend.

## Executar

Com as dependências instaladas:

```sh
npm run dev
```

Verificações:

```sh
npm run build
npm run lint
npm test
```

## Fluxo

1. Cadastre nome, quantidade em casa, quanto quer ter após a feira e observações opcionais. Novos produtos são contados em itens; unidades de registros antigos são preservadas.
2. Confira o estoque e marque **Conferido**. O card fica verde e o campo e os botões de quantidade ficam bloqueados.
3. Para ajustar, desmarque **Conferido** ou abra **Editar produto**. Cancelar ou salvar sem mudanças mantém a conferência. Salvar mudanças exige nova conferência.
4. Depois de conferir todos os produtos, prepare a lista: `máximo(0, desejado − em casa)`.
5. No mercado, ajuste quanto vai levar e marque **No carrinho**. Zero deixa o produto fora da compra.
6. Encerre a compra: apenas as quantidades marcadas entram no saldo e no histórico.
7. Na próxima compra, os produtos e o histórico permanecem; todas as conferências são reiniciadas.

O consumo durante o mês não é registrado automaticamente. A quantidade em casa deve ser conferida antes de cada compra.

## Dados antigos e armazenamento

- A versão atual usa a chave `minha-feira:v1` do `localStorage`.
- No primeiro acesso, a lista antiga da chave `tasks` é importada, mantendo nomes e descrições (em **Observações**). A chave original não é alterada nem apagada.
- Quantidades antigas em texto livre não são adivinhadas. Abra **Editar produto** para configurar cada item importado antes de conferir.
- A importação só funciona na mesma origem e no mesmo navegador da lista anterior. Arquivo HTML, localhost e site publicado têm armazenamentos separados.
- Dados inválidos bloqueiam a escrita em vez de serem substituídos por uma lista vazia. Falhas ao salvar aparecem na tela.
- Não há sincronização entre aparelhos nem backup externo. Limpar os dados do site remove os registros locais.

## Organização

- `src/domain/market.js`: regras do ciclo, validação e migração, independentes da interface.
- `src/hooks/useMarket.js`: estado e persistência no navegador.
- `src/components/market/`: cards, quantidades, edição e diálogos.
- `src/App.jsx`: navegação entre despensa, compras e histórico.

O protótipo HTML foi apenas uma demonstração. O aplicativo real começa vazio ou importa a lista antiga, sem inserir produtos fictícios.

## Quantidades e ícones

Novos cadastros e ajustes aceitam apenas números inteiros. Valores fracionados de versões anteriores são preservados e exigem revisão no formulário, sem arredondamento automático; o histórico anterior não é alterado.

Os ícones são sugeridos localmente pelo nome do produto. A categoria e o ícone são identificados automaticamente pelo nome, sem campos de seleção. Nomes não reconhecidos usam Outros e um ícone genérico. O ícone continua visível quando o card está conferido e acompanha a lista de compras.

Na despensa vazia há apenas o botão Cadastrar primeiro produto. Depois do primeiro cadastro, o botão Novo produto aparece no cabeçalho.
