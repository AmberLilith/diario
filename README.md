# Diário

Aplicação web para registrar, consultar e editar relatos pessoais com texto, humor e fotos.

## Funcionalidades

- Criar, editar e excluir relatos.
- Editor de texto com formatação básica.
- Associar um humor ao relato.
- Inserir fotos a partir de arquivos do dispositivo.
- Tirar fotos diretamente pela câmera do computador ou dispositivo móvel.
- Alternar entre câmera frontal e traseira em dispositivos que disponibilizam as duas.
- Pesquisar relatos pelo texto.
- Filtrar relatos por período de datas.
- Paginação dos relatos.
- Persistência dos dados no Supabase.
- Conteúdo dos relatos e texto indexável armazenados de forma criptografada.
- Autenticação de usuários.
- Armazenamento de fotos no Supabase Storage.
- Interface responsiva para desktop e dispositivos móveis.

## Tecnologias

- **Angular** — aplicação frontend.
- **TypeScript** — linguagem principal.
- **Angular Material** — componentes de interface.
- **Quill** — editor de texto.
- **Supabase** — banco de dados, autenticação e armazenamento de imagens.
- **Firebase Hosting** — hospedagem da aplicação.
- **GitHub Actions** — build e deploy automatizados.

## Arquitetura

A aplicação é organizada em camadas, separando componentes de interface, modelos e serviços responsáveis pelo acesso aos dados e pelas regras de negócio.

De forma simplificada:

```text
Angular
├── Components
│   ├── Relatos
│   └── Emoções
├── Services
│   ├── Autenticação
│   ├── Relatos
│   ├── Emoções
│   ├── Supabase
│   └── Criptografia
└── Models

Supabase
├── PostgreSQL
├── Authentication
└── Storage

Firebase Hosting
└── Aplicação Angular compilada
```

## Segurança

Os dados sensíveis utilizados pela aplicação não devem ser versionados no repositório.

No ambiente de produção, as configurações de ambiente são geradas durante o workflow do GitHub Actions a partir de **GitHub Secrets**.

Entre as configurações utilizadas estão:

- URL do Supabase;
- chave pública do Supabase;
- chave utilizada pela camada de criptografia;
- credenciais de serviço do Firebase para o deploy.

**Nunca coloque essas credenciais diretamente no código ou no README.**

## Busca por texto

O conteúdo dos relatos é criptografado, portanto a pesquisa textual não é realizada diretamente no PostgreSQL sobre o conteúdo criptografado.

Quando uma pesquisa por texto é realizada, os registros do período selecionado são recuperados, descriptografados no cliente e então filtrados pelo conteúdo real do relato.

Isso preserva a criptografia armazenada no banco, mas significa que pesquisas textuais sobre grandes volumes de registros podem exigir otimização futura.

## Fotos e câmera

As fotos inseridas nos relatos são enviadas para o Supabase Storage e seus caminhos são associados ao relato.

A captura pela câmera utiliza as APIs de mídia do navegador. Em dispositivos móveis, quando o navegador disponibiliza câmeras frontal e traseira, o botão **Trocar câmera** alterna entre elas.

O acesso à câmera depende das permissões concedidas pelo navegador e, em geral, requer um contexto seguro (HTTPS).

## Desenvolvimento local

Instale as dependências:

```bash
npm install
```

Execute a aplicação em modo de desenvolvimento:

```bash
ng serve
```

Depois acesse o endereço informado pelo Angular CLI, normalmente:

```text
http://localhost:4200
```

Para gerar o build de produção:

```bash
npm run build
```

## Configuração do Supabase

A configuração do Supabase e o processo utilizado para desenvolvimento local estão documentados em:

[Configuração do Supabase local](https://dev-tutorials-gamma.vercel.app/docs/frontend/supabase_container_local)

## Como a aplicação foi desenvolvida

A documentação do processo de desenvolvimento está disponível em:

[Documentação da aplicação Angular + Supabase](https://dev-tutorials-gamma.vercel.app/docs/frontend/angular/aplicacao_angular_supabase)

## Deploy

O projeto utiliza **GitHub Actions** para automatizar o deploy.

O fluxo é executado quando alterações são enviadas para a branch `main`:

```text
Push na main
    ↓
GitHub Actions
    ↓
Instalação das dependências
    ↓
Criação dos arquivos de ambiente a partir dos Secrets
    ↓
Build Angular
    ↓
Firebase Hosting
```

As credenciais utilizadas no deploy ficam armazenadas como **GitHub Secrets**, e não no repositório.

## Licença

Este projeto é de uso pessoal. Não há uma licença de código aberto definida no momento.
