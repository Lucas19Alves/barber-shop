document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const reserveButton = document.getElementById('reserveButton');
    const closeButton = document.querySelector('.close');
    const nextStepButton = document.getElementById('nextStep');
    const prevStep1Button = document.getElementById('prevStep1');
    const prevStep2Button = document.getElementById('prevStep2');
    const confirmReservationButton = document.getElementById('confirmReservation');
    const dateSelection = document.getElementById('dateSelection');
    const timeSelection = document.getElementById('timeSelection');
    const steps = document.querySelectorAll('.step');

    let selectedDate = null;
    let selectedTime = null;

    reserveButton.onclick = () => {
        modal.style.display = 'block';
    };

    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    nextStepButton.onclick = () => {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;

        if (name && phone && email) {
            showStep(1);
            populateDates();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    prevStep1Button.onclick = () => showStep(0);
    prevStep2Button.onclick = () => showStep(1);

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
    }

    function populateDates() {
        fetch('admin_handler.php?action=getAvailabilities')
        .then(response => response.json())
        .then(data => {
            // Ordena as datas da mais próxima para a mais distante
            data.sort((a, b) => moment(a.date, 'DD-MM-YYYY').valueOf() - moment(b.date, 'DD-MM-YYYY').valueOf());

            dateSelection.innerHTML = '';
            data.forEach(item => {
                const dateObj = moment(item.date, 'DD-MM-YYYY', true);
                if (dateObj.isValid()) {
                    const dayName = dateObj.format('ddd');
                    const formattedDate = dateObj.format('DD/MM');
                    
                    const button = document.createElement('button');
                    button.innerHTML = `<span class="day-name">${dayName}</span><span class="date">${formattedDate}</span>`;
                    button.onclick = () => selectDate(item.date, button);
                    dateSelection.appendChild(button);
                } else {
                    console.error('Data inválida:', item.date);
                }
            });
        });
    }

    function selectDate(date, button) {
        selectedDate = date;
        document.querySelectorAll('#dateSelection button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        showStep(2);
        populateTimes();
    }

    function populateTimes() {
        fetch(`admin_handler.php?action=getAvailabilities`)
        .then(response => response.json())
        .then(data => {
            fetch('admin_handler.php?action=getReservations')
            .then(res => res.json())
            .then(reservations => {
                const selectedDateData = data.find(item => item.date === selectedDate);
                if (selectedDateData) {
                    timeSelection.innerHTML = '';
                    selectedDateData.times.forEach(time => {
                        const isReserved = reservations.some(reservation => 
                            reservation.date === selectedDate && reservation.time === time
                        );
                        const button = document.createElement('button');
                        button.textContent = time;
                        if (isReserved) {
                            button.classList.add('button-disabled');
                            button.disabled = true;
                            console.log(`Horário ${time} está reservado e foi desativado.`);
                        } else {
                            button.onclick = () => selectTime(time, button);
                        }
                        timeSelection.appendChild(button);
                    });
                }
            });
        });
    }

    function selectTime(time, button) {
        selectedTime = time;
        document.querySelectorAll('#timeSelection button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }

    confirmReservationButton.onclick = () => {
        if (selectedDate && selectedTime) {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;

            fetch('admin_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=addReservation&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
            })
            .then(response => response.text())
            .then(text => {
                console.log('Resposta do servidor:', text);
                const data = JSON.parse(text);
                if (data.success) {
                    modal.style.display = 'none';
                    alert('Reserva confirmada com sucesso!');
                } else {
                    alert('Erro ao fazer a reserva. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error('Erro ao processar a resposta:', error);
                alert('Erro ao fazer a reserva. Por favor, tente novamente.');
            });
        } else {
            alert('Por favor, selecione uma data e um horário.');
        }
    };
});