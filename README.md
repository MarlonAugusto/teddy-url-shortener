# Teddy URL Shortener API

API para encurtamento de URLs com autenticação JWT.

## Sobre o Projeto

Esta API permite que os usuários encurtem URLs. Usuários autenticados podem gerenciar suas URLs com operações de CRUD.

## Tecnologias Utilizadas

- **NestJS** como framework principal
- **TypeORM** para gerenciamento do banco de dados
- **PostgreSQL** como banco de dados relacional
- **CI/CD** para facilitar a a visualização do Lint, Testes e Build
- **JWT** para autenticação segura
- **Swagger** para documentação interativa da API

---

## Como Clonar e Configurar o Projeto

### 1️ - **Clonar o Repositório**

```sh
 git clone https://github.com/MarlonAugusto/teddy-url-shortener.git
 cd teddy-url-shortener
```

### 2️ - **Configurar Variáveis de Ambiente**

Apague o nome do arquivo `development.env` para ficar com o nome `.env` na raiz do projeto, ele é o environment do sistema.

### 3️ - **Instalar Dependências**

```sh
npm install
```

### 4️ - **Rodar a API Localmente**

```sh
npm run start
```

A API estará disponível em `http://localhost:8000`.
O SWAGGER estará disponível em `http://localhost:8000/docs`.

---

## **Rotas da API**

### **Autenticação**

| Método | Rota             | Descrição                        |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Registrar novo usuário           |
| POST   | `/auth/login`    | Fazer login e obter um token JWT |
| POST   | `/auth/logout`   | Fazer logout                     |
----
### **Usuário**

| Método | Rota         | Descrição                                |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/user/info` | Obter informações do usuário autenticado |
----
### **URLs**

| Método | Rota              | Descrição                         |
| ------ | ----------------- | --------------------------------- |
| POST   | `/short/url`      | Criar uma URL encurtada           |
| GET    | `/short/url`      | Listar URLs encurtadas do usuário |
| PATCH  | `/short/url/{id}` | Atualizar URL encurtada           |
| DELETE | `/short/url/{id}` | Excluir URL encurtada             |
| GET    | `/short/url/{id}` | Obter detalhes da URL encurtada   |
----
### **Redirect**

| Método | Rota              | Descrição                         |
| ------ | ----------------- | --------------------------------- |
| GET    | `/:shortUrl`      | Criar uma URL encurtada           |

---

## **Executando Testes**

Para rodar os testes unitários:

```sh
npm run test
```

Para rodar os testes com cobertura de código:

```sh
npm run test:nocache
```

---

## **Melhorias Futuras**

- Implementação de um **ambiente front-end** para gerenciar as URLs encurtadas
- Funcionalidade de **recuperação de senha** via e-mail
- Configuração para que o **Swagger só rode no ambiente de desenvolvimento**
- Melhorias na **segurança e validação** dos inputs
- Conseguir montar sua propria URL. Ex: localhost:8000/Marlon
- Acrescentar containers
---

**Desenvolvido por** [Marlon Augusto](https://github.com/MarlonAugusto)

