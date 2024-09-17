<?php
header('Content-Type: application/json');

$jsonFile = 'reservas.json';

function readJsonFile() {
    global $jsonFile;
    if (!file_exists($jsonFile)) {
        return ['disponiveis' => [], 'reservas' => []];
    }
    $jsonContent = file_get_contents($jsonFile);
    return json_decode($jsonContent, true) ?: ['disponiveis' => [], 'reservas' => []];
}

function writeJsonFile($data) {
    global $jsonFile;
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($jsonFile, $jsonContent) !== false;
}

function removePastEntries(&$data) {
    $today = date('Y-m-d');
    $data['disponiveis'] = array_filter($data['disponiveis'], function($item) use ($today) {
        return $item['date'] >= $today;
    });
    $data['reservas'] = array_filter($data['reservas'], function($item) use ($today) {
        return $item['date'] >= $today;
    });
}

function formatDate($date, $format = 'd-m-Y') {
    return date($format, strtotime($date));
}

$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = readJsonFile();
    removePastEntries($data);
    if (isset($_GET['action'])) {
        if ($_GET['action'] === 'getAvailabilities') {
            foreach ($data['disponiveis'] as &$item) {
                $item['date'] = formatDate($item['date']);
            }
            echo json_encode(array_values($data['disponiveis']));
            exit;
        } elseif ($_GET['action'] === 'getReservations') {
            foreach ($data['reservas'] as &$reservation) {
                $reservation['date'] = formatDate($reservation['date']);
            }
            echo json_encode(array_values($data['reservas']));
            exit;
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = readJsonFile();
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'addAvailability') {
            $date = formatDate($_POST['date'], 'Y-m-d');
            $times = array_map('trim', explode(',', $_POST['times']));
            
            $dateExists = false;
            foreach ($data['disponiveis'] as &$item) {
                if ($item['date'] === $date) {
                    $item['times'] = array_unique(array_merge($item['times'], $times));
                    $dateExists = true;
                    break;
                }
            }
            
            if (!$dateExists) {
                $data['disponiveis'][] = [
                    'date' => $date,
                    'times' => $times
                ];
            }
            
            $response['success'] = writeJsonFile($data);
        } elseif ($_POST['action'] === 'deleteAvailability') {
            $date = formatDate($_POST['date'], 'Y-m-d');
            $times = array_map('trim', explode(',', $_POST['times']));
            
            foreach ($data['disponiveis'] as $key => &$item) {
                if ($item['date'] === $date) {
                    $item['times'] = array_diff($item['times'], $times);
                    if (empty($item['times'])) {
                        unset($data['disponiveis'][$key]);
                    }
                    break;
                }
            }
            
            $data['disponiveis'] = array_values($data['disponiveis']);
            $response['success'] = writeJsonFile($data);
        } elseif ($_POST['action'] === 'deleteReservation') {
            $date = formatDate($_POST['date'], 'Y-m-d');
            $time = trim($_POST['time']);
            
            foreach ($data['reservas'] as $key => $reservation) {
                if ($reservation['date'] === $date && $reservation['time'] === $time) {
                    unset($data['reservas'][$key]);
                    break;
                }
            }
            
            $data['reservas'] = array_values($data['reservas']);
            $response['success'] = writeJsonFile($data);
        } elseif ($_POST['action'] === 'addReservation') {
            $name = trim($_POST['name']);
            $phone = trim($_POST['phone']);
            $email = trim($_POST['email']);
            $date = formatDate($_POST['date'], 'Y-m-d');
            $time = trim($_POST['time']);
            
            // Verifica se a data e hora já estão reservadas
            foreach ($data['reservas'] as $reservation) {
                if ($reservation['date'] === $date && $reservation['time'] === $time) {
                    $response['message'] = 'Data e hora já reservadas';
                    echo json_encode($response);
                    exit;
                }
            }
            
            $data['reservas'][] = [
                'name' => $name,
                'phone' => $phone,
                'email' => $email,
                'date' => $date,
                'time' => $time
            ];
            
            $response['success'] = writeJsonFile($data);
        }
    }
}

echo json_encode($response);
exit;
