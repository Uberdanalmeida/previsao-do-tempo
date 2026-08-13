# Previsão do Tempo

Aplicação web para consultar informações meteorológicas de uma localização específica, desenvolvida com HTML, CSS e JavaScript.

## Descrição

A aplicação permite pesquisar condições climáticas e previsão de tempo através de:

- Nome da cidade ou estado
- CEP (Código de Endereçamento Postal)
- Entrada por voz (reconhecimento de voz do navegador)

Após a busca, exibe dados meteorológicos atuais e previsão para os 5 próximos dias, com interface responsiva para computadores, tablets e smartphones.

## Funcionalidades

- **Pesquisa por localização**: Busca por cidade, estado ou CEP
- **Pesquisa por voz**: Reconhecimento de voz através do microfone do dispositivo
- **Condições atuais**: Temperatura, condição do tempo, umidade, velocidade do vento
- **Previsão**: Informações para os próximos 5 dias (temperatura máxima/mínima, descrição)
- **Informações de endereço**: Quando pesquisa por CEP, exibe logradouro, bairro, cidade e estado

## Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilização e responsividade
- **JavaScript** - Lógica e interatividade
- **Open-Meteo API** - Dados meteorológicos e geolocalização
- **ViaCEP API** - Consulta de endereços por CEP
- **Web Speech API** - Reconhecimento de voz
- **Phosphor Icons** - Ícones da interface

## Integração com APIs

### Open-Meteo

Fornece dados meteorológicos e coordenadas geográficas (latitude, longitude, temperatura, umidade, velocidade do vento, previsão).

### ViaCEP

Converte CEP em endereço (logradouro, bairro, cidade, estado) para localizar a região e obter dados meteorológicos.

### Web Speech API

Implementa recurso de pesquisa por voz, convertendo fala em texto para busca automática.

## 👨‍💻 Desenvolvedor

Uberdan Almeida

Desenvolvedor Front-end