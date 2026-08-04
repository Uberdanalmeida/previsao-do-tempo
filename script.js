function limparTexto(texto) {
  return texto
    .replace(/[.,;:!?]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function BuscarCidade() {
  const cidade = limparTexto(document.querySelector("input").value);
  const resultado = document.querySelector(".info-container");

  if (!cidade) {
    alert("Por favor, digite o nome de uma cidade.");
    return;
  }

  resultado.innerHTML = "<p>Buscando informações...</p>";

  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`,
    );

    const geoData = await geo.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultado.innerHTML = "<p>Não foi possível encontrar esta cidade.</p>";
      return;
    }

    const local = geoData.results[0];
    const { latitude, longitude, name, country, admin1 } = local;

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

    const resposta = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );

    const dados = await resposta.json();
    const icone = icones[dados.current.weather_code] || "🌍";

    resultado.innerHTML = `
      <div class="topo-clima">
        <div class="temp">${dados.current.temperature_2m}°C</div>
        <div class="icone">${icone}</div>
      </div>

      <div class="local-clima">
        <strong>${name}, ${country}</strong><br>
        <span>${admin1 || ""}${admin1 ? " - " : ""}${country}</span>
      </div>

      <div class="info">
        <div>🌡️ Máx.<br>${dados.daily.temperature_2m_max[0]}°C</div>
        <div>❄️ Mín.<br>${dados.daily.temperature_2m_min[0]}°C</div>
        <div>💧 Umidade<br>${dados.current.relative_humidity_2m}%</div>
        <div>💨 Vento<br>${dados.current.wind_speed_10m} km/h</div>
      </div>
    `;
  } catch (erro) {
    console.error(erro);
    resultado.innerHTML =
      "<p>Não foi possível carregar os dados no momento.</p>";
  }
}

function Microfone() {
  const voz = new webkitSpeechRecognition();
  voz.lang = "pt-BR";
  voz.start();

  voz.onresult = function (evento) {
    const cidade = evento.results[0][0].transcript;
    document.querySelector("input").value = cidade;
    BuscarCidade();
  }
}
