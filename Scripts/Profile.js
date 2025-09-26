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

// Запуск функций при запуске страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupProfileMenu();
    displayUserBalance();
    setupBalanceListener();
    loadUserProfile();
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

//Загрузка данных для профиля
function loadUserProfile() {
  const userID = localStorage.getItem('userID');
  if (!userID) return;

  document.getElementById('profile-name').textContent = localStorage.getItem('userName') || 'Не указано';
    document.getElementById('profile-surname').textContent = localStorage.getItem('userSurname') || 'Не указано';
    document.getElementById('profile-login').textContent = localStorage.getItem('userLogin') || 'Не указано';
    document.getElementById('profile-email').textContent = localStorage.getItem('userEmail') || 'Не указано';
    document.getElementById('profile-date').textContent = localStorage.getItem('userDateB') || 'Не указано';

    const role = localStorage.getItem('userRole');
    document.getElementById('profile-role').textContent = role === '1' ? 'Администратор' : 'Пользователь';

    const balance = localStorage.getItem('userBalance');
    document.getElementById('profile-balance').textContent = (balance ? parseFloat(balance).toFixed(2) : '0.00') + ' Руб.';

}

// изменение полей
function editField(fieldType, currentValue, placeholder) {
  const userID = localStorage.getItem('userID');
  
  Swal.fire({
        title: 'Редактирование',
        input: 'text',
        inputValue: currentValue === 'Не указано' ? '' : currentValue,
        inputPlaceholder: placeholder,
        showCancelButton: true,
        confirmButtonText: 'Сохранить',
        cancelButtonText: 'Отмена',
        inputValidator: (value) => {
          if (!value.trim()) {
            return "Поле не может быть пустым!";
          }

          if (fieldType === 'date') {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) {
                    return 'Введите дату в формате ГГГГ-ММ-ДД';
                }
          }

          if (fieldType === 'name' || fieldType === 'surname') {
                const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
                if (!nameRegex.test(value)) {
                    return 'Можно использовать только буквы и пробелы';
                }
          }
        }
  }).then((result) => {
    if (result.isConfirmed) {
      const newValue = result.value.trim();
      const fieldMap = {
        'name': 'Name',
        'surname': 'Surname',
        'date': 'Date'
      };

      const dbField = fieldMap[fieldType];
      if (!dbField) return;

      database.ref('Authorization/' + userID).update({
        [dbField]: newValue
      }).then(() => {
        document.getElementById('profile-' + fieldType).textContent = newValue;

        localStorage.setItem('user' + fieldType.charAt(0).toUpperCase() + fieldType.slice(1), newValue);

        if (fieldType === 'name') {
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = localStorage.getItem('userLogin');
            }
        }

        Swal.fire('Успех!', 'Данные успешно обновлены!', 'succes');
      }).catch((error) => {
        console.error('Ошибка обновления данных:', error);
        Swal.fire('Ошибка', 'Не удалось обновить данные', 'error');
      });
    }
  });
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

function displayUserBalance() {
    const balanceElement = document.getElementById('user-balance');

    if (balanceElement) {
        const userBalance = localStorage.getItem('userBalance');
        updateBalanceOnPage(userBalance);
    }
}

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

function stopBalanceListener() {
    if (balanceListener)
    {
        const balanceRef = database.ref('Authorization/' + localStorage.getItem('userID') + '/Balance');
        balanceRef.off('value', balanceListener);
        balanceListener = null;

    }
}

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

function changePassword() {
  const userID = localStorage.getItem('userID');
    Swal.fire({
      title: 'Смена пароля',
      html: '<input id="swal-input1" class="swal2-input" type="password" placeholder="Новый пароль">' +
            '<input id="swal-input2" class="swal2-input" type="password" placeholder="Подтвердите пароль">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Сохранить',
      cancelButtonText: 'Отмена',
      preConfirm: () => {
        const newPassword = document.getElementById('swal-input1').value;
        const confirmPassword = document.getElementById('swal-input2').value;

        if (!newPassword || !confirmPassword) {
          Swal.showValidationMessage('Заполните все поля');
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Пароли не совпадают');
          return false;
        }

        if (newPassword.length < 4) {
          Swal.showValidationMessage('Пароль должен содержать минимум 4 символа');
          return false;
        }

        return { newPassword, confirmPassword };
      }
    })
.then((result) => {
  if (result.isConfirmed) {
    const {newPassword} = result.value;
    database.ref('Authorization/' + userID).update({
      Password: newPassword
    }).then(() => {
      Swal.fire('Успех!', 'Пароль успешно изменен', 'success');
    }).catch((error) => {
      console.error('Ошибка смены пароля:', error);
      Swal.fire('Ошибка', 'Не удалось изменить пароль', 'error');
    });
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

window.logout = logout;
window.updateBalanceOnPage = updateBalanceOnPage;
window.changePassword = changePassword;