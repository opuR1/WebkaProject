// Инициализация Firebase
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Проверка авторизации пользователя
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Пользователь авторизован
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('profile-menu').style.display = 'block';
        
        // Получение данных пользователя
        const userRef = database.ref('users/' + user.uid);
        userRef.once('value').then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('user-name').textContent = userData.name || 'Пользователь';
                document.getElementById('user-balance').textContent = userData.balance || '0';
            }
        });
    } else {
        // Пользователь не авторизован
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('profile-menu').style.display = 'none';
    }
});

// Обработчик для кнопки профиля
document.getElementById('profile-btn').addEventListener('click', function() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('hidden');
});

// Функция выхода
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'Main.html';
    }).catch((error) => {
        console.error('Ошибка при выходе:', error);
    });
}

// Закрытие dropdown при клике вне его
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown-menu');
    const profileBtn = document.getElementById('profile-btn');
    
    if (!profileBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// Наблюдаем за всеми секциями
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Добавляем CSS для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
    }
    
    section {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Функционал для FAQ
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.bg-gray-800');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Здесь можно добавить функционал раскрытия/скрытия ответов
            this.classList.toggle('active');
        });
    });
    
    // Инициализация карты (заглушка)
    initializeMap();
});

function initializeMap() {
    // Здесь будет инициализация карты (Google Maps, Yandex Maps и т.д.)
    console.log('Инициализация карты...');
    
    // Пример для Google Maps:
    /*
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 55.7558, lng: 37.6173 },
        zoom: 15
    });
    
    const marker = new google.maps.Marker({
        position: { lat: 55.7558, lng: 37.6173 },
        map: map,
        title: 'OverZone PC Клуб'
    });
    */
}

// Обработка кликов по телефонным номерам и email
document.addEventListener('DOMContentLoaded', function() {
    // Логирование кликов по контактам для аналитики
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Клик по телефону:', this.href);
            // Можно добавить отправку события в аналитику
        });
    });
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Клик по email:', this.href);
            // Можно добавить отправку события в аналитику
        });
    });
});