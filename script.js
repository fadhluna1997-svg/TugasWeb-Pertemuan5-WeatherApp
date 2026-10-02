const API_KEY = "d158cc5ebc2e93fa3059d9478bc3b611";

if (
    !API_KEY ||
    API_KEY === "d158cc5ebc2e93fa3059d9478bc3b611"
) {
    console.warn(
        "API Key OpenWeatherMap belum dimasukkan."
    );
}



const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const statusSection = document.querySelector(".status-section");

const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");

const historyList = document.getElementById("historyList");

const celsiusButton = document.getElementById("celsiusButton");
const fahrenheitButton = document.getElementById("fahrenheitButton");

const HISTORY_KEY = "weatherSearchHistory";

let currentTemperature = null;
let currentUnit = "C";


const getWeather = async (city) => {

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    try {

        const response = await fetch(url);

        if (response.status === 404) {
            throw new Error(
                "Kota tidak ditemukan. Silakan periksa nama kota."
            );
        }

        if (response.status === 401) {
            throw new Error(
                "API Key tidak valid atau belum aktif."
            );
        }

        if (!response.ok) {
            throw new Error(
                "Server gagal memberikan data cuaca."
            );
        }

        const data = await response.json();

        return data;

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error(
                "Gagal terhubung ke server. Periksa koneksi internet kamu."
            );
        }

        throw error;
    }
};


const displayTemperature = () => {

    if (currentTemperature === null) {
        return;
    }

    if (currentUnit === "C") {

        temperature.textContent =
            `${Math.round(currentTemperature)}°C`;

    } else {

        const fahrenheit =
            (currentTemperature * 9 / 5) + 32;

        temperature.textContent =
            `${Math.round(fahrenheit)}°F`;
    }
};


const displayWeather = (data) => {

    cityName.textContent = data.name;

    currentTemperature = data.main.temp;

    currentUnit = "C";

    displayTemperature();

    description.textContent =
        data.weather[0].description;

    humidity.textContent =
        `💧 Kelembaban: ${data.main.humidity}%`;

    const iconCode =
        data.weather[0].icon;

    const iconUrl =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherIcon.src = iconUrl;

    weatherIcon.alt =
        `Ikon cuaca ${data.weather[0].description}`;

    weatherResult.classList.remove("hidden");

    celsiusButton.classList.add("active-unit");

    fahrenheitButton.classList.remove("active-unit");
};


const showLoading = () => {

    loading.classList.remove("hidden");

    searchButton.disabled = true;

    searchButton.textContent = "Mencari...";

    statusSection.setAttribute("aria-busy", "true");
};


const hideLoading = () => {

    loading.classList.add("hidden");

    searchButton.disabled = false;

    searchButton.textContent = "Cari";

    statusSection.setAttribute("aria-busy", "false");
};


const showError = (message) => {

    errorMessage.textContent = `❌ ${message}`;

    errorMessage.classList.remove("hidden");
};


const hideError = () => {

    errorMessage.textContent = "";

    errorMessage.classList.add("hidden");
};


const getSearchHistory = () => {

    const history =
        localStorage.getItem(HISTORY_KEY);

    return history
        ? JSON.parse(history)
        : [];
};


const saveSearchHistory = (city) => {

    const history = getSearchHistory();

    const existingCity = history.find(
        (item) =>
            item.toLowerCase() === city.toLowerCase()
    );

    if (!existingCity) {

        history.unshift(city);

        const limitedHistory =
            history.slice(0, 5);

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(limitedHistory)
        );
    }
};


const displaySearchHistory = () => {

    const history = getSearchHistory();

    if (history.length === 0) {

        historyList.innerHTML = `
            <li>Belum ada riwayat pencarian.</li>
        `;

        return;
    }

    historyList.innerHTML = history
        .map(
            (city) => `
                <li>
                    <button
                        type="button"
                        class="history-button"
                        data-city="${city}"
                    >
                        ${city}
                    </button>
                </li>
            `
        )
        .join("");
};


const searchWeather = async (city) => {

    try {

        hideError();

        weatherResult.classList.add("hidden");

        showLoading();

        const data =
            await getWeather(city);

        displayWeather(data);

        saveSearchHistory(data.name);

        displaySearchHistory();

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();

    }
};


celsiusButton.addEventListener("click", () => {

    currentUnit = "C";

    displayTemperature();

    celsiusButton.classList.add("active-unit");

    fahrenheitButton.classList.remove("active-unit");
});


fahrenheitButton.addEventListener("click", () => {

    currentUnit = "F";

    displayTemperature();

    fahrenheitButton.classList.add("active-unit");

    celsiusButton.classList.remove("active-unit");
});


weatherForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const city =
        cityInput.value.trim();

    hideError();

    if (!city) {

        showError(
            "Silakan masukkan nama kota terlebih dahulu."
        );

        return;
    }

    searchWeather(city);
});

historyList.addEventListener("click", (event) => {

    if (!event.target.classList.contains("history-button")) {
        return;
    }

    const city = event.target.getAttribute("data-city");

    cityInput.value = city;

    searchWeather(city);
});

displaySearchHistory();