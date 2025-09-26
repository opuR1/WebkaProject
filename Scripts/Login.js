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

//вход
async function loginUser(event) {
    event.preventDefault();
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    if (!login || !password)
    {
        Swal.fire({
            icon: "error",
            title: "Ошибка!",
            text: "Неправильный логин или пароль!",
        });
        return;
    }

    try {
        const snapshot = await database.ref('Authorization').once('value');
        const users = snapshot.val();
        if (!users) {
            console.error("Пользователь не найден!")
            return;
        }
        const filteredUsers = Object.values(users);

        const user = filteredUsers.find(u => u.Login.toLowerCase() === login.toLowerCase() && u.Password === password);
        if (user) {
            localStorage.setItem('userID', user.ID_Authorization);
            localStorage.setItem('userLogin', user.Login);
            localStorage.setItem('userEmail', user.Email);
            localStorage.setItem('userRole', user.ID_Post);
            localStorage.setItem('userBalance', user.Balance);
            localStorage.setItem('userDateB', user.Date);
            localStorage.setItem('userName', user.Name);
            localStorage.setItem('userSurname', user.Surname);
        

            switch(user.ID_Post.toString()) {
                case "1": //Admin
                window.location.href = "/HTML/Main.html";
                break;
                case "2": //User
                window.location.href = "/HTML/Main.html";
                break;
                default:
                    console.error("Ошибка роли!", user.ID_Post);
                    
            }
        } else {
            console.error("Неверный логин или пароль!");
            Swal.fire({
                icon: "error",
                title: "Ошибка входа!",
                text: "Неверный логин или пароль!",
            });
            }
    } catch (error) {
        console.error("Ошибка входа!", error);
        Swal.fire({
            icon: "error",
            title: "Ошибка входа!",
        });
    }
}

document.addEventListener("DOMContentLoaded", function(){
    document.querySelector("form").addEventListener("submit", loginUser);
  });
  document.getElementById("login-btn").addEventListener("click", loginUser);