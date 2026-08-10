function limparTexto(texto) {
  return texto
    .replace(/[.,;:!?]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function montarTextoLocalizacao(localizacao) {
  if (localizacao.detalhes) {
    const partes = [];

    if (localizacao.detalhes.logradouro) {
      partes.push(localizacao.detalhes.logradouro);
    }

    if (localizacao.detalhes.bairro) {
      partes.push(localizacao.detalhes.bairro);
    }

    if (localizacao.detalhes.localidade) {
      partes.push(localizacao.detalhes.localidade);
    }

    if (localizacao.detalhes.uf) {
      partes.push(localizacao.detalhes.uf);
    }

    return partes.join(", ");
  }

  return [localizacao.name, localizacao.admin1, localizacao.country]
    .filter(Boolean)
    .join(", ");
}

function ehCep(texto) {
  return /^\d{5}-?\d{3}$/.test(texto.replace(/\s/g, ""));
}

async function buscarLocalizacao(consulta) {
  const texto = limparTexto(consulta);

  if (ehCep(texto)) {
    const cep = texto.replace(/\D/g, "");

    const respostaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    const dadosCep = await respostaCep.json();

    if (dadosCep.erro) {
      throw new Error("CEP não encontrado.");
    }

    const busca = `${dadosCep.localidade}, ${dadosCep.uf}`;

    const respostaGeo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        busca,
      )}&count=1`,
    );

    const geoData = await respostaGeo.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Localização não encontrada para o CEP informado.");
    }

    return {
      ...geoData.results[0],
      detalhes: {
        logradouro: dadosCep.logradouro || "",
        bairro: dadosCep.bairro || "",
        localidade: dadosCep.localidade || "",
        uf: dadosCep.uf || "",
      },
    };
  }

  const respostaGeo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      texto,
    )}&count=1`,
  );

  const geoData = await respostaGeo.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("Localização não encontrada.");
  }

  return {
    ...geoData.results[0],
    detalhes: null,
  };
}

async function BuscarCidade() {
  const input = document.querySelector("input");
  const cidade = limparTexto(input.value);
  const resultado = document.querySelector(".tempo");

  if (!cidade) {
    resultado.style.display = "block";
    resultado.innerHTML = "Digite uma Cidade, Estado ou CEP.";
    return;
  }

  try {
    const localizacao = await buscarLocalizacao(cidade);

    const { latitude, longitude, name } = localizacao;

    const localDetalhado = montarTextoLocalizacao(localizacao);

    const clima = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`,
    );

    if (!clima.ok) {
      throw new Error("Não foi possível buscar os dados do clima.");
    }

    const climaData = await clima.json();

    const icones = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌦️",
      56: "🌧️",
      57: "🌧️",
      61: "🌧️",
      63: "🌧️",
      65: "🌧️",
      66: "🌧️",
      67: "🌧️",
      71: "❄️",
      73: "❄️",
      75: "❄️",
      77: "🌨️",
      80: "🌦️",
      81: "🌧️",
      82: "🌧️",
      85: "🌨️",
      86: "🌨️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️",
    };

    const descricoes = {
      0: "Céu limpo",
      1: "Predominantemente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina",
      51: "Garoa fraca",
      53: "Garoa moderada",
      55: "Garoa forte",
      56: "Garoa congelante",
      57: "Garoa congelante forte",
      61: "Chuva fraca",
      63: "Chuva moderada",
      65: "Chuva forte",
      66: "Chuva congelante",
      67: "Chuva congelante forte",
      71: "Neve fraca",
      73: "Neve moderada",
      75: "Neve forte",
      77: "Neve",
      80: "Pancadas de chuva",
      81: "Pancadas de chuva",
      82: "Pancadas fortes",
      85: "Pancadas de neve",
      86: "Pancadas de neve",
      95: "Tempestade",
      96: "Tempestade com granizo",
      99: "Tempestade forte com granizo",
    };

    // Dados do clima atual
    const current = climaData.current;

    const temperaturaAtual = current.temperature_2m;
    const umidadeAtual = current.relative_humidity_2m;
    const ventoAtual = current.wind_speed_10m;
    const codigoAtual = current.weather_code;

    const icone = icones[codigoAtual] || "🌍";
    const descricao = descricoes[codigoAtual] || "Condição desconhecida";

    // Previsão dos próximos 5 dias
    const previsaoHTML = climaData.daily.time
      .slice(1, 6)
      .map((data, index) => {
        const i = index + 1;

        const dataFormatada = new Date(`${data}T12:00:00`);

        const dia = dataFormatada
          .toLocaleDateString("pt-BR", {
            weekday: "short",
          })
          .replace(".", "");

        const codigoDia = climaData.daily.weather_code[i];

        const iconeDia = icones[codigoDia] || "🌍";

        const descricaoDia = descricoes[codigoDia] || "Clima desconhecido";

        const temperaturaMax = climaData.daily.temperature_2m_max[i];

        const temperaturaMin = climaData.daily.temperature_2m_min[i];

        return `
          <div class="previsao-card">

            <strong>${dia}</strong>

            <div class="previsao-icone">
              ${iconeDia}
            </div>

            <span class="previsao-descricao">
              ${descricaoDia}
            </span>

            <div class="temperaturas">
              <span class="max">
                ${temperaturaMax}°C
              </span>

              <span class="min">
                ${temperaturaMin}°C
              </span>
            </div>

          </div>
        `;
      })
      .join("");

    resultado.style.display = "block";

    resultado.innerHTML = `
      <h2>Previsão do Tempo</h2>

      <div class="topo-clima">

        <div class="temp">
          ${temperaturaAtual}°C
        </div>

        <div class="icone">
          ${icone}
        </div>

      </div>

      <div class="descricao-clima">
        ${descricao}
      </div>

      <div class="local-clima">

        <strong>
          <i class="ph ph-map-pin"></i>
          ${name}
        </strong>

        <br>

        <span>
          ${localDetalhado}
        </span>

      </div>

      <div class="info">

        <div>
          🌡️ Máx.<br>
          ${climaData.daily.temperature_2m_max[0]}°C
        </div>

        <div>
          ❄️ Mín.<br>
          ${climaData.daily.temperature_2m_min[0]}°C
        </div>

        <div>
          💧 Umidade<br>
          ${umidadeAtual}%
        </div>

        <div>
          💨 Vento<br>
          ${ventoAtual} km/h
        </div>

      </div>

      <div class="previsao">

        <h2>Próximos dias</h2>

        <div class="previsao-container">
          ${previsaoHTML}
        </div>

      </div>
    `;
  } catch (erro) {
    console.error(erro);

    resultado.style.display = "block";

    resultado.innerHTML = "Não foi possível carregar os dados no momento.";
  }
}

function Microfone() {
  const voz = new window.webkitSpeechRecognition();

  voz.lang = "pt-BR";
  voz.start();

  voz.onresult = function (evento) {
    const local = evento.results[0][0].transcript;

    document.querySelector("input").value = limparTexto(local);

    BuscarCidade();
  };
}
