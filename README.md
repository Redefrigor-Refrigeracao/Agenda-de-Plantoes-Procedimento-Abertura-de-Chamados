# Plantão Técnico REDEFRIGOR

Site com o técnico de plantão do dia, a agenda de plantões e o passo a passo para abrir chamados no Auvodesk.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html` | Página pública (clientes) |
| `admin.html` | Painel para editar a escala (acesso restrito) |
| `escala.json` | Dados: técnicos, plantões e configurações |
| `logo-redefrigor.png`, `logo-auvodesk.png` | Logos |

Todos esses arquivos precisam ficar **na raiz** do repositório, lado a lado.

## Como editar a escala

1. Acesse `https://<seu-usuario>.github.io/<repositorio>/admin.html`.
2. Na primeira vez, gere um token no GitHub:
   - **Settings → Developer settings → Fine-grained tokens → Generate new token**
   - **Repository access:** *Only select repositories* → este repositório
   - **Permissions → Contents:** *Read and write*
3. Cole o token no painel e clique em **Entrar** (marque “Lembrar neste computador” se for seu computador).
4. Clique nos dias do calendário para escolher o técnico, cadastre técnicos na aba **Técnicos** e ajuste horários em **Configurações**.
5. Clique em **Publicar alterações**. O GitHub Pages atualiza o site em cerca de 1 minuto.

### Por que só você consegue editar

O painel grava o `escala.json` direto no repositório usando a API do GitHub. Sem um token com permissão de escrita nesse repositório, ninguém consegue salvar, mesmo abrindo o `admin.html`. O token fica salvo apenas no navegador de quem entrou.

Se o token vazar, revogue em **Settings → Fine-grained tokens** e gere outro.
