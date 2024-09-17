document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const availabilityForm = document.getElementById('availabilityForm');
    const availabilityList = document.getElementById('availabilityList');
    const reservationList = document.getElementById('reservationList');

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
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;

        fetch('admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=addAvailability&date=${date}&time=${time}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAvailabilities();
                availabilityForm.reset();
            } else {
                alert('Erro ao adicionar disponibilidade');
            }
        });
    };

    function loadAvailabilities() {
        fetch('admin_handler.php?action=getAvailabilities')
        .then(response => response.json())
        .then(data => {
            availabilityList.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.date} - ${item.time}`;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.onclick = () => deleteAvailability(item.date, item.time);
                li.appendChild(deleteButton);
                availabilityList.appendChild(li);
            });
        });
    }

    function deleteAvailability(date, time) {
        fetch('admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=deleteAvailability&date=${date}&time=${time}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAvailabilities();
            } else {
                alert('Erro ao excluir disponibilidade');
            }
        });
    }

    function loadReservations() {
        fetch('admin_handler.php?action=getReservations')
        .then(response => response.json())
        .then(data => {
            reservationList.innerHTML = '';
            data.forEach(reservation => {
                const li = document.createElement('li');
                li.textContent = `${reservation.name} - ${reservation.date} - ${reservation.time}`;
                reservationList.appendChild(li);
            });
        });
    }
});
