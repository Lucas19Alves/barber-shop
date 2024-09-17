document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const availabilityForm = document.getElementById('availabilityForm');
    const availabilityList = document.getElementById('availabilityList');
    const reservationList = document.getElementById('reservationList');
    const datePicker = document.getElementById('datePicker');
    const timeSelection = document.getElementById('timeSelection');
    const selectedTimes = new Set();

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simples verificação de login (substitua por uma autenticação real em produção)
        if (username === 'lucas' && password === '1234') {
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAvailabilities();
            loadReservations();
        } else {
            alert('Usuário ou senha incorretos');
        }
    };

    availabilityForm.onsubmit = (e) => {
        e.preventDefault();
        const selectedDate = moment(datePicker.value, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const times = Array.from(selectedTimes).join(',');

        fetch('admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=addAvailability&date=${selectedDate}&times=${times}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAvailabilities();
                selectedTimes.clear();
                document.querySelectorAll('#timeSelection button').forEach(btn => btn.classList.remove('selected'));
            } else {
                alert('Erro ao adicionar disponibilidade');
            }
        });
    };

    function loadAvailabilities() {
        fetch('admin_handler.php?action=getAvailabilities')
        .then(response => response.json())
        .then(data => {
            console.log('Disponibilidades:', data); // Adicione este log para depuração
            if (Array.isArray(data)) {
                availabilityList.innerHTML = '';
                const today = moment().format('YYYY-MM-DD');
                data.forEach(item => {
                    const itemDate = moment(item.date, 'DD-MM-YYYY', true).format('YYYY-MM-DD');
                    if (itemDate >= today) {
                        const formattedDate = moment(itemDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
                        const li = document.createElement('li');
                        li.textContent = `${formattedDate} - ${item.times.join(', ')}`;
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Excluir';
                        deleteButton.onclick = () => deleteAvailability(formattedDate, item.times);
                        li.appendChild(deleteButton);
                        availabilityList.appendChild(li);
                    }
                });
            } else {
                console.error('Resposta inesperada do servidor:', data);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar disponibilidades:', error);
        });
    }

    function deleteAvailability(date, times) {
        const isoDate = moment(date, 'DD-MM-YYYY', true).format('YYYY-MM-DD');
        fetch('admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=deleteAvailability&date=${isoDate}&times=${times.join(',')}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAvailabilities();
            } else {
                alert('Erro ao excluir disponibilidade');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir disponibilidade:', error);
        });
    }

    function loadReservations() {
        fetch('admin_handler.php?action=getReservations')
        .then(response => response.json())
        .then(data => {
            console.log('Reservas:', data); // Adicione este log para depuração
            if (Array.isArray(data)) {
                reservationList.innerHTML = '';
                const today = moment().format('YYYY-MM-DD');
                data.forEach(reservation => {
                    const reservationDate = moment(reservation.date, 'DD-MM-YYYY', true).format('YYYY-MM-DD');
                    if (reservationDate >= today) {
                        const formattedDate = moment(reservationDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
                        const card = document.createElement('div');
                        card.classList.add('reservation-card');
                        card.innerHTML = `
                            <h3>${reservation.name}</h3>
                            <p><strong>Data:</strong> ${formattedDate}</p>
                            <p><strong>Horário:</strong> ${reservation.time}</p>
                            <p><strong>Telefone:</strong> ${reservation.phone}</p>
                            <p><strong>Email:</strong> ${reservation.email}</p>
                        `;
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Excluir';
                        deleteButton.onclick = () => deleteReservation(formattedDate, reservation.time);
                        card.appendChild(deleteButton);
                        reservationList.appendChild(card);
                    }
                });
            } else {
                console.error('Resposta inesperada do servidor:', data);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar reservas:', error);
        });
    }

    function deleteReservation(date, time) {
        const isoDate = moment(date, 'DD-MM-YYYY', true).format('YYYY-MM-DD');
        fetch('admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=deleteReservation&date=${isoDate}&time=${time}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadReservations();
            } else {
                alert('Erro ao excluir reserva');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir reserva:', error);
        });
    }

    function populateTimeSelection() {
        timeSelection.innerHTML = '';
        const times = generateTimes();
        times.forEach(time => {
            const button = document.createElement('button');
            button.textContent = time;
            button.onclick = () => toggleTimeSelection(time, button);
            timeSelection.appendChild(button);
        });
    }

    function generateTimes() {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                times.push(time);
            }
        }
        return times;
    }

    function toggleTimeSelection(time, button) {
        if (selectedTimes.has(time)) {
            selectedTimes.delete(time);
            button.classList.remove('selected');
        } else {
            selectedTimes.add(time);
            button.classList.add('selected');
        }
    }

    flatpickr(datePicker, {
        locale: 'pt', // Corrigido para 'pt'
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates, dateStr, instance) {
            populateTimeSelection();
        }
    });

    populateTimeSelection();
});
