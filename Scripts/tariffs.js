const firebaseConfig = {
    apiKey: "AIzaSyBFG2Wfb8gizRA3A9UD0NNaWkqfUcPcs4Q",
    authDomain: "overzonepc-webproject.firebaseapp.com",
    databaseURL: "https://overzonepc-webproject-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "overzonepc-webproject",
    storageBucket: "overzonepc-webproject.firebasestorage.app",
    messagingSenderId: "532963847440",
    appId: "1:532963847440:web:ec496d0527fc25b14bc995",
    measurementId: "G-JMMWCVHZBM"
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();
  const database = firebase.database();
  
  
  let balanceListener = null;


  document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupProfileMenu();
    displayUserBalance();
    setupBalanceListener();
    loadTariffs();
});

  function checkAuthStatus() {
    const userID = localStorage.getItem('userID');
    const loginBtn = document.getElementById('login-btn');
    const profileMenu = document.getElementById('profile-menu');
    const userName = document.getElementById('user-name');
    

    if (userID){
        loginBtn.classList.add('hidden');
        profileMenu.classList.remove('hidden');

        const userLogin = localStorage.getItem('userLogin');
        if (userName && userLogin) {
            userName.textContent = userLogin;
        }

        setupBalanceListener();
    } else {
        loginBtn.classList.remove('hidden');
        profileMenu.classList.add('hidden');

        stopBalanceListener();
    }
}

function setupProfileMenu() {
    const profileBtn = document.getElementById('profile-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    

    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', function() {
            dropdownMenu.classList.toggle('hidden');
        });
        // закрытие меню при клике по странице
        document.addEventListener('click', function(event) {
            if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)){
                dropdownMenu.classList.add('hidden');
            }
        });
    }
}


// показ баланса
function displayUserBalance() {
    const balanceElement = document.getElementById('user-balance');

    if (balanceElement) {
        const userBalance = localStorage.getItem('userBalance');
        updateBalanceOnPage(userBalance);
    }
}
//Поиск баланса в бд
function setupBalanceListener() {
    const userID = localStorage.getItem('userID');
    
    if (!userID) {
        console.log('Пользователь не найден!');
        return;
    }
    
    
    stopBalanceListener();
    
    const balanceRef = database.ref('Authorization/' + userID + '/Balance');
    
    
    balanceListener = balanceRef.on('value', (snapshot) => {
        const newBalance = snapshot.val();
        
        if (newBalance !== null) {
            updateBalanceOnPage(newBalance);
            localStorage.setItem('userBalance', newBalance.toString());
        }
    }, (error) => {
        console.error('Ошибка просмотра баланса:', error);
    });
}
//Остановка просмотра баланса
function stopBalanceListener() {
    if (balanceListener)
    {
        const balanceRef = database.ref('Authorization/' + localStorage.getItem('userID') + '/Balance');
        balanceRef.off('value', balanceListener);
        balanceListener = null;

    }
}
//Обновление баланса 
function updateBalanceOnPage(balance) {
    const balanceElement = document.getElementById('user-balance');

    if (balanceElement) {
        if (balance !== null && balance !== undefined)
            {
                balanceElement.textContent = parseFloat(balance).toFixed(2);
            } else {
                balanceElement.textContent = '0.00';
            }
    }
}


function loadTariffs() {
    const hourlyContainer = document.getElementById('hourly-tariffs-container');
    const subscriptionContainer = document.getElementById('subscription-tariffs-container');

    //Часовые тарифы
    database.ref('Tariffs/Hourly').on('value', (snapshot) => {
        hourlyContainer.innerHTML = ''; 
        snapshot.forEach((childSnapshot) => {
            const tariff = childSnapshot.val();
            const tariffId = childSnapshot.key; 
            const tariffCard = `
                <div id="tariff-${tariffId}" class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                    <h3 id="tariff-${tariffId}-name" class="text-2xl font-bold text-blue-400 mb-4">${tariff.Name}</h3>
                    <p id="tariff-${tariffId}-price" class="text-4xl font-extrabold mb-4">${tariff.Price} ₽</p>
                    <p id="tariff-${tariffId}-description" class="text-gray-300 mb-6">${tariff.Description}</p>
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            onclick="selectTariff('${tariffId}', '${tariff.Name}', ${tariff.Price})">
                        Выбрать
                    </button>
                </div>
                `;
                hourlyContainer.innerHTML += tariffCard;
    });
}, (error) => {
    console.error("Ошибка загрузки часовых тарифов:", error);
    hourlyContainer.innerHTML = '<p class="text-red-400 text-center">Не удалось загрузить часовые тарифы.</p>';

});

database.ref('Tariffs/Subscriptions').on('value', (snapshot) => {
    subscriptionContainer.innerHTML = ''; 
    snapshot.forEach((childSnapshot) => {
        const tariff = childSnapshot.val();
        const tariffId = childSnapshot.key; 
        const tariffCard = `
            <div id="tariff-${tariffId}" class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h3 id="tariff-${tariffId}-name" class="text-2xl font-bold text-green-400 mb-4">${tariff.Name}</h3>
                <p id="tariff-${tariffId}-price" class="text-4xl font-extrabold mb-4">${tariff.Price} ₽</p>
                <p id="tariff-${tariffId}-description" class="text-gray-300 mb-6">${tariff.Description}</p>
                <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        onclick="selectTariff('${tariffId}', '${tariff.Name}', ${tariff.Price})">
                    Выбрать
                </button>
            </div>
        `;
        subscriptionContainer.innerHTML += tariffCard;
    });
}, (error) => {
    console.error("Ошибка загрузки абонементов:", error);
    subscriptionContainer.innerHTML = '<p class="text-red-400 text-center">Не удалось загрузить абонементы.</p>';
});

}

function selectTariff(id, name, price) {
    Swal.fire({
        icon: 'info',
        title: 'Выбран тариф',
        html: `Вы выбрали: <strong>${name}</strong> за <strong>${price} ₽</strong>.<br>
               Вы можете перейти к бронированию.`,
        showCancelButton: true,
        confirmButtonText: 'Перейти к бронированию',
        cancelButtonText: 'Остаться на странице',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'booking.html'; 
        }
    });
}


//выход из аккаунта
function logout() {
    localStorage.removeItem('userID');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userBalance');
    localStorage.removeItem('userDateB');
    localStorage.removeItem('userName');
    localStorage.removeItem('userSurname');

    Swal.fire({
        icon: 'success',
        title: 'Выход выполнен!',
        text: 'Вы успешно вышли из аккаунта',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        window.location.reload();
    });
}

window.addEventListener('beforeunload', function() {
    stopBalanceListener();
});

//Можем использовать в html коде(глобально)
window.logout = logout;
window.selectTariff = selectTariff
window.updateBalanceOnPage = updateBalanceOnPage;