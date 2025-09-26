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

//регистрация
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: "Ошибка!",
            text: "Пароли не совпадают",
        });
        return;
    }

    //Проверка на существование пользователя
    database.ref('Authorization').once('value').then((snapshot) => {
        const users = snapshot.val() || {};
        let userExists = false;
        let emailExists = false;

        for (const key in users) {
            if (users[key].Login === login){
                userExists = true;
                break;
            }
        }
        for (const key in users) {
            if (users[key].Email === email){
                emailExists = true;
                break;
            }
        }
        if (userExists) {
            Swal.fire({
                    icon: "error",
                    title: "Ошибка",
                    text: "Пользователь с таким логином уже существует",
                });
        }
        if (emailExists){
           Swal.fire({
                    icon: "error",
                    title: "Ошибка",
                    text: "Аккаунт с данной почтой уже существует",
                }); 
        }
        if (userExists == false && emailExists == false){
            //Создается новый пользователь
            const newUserRef = database.ref('Authorization').push();
            newUserRef.set({
                Email: email,
                ID_Authorization: newUserRef.key,
                ID_Post: "2", //(1 - админ ставить через fb, 2 - юзер)
                Login: login,
                Password: password,
                Balance: 0
            }).then(() => {
                Swal.fire({
                    icon: "success",
                        title: "Успех!",
                        text: "Регистрация завершена. Теперь вы можете войти.",
                }).then(() => {
                    window.location.href = "/HTML/Login.html";
                });
            });
        }
    }).catch((error) => {
        console.error("Ошибка регистрации:", error);
        Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: "Произошла ошибка при регистрации",
            });
    });

});