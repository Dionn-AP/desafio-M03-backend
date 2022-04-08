create database dindin;


--CRIACAO DA TABELA USUARIOS
drop table if exists usuarios;

create table usuarios(
    id serial primary key,
    nome text not null,
    email varchar(150) unique not null,
    senha text not null
);


--CRIACAO DA TABELA CATEGORIAS
drop table if exists categorias;

create table categorias (
    id serial primary key,
    nome varchar(30) not null,
    descricao text not null
);


--CRIACAO DA TABELA TRANSACOES
drop table if exists transacoes;

create table transacoes (
    id serial primary key,
    descricao text,
    valor int not null,
    data date,
    categoria_id integer not null,
    usuario_id integer not null,
    foreign key (categoria_id) references categorias (id),
    foreign key (usuario_id) references usuarios (id),
    tipo varchar(8) not null
);


--CRIACAO DOS TIPOS DE CATEGORIAS
insert into categorias 
(nome, descricao) 
values 
('Salario', 'Receita líquida recebida por trabalho no regime CLT.'), 
('Alimentação', 'Gêneros alimentícios como frutas, legumes, proteínas e/ou derivados de origem animal ou vegetal.'), 
('Cuidados Pessoais', 'Produtos de higiene pessoal, perfumes, hidratantes, gel capilar, creme, barbeador, etc.'), 
('Educacão', 'Escola, reforço escolar, curso profissionalizante, curso técnico, faculdade, universidade.'),
('Saúde', 'Plano de saúde, compra de remédios e gastos com consultas e exames.'), 
('Lazer', 'Passeios e atividade que incluem diversão, bem como viagens familiares ou individual, entre outros hobbies.'), 
('Casa', 'Eletrodomésticos, móveis, utensílios de cama, mesa e banho, ornamento e estética do lar.'), 
('Assinaturas e Serviços', 'Serviçõs de streaming, internet, telefone, etc.'),
('Outras receitas', 'Quaisquer outros tipos de receitas.'),
('Outras despesas', 'Quaisquer outros tipos de despesas.');



