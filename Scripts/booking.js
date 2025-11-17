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
let selectedZone = null;
let selectedDate = null;
let selectedTimeSlot = null;
let selectedTariff = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupProfileMenu();
    displayUserBalance();
    setupBalanceListener();
    loadZones();
    setupBookingSteps();
    generateDateSelector();
    loadUserBookings();
    setupMobileMenu();
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
        
        // Show user bookings section if user is logged in
        document.getElementById('user-bookings-section').classList.remove('hidden');
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
    if (balanceListener) {
        const balanceRef = database.ref('Authorization/' + localStorage.getItem('userID') + '/Balance');
        balanceRef.off('value', balanceListener);
        balanceListener = null;
    }
}

function updateBalanceOnPage(balance) {
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
        if (balance !== null && balance !== undefined) {
            balanceElement.textContent = parseFloat(balance).toFixed(2);
        } else {
            balanceElement.textContent = '0.00';
        }
    }
}

function loadZones() {
    const zonesContainer = document.getElementById('zones-container');
    
    database.ref('Zones').on('value', (snapshot) => {
        zonesContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const zone = childSnapshot.val();
            const zoneId = childSnapshot.key;
            
            const zoneCard = `
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition-colors zone-card" data-zone-id="${zoneId}">
                    <h3 class="text-xl font-bold text-blue-400 mb-2">${zone.Name}</h3>
                    <p class="text-gray-300 mb-4">${zone.Description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-green-400 font-semibold">${zone.PricePerHour} ₽/час</span>
                        <span class="text-gray-400">${zone.AvailableComputers}/${zone.TotalComputers} свободно</span>
                    </div>
                </div>
            `;
            zonesContainer.innerHTML += zoneCard;
        });
        
        // Add event listeners to zone cards
        document.querySelectorAll('.zone-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected class from all cards
                document.querySelectorAll('.zone-card').forEach(c => {
                    c.classList.remove('border-2', 'border-blue-500');
                });
                
                // Add selected class to clicked card
                this.classList.add('border-2', 'border-blue-500');
                
                // Store selected zone
                selectedZone = this.getAttribute('data-zone-id');
            });
        });
    }, (error) => {
        console.error("Ошибка загрузки зон:", error);
        zonesContainer.innerHTML = '<p class="text-red-400 text-center">Не удалось загрузить зоны.</p>';
    });
}

function setupBookingSteps() {
    // Step 1 to Step 2
    document.getElementById('next-to-step2').addEventListener('click', function() {
        if (!selectedZone) {
            Swal.fire({
                icon: 'warning',
                title: 'Выберите зону',
                text: 'Пожалуйста, выберите зону для продолжения'
            });
            return;
        }
        
        document.getElementById('step1-content').classList.add('hidden');
        document.getElementById('step2-content').classList.remove('hidden');
        
        // Update steps indicator
        document.getElementById('step-1').classList.remove('bg-blue-600');
        document.getElementById('step-1').classList.add('bg-green-600');
        document.getElementById('step-2').classList.remove('bg-gray-700');
        document.getElementById('step-2').classList.add('bg-blue-600');
        
        // Load time slots for selected date
        loadTimeSlots();
    });
    
    // Step 2 to Step 1
    document.getElementById('back-to-step1').addEventListener('click', function() {
        document.getElementById('step2-content').classList.add('hidden');
        document.getElementById('step1-content').classList.remove('hidden');
        
        // Update steps indicator
        document.getElementById('step-1').classList.add('bg-blue-600');
        document.getElementById('step-1').classList.remove('bg-green-600');
        document.getElementById('step-2').classList.add('bg-gray-700');
        document.getElementById('step-2').classList.remove('bg-blue-600');
    });
    
    // Step 2 to Step 3
    document.getElementById('next-to-step3').addEventListener('click', function() {
        if (!selectedDate || !selectedTimeSlot) {
            Swal.fire({
                icon: 'warning',
                title: 'Выберите время',
                text: 'Пожалуйста, выберите дату и время для продолжения'
            });
            return;
        }
        
        document.getElementById('step2-content').classList.add('hidden');
        document.getElementById('step3-content').classList.remove('hidden');
        
        // Update steps indicator
        document.getElementById('step-2').classList.remove('bg-blue-600');
        document.getElementById('step-2').classList.add('bg-green-600');
        document.getElementById('step-3').classList.remove('bg-gray-700');
        document.getElementById('step-3').classList.add('bg-blue-600');
        
        // Update confirmation details
        updateConfirmationDetails();
    });
    
    // Step 3 to Step 2
    document.getElementById('back-to-step2').addEventListener('click', function() {
        document.getElementById('step3-content').classList.add('hidden');
        document.getElementById('step2-content').classList.remove('hidden');
        
        // Update steps indicator
        document.getElementById('step-2').classList.add('bg-blue-600');
        document.getElementById('step-2').classList.remove('bg-green-600');
        document.getElementById('step-3').classList.add('bg-gray-700');
        document.getElementById('step-3').classList.remove('bg-blue-600');
    });
    
    // Confirm booking
    document.getElementById('confirm-booking').addEventListener('click', function() {
        confirmBooking();
    });
}

function generateDateSelector() {
    const dateSelector = document.getElementById('date-selector');
    dateSelector.innerHTML = '';
    
    // Generate dates for next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const formattedDate = formatDate(date);
        
        const dateElement = `
            <div class="flex-shrink-0 date-option cursor-pointer p-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-center min-w-24" data-date="${dateString}">
                <div class="font-semibold">${formattedDate.day}</div>
                <div class="text-sm text-gray-400">${formattedDate.month}</div>
                <div class="text-xs text-gray-500">${formattedDate.weekday}</div>
            </div>
        `;
        dateSelector.innerHTML += dateElement;
    }
    
    // Add event listeners to date options
    document.querySelectorAll('.date-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.date-option').forEach(o => {
                o.classList.remove('bg-blue-600', 'border-blue-500');
                o.classList.add('border-gray-700');
            });
            
            // Add selected class to clicked option
            this.classList.remove('border-gray-700');
            this.classList.add('bg-blue-600', 'border-blue-500');
            
            // Store selected date
            selectedDate = this.getAttribute('data-date');
            
            // Load time slots for selected date
            loadTimeSlots();
        });
    });
    
    // Select today by default
    const today = new Date().toISOString().split('T')[0];
    document.querySelector(`.date-option[data-date="${today}"]`).click();
}

function formatDate(date) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    return {
        day: date.getDate(),
        month: months[date.getMonth()],
        weekday: days[date.getDay()]
    };
}

function loadTimeSlots() {
    if (!selectedDate) return;
    
    const timeSlotsContainer = document.getElementById('time-slots-container');
    timeSlotsContainer.innerHTML = '';
    
    // Generate time slots from 00:00 to 23:00
    for (let hour = 0; hour < 24; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const timeSlotId = `${selectedDate}_${timeString}`;
        
        // Check if time slot is available (in real app, check against existing bookings)
        const isAvailable = checkTimeSlotAvailability(timeSlotId);
        
        const timeSlotElement = `
            <div class="time-slot p-2 rounded text-center cursor-pointer ${isAvailable ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-500 cursor-not-allowed'}" 
                 data-time="${timeString}" ${isAvailable ? '' : 'disabled'}>
                ${timeString}
            </div>
        `;
        timeSlotsContainer.innerHTML += timeSlotElement;
    }
    
    // Add event listeners to time slots
    document.querySelectorAll('.time-slot:not([disabled])').forEach(slot => {
        slot.addEventListener('click', function() {
            // Remove selected class from all slots
            document.querySelectorAll('.time-slot').forEach(s => {
                s.classList.remove('bg-blue-600');
            });
            
            // Add selected class to clicked slot
            this.classList.add('bg-blue-600');
            
            // Store selected time slot
            selectedTimeSlot = this.getAttribute('data-time');
        });
    });
}

function checkTimeSlotAvailability(timeSlotId) {
    // In a real application, this would check against existing bookings in the database
    // For now, we'll simulate availability with random values
    return Math.random() > 0.3; // 70% chance of availability
}

function updateConfirmationDetails() {
    if (!selectedZone || !selectedDate || !selectedTimeSlot) return;
    
    // Get zone details
    database.ref('Zones/' + selectedZone).once('value').then((snapshot) => {
        const zone = snapshot.val();
        
        // Format date for display
        const dateObj = new Date(selectedDate);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
        
        // Update confirmation details
        document.getElementById('confirm-zone').textContent = zone.Name;
        document.getElementById('confirm-date').textContent = formattedDate;
        document.getElementById('confirm-time').textContent = selectedTimeSlot;
        document.getElementById('confirm-price').textContent = `${zone.PricePerHour} ₽`;
        
        // Store selected tariff for booking
        selectedTariff = zone.PricePerHour;
    });
}

function confirmBooking() {
    const userID = localStorage.getItem('userID');
    
    if (!userID) {
        Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Для бронирования необходимо войти в систему'
        });
        return;
    }
    
    if (!selectedZone || !selectedDate || !selectedTimeSlot || !selectedTariff) {
        Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Не все данные выбраны'
        });
        return;
    }
    
    // Create booking object
    const bookingId = database.ref('Bookings').push().key;
    const booking = {
        ID_Booking: bookingId,
        ID_User: userID,
        ID_Zone: selectedZone,
        Date: selectedDate,
        Time: selectedTimeSlot,
        Duration: 1, // Default 1 hour, can be extended
        TotalPrice: selectedTariff,
        Status: 'confirmed', // confirmed, completed, cancelled
        CreatedAt: new Date().toISOString()
    };
    
    // Save booking to database
    database.ref('Bookings/' + bookingId).set(booking)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Бронирование подтверждено!',
                text: 'Ваше место успешно забронировано',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                // Reset form and go back to step 1
                resetBookingForm();
                loadUserBookings();
            });
        })
        .catch((error) => {
            console.error('Ошибка бронирования:', error);
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Не удалось завершить бронирование'
            });
        });
}

function resetBookingForm() {
    // Reset selections
    selectedZone = null;
    selectedDate = null;
    selectedTimeSlot = null;
    selectedTariff = null;
    
    // Reset UI
    document.querySelectorAll('.zone-card').forEach(card => {
        card.classList.remove('border-2', 'border-blue-500');
    });
    
    document.querySelectorAll('.date-option').forEach(option => {
        option.classList.remove('bg-blue-600', 'border-blue-500');
        option.classList.add('border-gray-700');
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('bg-blue-600');
    });
    
    // Go back to step 1
    document.getElementById('step3-content').classList.add('hidden');
    document.getElementById('step2-content').classList.add('hidden');
    document.getElementById('step1-content').classList.remove('hidden');
    
    // Reset steps indicator
    document.getElementById('step-1').classList.add('bg-blue-600');
    document.getElementById('step-1').classList.remove('bg-green-600');
    document.getElementById('step-2').classList.add('bg-gray-700');
    document.getElementById('step-2').classList.remove('bg-blue-600', 'bg-green-600');
    document.getElementById('step-3').classList.add('bg-gray-700');
    document.getElementById('step-3').classList.remove('bg-blue-600');
    
    // Select today by default
    const today = new Date().toISOString().split('T')[0];
    document.querySelector(`.date-option[data-date="${today}"]`).click();
}

function loadUserBookings() {
    const userID = localStorage.getItem('userID');
    if (!userID) return;
    
    const bookingsContainer = document.getElementById('bookings-container');
    
    database.ref('Bookings').orderByChild('ID_User').equalTo(userID).on('value', (snapshot) => {
        bookingsContainer.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const booking = childSnapshot.val();
            const bookingId = childSnapshot.key;
            
            // Get zone details
            database.ref('Zones/' + booking.ID_Zone).once('value').then((zoneSnapshot) => {
                const zone = zoneSnapshot.val();
                
                // Format date for display
                const dateObj = new Date(booking.Date);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
                
                // Determine status color and text
                let statusColor = 'bg-blue-600';
                let statusText = 'Подтверждено';
                
                if (booking.Status === 'completed') {
                    statusColor = 'bg-green-600';
                    statusText = 'Завершено';
                } else if (booking.Status === 'cancelled') {
                    statusColor = 'bg-red-600';
                    statusText = 'Отменено';
                }
                
                const bookingCard = `
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-semibold">${zone.Name}</h3>
                                <p class="text-gray-400">${formattedDate} в ${booking.Time}</p>
                            </div>
                            <span class="${statusColor} text-white px-3 py-1 rounded-full text-sm">${statusText}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-gray-400">Длительность:</p>
                                <p class="text-white">${booking.Duration} час</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Стоимость:</p>
                                <p class="text-white">${booking.TotalPrice} ₽</p>
                            </div>
                        </div>
                        ${booking.Status === 'confirmed' ? `
                            <div class="flex justify-end space-x-3">
                                <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors" onclick="cancelBooking('${bookingId}')">
                                    Отменить
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
                bookingsContainer.innerHTML += bookingCard;
            });
        });
        
        if (!snapshot.exists()) {
            bookingsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400 text-lg">У вас пока нет бронирований</p>
                    <p class="text-gray-500">Забронируйте место для игры в нашем клубе</p>
                </div>
            `;
        }
    });
}

function cancelBooking(bookingId) {
    Swal.fire({
        title: 'Отменить бронирование?',
        text: 'Вы уверены, что хотите отменить это бронирование?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, отменить',
        cancelButtonText: 'Нет'
    }).then((result) => {
        if (result.isConfirmed) {
            database.ref('Bookings/' + bookingId).update({
                Status: 'cancelled'
            }).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Бронирование отменено',
                    timer: 2000,
                    showConfirmButton: false
                });
                loadUserBookings();
            }).catch((error) => {
                console.error('Ошибка отмены бронирования:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось отменить бронирование'
                });
            });
        }
    });
}

function logout() {
    localStorage.removeItem('userID');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userBalance');
    stopBalanceListener();
    window.location.href = 'index.html';
}

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            mobileMenu.classList.toggle('hidden');
            
            // Анимация иконки гамбургера
            const isOpen = !mobileMenu.classList.contains('hidden');
            if (isOpen) {
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                `;
            } else {
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
            }
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
            }
        });
        
        // Закрытие меню при клике на ссылку
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
            });
        });
        
        // Закрытие меню при изменении размера окна (если перешли на desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) { // md breakpoint
                mobileMenu.classList.add('hidden');
                mobileMenuButton.innerHTML = `
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                `;
            }
        });
    }
}