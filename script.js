// --- Authentication Check ---
// If user is not logged in, redirect to the login page
if (!sessionStorage.getItem('roamr_currentUser')) {
    window.location.href = 'login.html';
}

// Global map variables
let map;
let markers = [];
let mapInitialized = false;
let lostModeMap;
let lostModeMapInitialized = false;
let lastActiveSectionId = 'home-section'; // To track the main view
// --- Translator Functionality ---
const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const translateBtn = document.getElementById('translate-btn');
const swapBtn = document.getElementById('swap-btn');
const statusDiv = document.getElementById('status');

translateBtn.addEventListener('click', () => {
    translateText();
});

swapBtn.addEventListener('click', () => {
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;
    const tempText = inputText.value;
    inputText.value = outputText.value;
    outputText.value = tempText;
});

function translateText() {
    const text = inputText.value.trim();
    const source = sourceLang.value;
    const target = targetLang.value;

    if (text === '') {
        outputText.value = '';
        return;
    }

    statusDiv.textContent = 'Translating...';
    outputText.value = '';

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.responseData) {
                outputText.value = data.responseData.translatedText;
                statusDiv.textContent = ''; // Clear status
            } else {
                outputText.value = 'Error: Could not translate.';
                statusDiv.textContent = 'Translation failed.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            outputText.value = 'Error: Could not connect to the translation service.';
            statusDiv.textContent = 'Connection error.';
        });
}

// --- Typing Animation for Hero Section ---
const typingTagline = document.getElementById('typing-tagline');
const taglines = [
    "Your world. One tap away.",
    "Travel smart. Travel light.",
    "Offline or online — Roamr’s got your back."
];
let taglineIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentTagline = taglines[taglineIndex];
    if (isDeleting) {
        // Erase characters
        typingTagline.textContent = currentTagline.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            taglineIndex = (taglineIndex + 1) % taglines.length;
        }
    } else {
        // Type characters
        typingTagline.textContent = currentTagline.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentTagline.length) {
            isDeleting = true;
            // Pause at the end of the line
            setTimeout(type, 2000); // Wait 2s before deleting
            return;
        }
    }

    // Determine typing speed
    let typeSpeed = isDeleting ? 50 : 150;
    setTimeout(type, typeSpeed);
}

// Start the typing animation when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typingTagline) {
        setTimeout(type, 500); // Start after a short delay
    }
});

// --- Theme Toggle Functionality ---
const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
    // Save preference to localStorage
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Function to apply saved theme on load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
}

// --- Calendar Functionality ---
const monthYearDisplay = document.getElementById('month-year-display');
const calendarDaysGrid = document.getElementById('calendar-days-grid');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
    calendarDaysGrid.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    // Previous month's days
    for (let i = firstDayOfMonth; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = lastDateOfPrevMonth - i + 1;
        dayDiv.classList.add('other-month-day');
        calendarDaysGrid.appendChild(dayDiv);
    }

    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        // Highlight the current day
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('current-day');
        }
        calendarDaysGrid.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initial render
renderCalendar();

// --- Cultural Tips Functionality ---
const getCulturalTipsBtn = document.getElementById('get-cultural-tips-btn');
const culturalTipsResultDiv = document.getElementById('cultural-tips-result');

const culturalTipsDB = {
    'in': { // India
        countryName: 'India',
        tips: [
            "Greetings: A 'Namaste' (joining palms together) is a common and respectful greeting.",
            "Eating: Use your right hand for eating and handling food, as the left hand is often considered unclean.",
            "Temples: Remove your shoes before entering a temple or a home. Cover your head in Sikh Gurdwaras.",
            "Bargaining: It's common to bargain in local markets and with auto-rickshaw drivers.",
            "Respect for Elders: Show great respect to elders. It's customary to touch their feet as a sign of respect."
        ]
    },
    'jp': { // Japan
        countryName: 'Japan',
        tips: [
            "Bowing: A bow is the traditional greeting. The deeper the bow, the more respect is shown.",
            "Tipping: Tipping is not customary and can be considered rude. Excellent service is standard.",
            "Chopsticks: Never stick your chopsticks upright in a bowl of rice; it's associated with funeral rites.",
            "Shoes: Remove your shoes when entering someone's home, a temple, or traditional restaurants.",
            "Noise Level: Avoid talking loudly on public transportation."
        ]
    },
    'it': { // Italy
        countryName: 'Italy',
        tips: [
            "Coffee: Cappuccino is a morning drink. Ordering one after a meal in the afternoon or evening is unusual.",
            "Greetings: A simple 'buongiorno' (good day) or 'buonasera' (good evening) is polite when entering shops.",
            "Punctuality: Being a few minutes late for social gatherings is common and acceptable.",
            "Dining: Wait for the host to say 'buon appetito' before you start eating.",
            "Cover Charge: Many restaurants have a 'coperto' (cover charge) which includes bread and service."
        ]
    }
    // Add more countries here
};

getCulturalTipsBtn.addEventListener('click', () => {
    culturalTipsResultDiv.innerHTML = '<h3>Finding your location...</h3>';
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        culturalTipsResultDiv.innerHTML = '<h3>Determining your country...</h3>';

        // Using OpenStreetMap's free reverse geocoding API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();

        const countryCode = data.address?.country_code;
        if (countryCode && culturalTipsDB[countryCode]) {
            const tipsData = culturalTipsDB[countryCode];
            let html = `<h3>Cultural Tips for ${tipsData.countryName}</h3><ul>`;
            tipsData.tips.forEach(tip => html += `<li>${tip}</li>`);
            html += '</ul>';
            culturalTipsResultDiv.innerHTML = html;
        } else {
            culturalTipsResultDiv.innerHTML = `<h3>Sorry, no cultural tips found for your current location (${data.address?.country || 'Unknown'}).</h3>`;
        }
    }, (error) => {
        culturalTipsResultDiv.innerHTML = `<h3>Error: ${error.message}. Please enable location services.</h3>`;
    });
});

// --- Currency Converter Functionality ---
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convert-btn');
const resultDisplay = document.getElementById('conversion-result');
const rateInfoDisplay = document.getElementById('rate-info');

const currencies = ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "INR"];
currencies.forEach(currency => {
    const option1 = new Option(currency, currency);
    const option2 = new Option(currency, currency);
    fromCurrencySelect.add(option1);
    toCurrencySelect.add(option2);
});
fromCurrencySelect.value = "USD";
toCurrencySelect.value = "INR";

async function getRates() {
    const ratesCache = localStorage.getItem('currencyRates');
    // Use cache if it's less than 4 hours old or if offline
    if (ratesCache && (new Date() - new Date(JSON.parse(ratesCache).timestamp) < 4 * 60 * 60 * 1000 || !navigator.onLine)) {
        console.log("Using cached currency rates.");
        return JSON.parse(ratesCache);
    }

    console.log("Fetching fresh currency rates.");
    try {
        // Using a free API, replace with a more robust one for production
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Failed to fetch rates.');
        const data = await response.json();
        const ratesData = {
            rates: data.rates,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('currencyRates', JSON.stringify(ratesData));
        return ratesData;
    } catch (error) {
        console.error(error);
        return ratesCache ? JSON.parse(ratesCache) : null; // Fallback to cache on error
    }
}

async function convertCurrency() {
    const ratesData = await getRates();
    if (!ratesData) {
        resultDisplay.textContent = "Error fetching rates.";
        return;
    }

    const amount = parseFloat(amountInput.value);
    const fromRate = ratesData.rates[fromCurrencySelect.value];
    const toRate = ratesData.rates[toCurrencySelect.value];
    const convertedAmount = (amount / fromRate) * toRate;

    resultDisplay.textContent = `${convertedAmount.toFixed(2)} ${toCurrencySelect.value}`;
    rateInfoDisplay.textContent = `Rates last updated: ${new Date(ratesData.timestamp).toLocaleString()}`;
}

convertBtn.addEventListener('click', convertCurrency);

// --- Lost Mode Functionality ---
const activateLostModeBtn = document.getElementById('activate-lost-mode-btn');
const lostModeStatus = document.getElementById('lost-mode-status');
const findClosestBusStopBtn = document.getElementById('find-closest-bus-stop-btn');
let routingControl = null;

function initLostModeMap(userLocation) {
    if (lostModeMapInitialized) {
        lostModeMap.setView(userLocation, 15);
        return;
    };
    lostModeMap = L.map('lost-mode-map', {
        dragging: true, // Ensure map panning is enabled
        scrollWheelZoom: true, // Allow zooming with scroll wheel
        touchZoom: true // Allow pinch-to-zoom on touch devices
    }).setView(userLocation, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(lostModeMap);
    lostModeMapInitialized = true;
}

activateLostModeBtn.addEventListener('click', () => {
    activateLostModeBtn.disabled = true;
    findClosestBusStopBtn.disabled = true;
    lostModeStatus.textContent = 'Finding your location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            lostModeStatus.textContent = 'Finding nearby essential services...';
            initLostModeMap(userLocation);

            // Mark user's location
            L.marker(userLocation, { icon: L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
                .addTo(lostModeMap)
                .bindPopup('<b>You are here</b>').openPopup();

            // Find and display nearby places
            findNearbyPlaces(userLocation);
        },
        (error) => {
            lostModeStatus.textContent = `Error: ${error.message}. Please enable location services.`;
            activateLostModeBtn.disabled = false;
            findClosestBusStopBtn.disabled = false;
        }
    );
});

async function findNearbyPlaces(location) {
    const radius = 2000; // 2km radius
    const lat = location[0];
    const lon = location[1];

    // Overpass API query to find hospitals, police stations, and bus stops
    const query = `
        [out:json];
        (
          node"amenity"="hospital"(around:${radius},${lat},${lon});
          node"amenity"="police"(around:${radius},${lat},${lon});
          node"highway"="bus_stop"(around:${radius},${lat},${lon});
        );
        out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: "data=" + encodeURIComponent(query)
    });
    const data = await response.json();

    lostModeStatus.textContent = `Found ${data.elements.length} places nearby. Click a marker to get directions.`;

    data.elements.forEach(element => {
        let icon, popupText;
        if (element.tags.amenity === 'hospital') {
            icon = L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });
            popupText = `<b>Hospital:</b> ${element.tags.name || 'N/A'}`;
        } else if (element.tags.amenity === 'police') {
            icon = L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png', iconSize: [25, 41], iconAnchor: [12, 41] });
            popupText = `<b>Police Station:</b> ${element.tags.name || 'N/A'}`;
        } else if (element.tags.highway === 'bus_stop') {
            icon = L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });
            popupText = `<b>Bus Stop:</b> ${element.tags.name || 'N/A'}`;
        }

        const marker = L.marker([element.lat, element.lon], { icon: icon }).addTo(lostModeMap);
        marker.bindPopup(popupText);

        // Add click event to show route
        marker.on('click', () => {
            if (routingControl) {
                lostModeMap.removeControl(routingControl);
            }
            routingControl = L.Routing.control({
                waypoints: [L.latLng(location), L.latLng(element.lat, element.lon)],
                routeWhileDragging: true
            }).addTo(lostModeMap);
        });
    });
}

findClosestBusStopBtn.addEventListener('click', () => {
    activateLostModeBtn.disabled = true;
    findClosestBusStopBtn.disabled = true;
    lostModeStatus.textContent = 'Finding your location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            initLostModeMap(userLocation);
            findAndRouteToClosestBusStop(userLocation);
        },
        (error) => {
            lostModeStatus.textContent = `Error: ${error.message}. Please enable location services.`;
            activateLostModeBtn.disabled = false;
            findClosestBusStopBtn.disabled = false;
        }
    );
});

async function findAndRouteToClosestBusStop(userLocation) {
    lostModeStatus.textContent = 'Searching for the closest bus stop...';
    const radius = 2000; // 2km radius
    const lat = userLocation[0];
    const lon = userLocation[1];

    const query = `[out:json];(node"highway"="bus_stop";);out body;`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: "data=" + encodeURIComponent(query)
    });
    const data = await response.json();

    if (data.elements.length === 0) {
        lostModeStatus.textContent = 'No bus stops found within 2km.';
        return;
    }

    let closestBusStop = null;
    let minDistance = Infinity;
    const userLatLng = L.latLng(userLocation);

    data.elements.forEach(element => {
        const busStopLatLng = L.latLng(element.lat, element.lon);
        const distance = userLatLng.distanceTo(busStopLatLng);
        if (distance < minDistance) {
            minDistance = distance;
            closestBusStop = element;
        }
    });

    if (closestBusStop) {
        lostModeStatus.textContent = `Found closest bus stop. Routing...`;
        const destination = L.latLng(closestBusStop.lat, closestBusStop.lon);

        if (routingControl) {
            lostModeMap.removeControl(routingControl);
        }

        routingControl = L.Routing.control({
            waypoints: [userLatLng, destination],
            routeWhileDragging: false,
            lineOptions: { styles: [{ color: 'blue', opacity: 0.8, weight: 5, dashArray: '10, 10' }] }
        }).addTo(lostModeMap);
    }
}

// --- Geolocation Functionality ---
const locateBtn = document.getElementById('locate-me-btn');
let userLocationMarker;

locateBtn.addEventListener('click', () => {
    locateBtn.style.display = 'none'; // Hide the button on click
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const userLocation = [lat, lng];

                // Center the map on the user's location with a high zoom level
                map.setView(userLocation, 16);

                // Add or move a special marker for the user's location
                if (userLocationMarker) {
                    userLocationMarker.setLatLng(userLocation);
                } else {
                    userLocationMarker = L.circleMarker(userLocation, { color: '#007acc', radius: 8 }).addTo(map);
                }
                userLocationMarker.bindPopup('<b>You are here!</b>').openPopup();
            },
            (error) => {
                alert(`Error getting location: ${error.message}`);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// --- Map Functionality ---
function initMap() {
    if (mapInitialized) return; // Prevent re-initialization

    // Check if Leaflet is loaded
    if (typeof L !== 'undefined') {
        const defaultCenter = [20.5937, 78.9629]; // Leaflet uses [lat, lng] array
        map = L.map('map', {
            dragging: true, // Ensure map panning is enabled
            scrollWheelZoom: true, // Allow zooming with scroll wheel
            touchZoom: true // Allow pinch-to-zoom on touch devices
        }).setView(defaultCenter, 5);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        loadMarkers();

        // Add a click listener to the map to add new markers
        map.on('click', function(e) {
            addMarker(e.latlng); // Leaflet event object has a 'latlng' property
        });
        mapInitialized = true;
    }
}

function addMarker(position) {
    const marker = L.marker(position).addTo(map);
    markers.push(marker);
    saveMarkers();
}

function saveMarkers() {
    const positions = markers.map(marker => ({
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng,
    }));
    localStorage.setItem('mapMarkers', JSON.stringify(positions));
}

function loadMarkers() {
    const savedPositions = JSON.parse(localStorage.getItem('mapMarkers'));
    if (savedPositions) {
        savedPositions.forEach(pos => {
            const marker = L.marker([pos.lat, pos.lng]).addTo(map);
            markers.push(marker);
        });
    }
}

function updateProfileIcon() {
    const currentUser = sessionStorage.getItem('roamr_currentUser');
    if (currentUser) {
        profileIcon.textContent = `👋 ${currentUser.charAt(0).toUpperCase()}`; // e.g., 👋 K
    } else {
        profileIcon.textContent = '👤';
    }
}

// --- Service Worker & Offline/Online Detection ---
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered.', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
});

function initializeMainApp() {
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    showSection('home-section'); // Start on the home section
    updateProfileIcon(); // Check login status on load
    convertCurrency(); // Perform initial conversion on load

    // Add event listener for the main logout button in the profile section
    document.getElementById('logout-btn-main').addEventListener('click', () => {
        sessionStorage.removeItem('roamr_currentUser');
        window.location.href = 'login.html';
    });
}

function updateOnlineStatus() {
    const statusBar = document.getElementById('status-bar');
    if (navigator.onLine) {
        statusBar.className = 'status-bar'; // This removes the 'online' class, hiding the bar
        statusBar.textContent = ''; // Clear any text
    } else {
        statusBar.className = 'status-bar offline';
        statusBar.textContent = "You are offline. Showing cached map data.";
    }
}

// --- Mobile Navigation & Search Functionality ---
const hamburger = document.getElementById('hamburger-menu');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Make header icons clickable
document.querySelectorAll('.nav-icons span').forEach(icon => {
     icon.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');                
        const currentUser = sessionStorage.getItem('roamr_currentUser');

        // If profile icon is clicked and user is logged in, offer logout
        if (e.currentTarget.id === 'profile-icon' && currentUser) {
            if (confirm(`Logged in as ${currentUser}. Do you want to log out?`)) {
                sessionStorage.removeItem('roamr_currentUser');
                window.location.href = 'login.html';
            }
            return; // Stop further action
        }
        if (!targetId) return;

        // Special toggle logic for the calendar
        if (targetId === 'calendar-section') {
            const calendarSection = document.getElementById('calendar-section');
            calendarSection.classList.contains('active') ? showSection(lastActiveSectionId) : showSection('calendar-section');
        } else {
            showSection(targetId);
        }
    });
});

// --- Dashboard Navigation ---
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        showSection(targetId);

        // Close sidebar on mobile after clicking a link
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
});

function showSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        // If we are showing a main section (not the calendar), store it as the last active one.
        if (sectionId !== 'calendar-section') {
            lastActiveSectionId = sectionId;
        }
        targetSection.classList.add('active');
    }

    // Initialize the map only when its section is shown
    if (sectionId === 'map-section') {
        initMap();
    }

    // Render calendar when its section is shown
    if (sectionId === 'calendar-section') {
        renderCalendar();
    }

    // Perform conversion when switching to the currency section
    if (sectionId === 'currency-section') {
        convertCurrency();
    }

    // Reset Lost Mode when navigating away
    if (sectionId !== 'lost-mode-section') {
        activateLostModeBtn.disabled = false;
        findClosestBusStopBtn.disabled = false;
    }

    // Reset cultural tips section
    if (sectionId !== 'cultural-tips-section') {
        culturalTipsResultDiv.innerHTML = '';
    }
}

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
    initializeMainApp();
});