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
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=1`,
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
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=1`,
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
    resultado.innerHTML = "<p>Digite uma Cidade, Estado ou CEP.</p>";
    return;
  }

  try {
    const localizacao = await buscarLocalizacao(cidade);
    const { latitude, longitude, name, admin1, country } = localizacao;
    const localDetalhado = montarTextoLocalizacao(localizacao);

    const clima = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );
    const climaData = await clima.json();

    const icones = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      61: "🌧️",
      63: "🌧️",
      65: "🌧️",
      71: "❄️",
      80: "🌦️",
      95: "⛈️",
    };

    const current = climaData.current_weather ?? {};
    const currentTime = current.time;
    let humidity = "—";

    if (
      climaData.hourly &&
      climaData.hourly.time &&
      climaData.hourly.relativehumidity_2m
    ) {
      const index = climaData.hourly.time.indexOf(currentTime);
      if (index !== -1) {
        humidity = climaData.hourly.relativehumidity_2m[index];
      }
    }

    const icone = icones[current.weathercode] || "🌍";

    resultado.style.display = "block";
    resultado.innerHTML = `
      <h2>Previsão do Tempo</h2>
      <div class="topo-clima">
        <div class="temp">${current.temperature}°C</div>
        <div class="icone">${icone}</div>
      </div>
      <div class="local-clima">
        <strong><i class="ph ph-map-pin"></i>${name}</strong><br>
        <span>${localDetalhado}</span>
      </div>
      <div class="info">
        <div>🌡️ Máx.<br>${climaData.daily.temperature_2m_max[0]}°C</div>
        <div>❄️ Mín.<br>${climaData.daily.temperature_2m_min[0]}°C</div>
        <div>💧 Umidade<br>${climaData.hourly.relativehumidity_2m[0]}%</div>
        <div>💨 Vento<br>${current.windspeed ?? "—"} km/h</div>
      </div>
    `;
  } catch (erro) {
    resultado.style.display = "block";
    resultado.innerHTML = "<p>Erro ao buscar a previsão do tempo.</p>";
    console.error(erro);
  }
}

function Microfone() {
  const voz = new window.webkitSpeechRecognition();
  voz.lang = "pt-BR";
  voz.start();

  voz.onresult = function (evento) {
    const local = evento.results[0][0].transcript;
    document.querySelector("input").value = local;
    BuscarCidade();
  };
}
