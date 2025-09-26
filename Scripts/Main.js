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

// Объявление функций при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupProfileMenu();
    displayUserBalance();
    setupBalanceListener();
});

// проверка статуса авториз
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

// выпадающее меню
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
window.updateBalanceOnPage = updateBalanceOnPage;
