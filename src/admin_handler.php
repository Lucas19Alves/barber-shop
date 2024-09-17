<?php
header('Content-Type: application/json');

$jsonFile = 'reservas.json';

function readJsonFile() {
    global $jsonFile;
    $jsonContent = file_get_contents($jsonFile);
    return json_decode($jsonContent, true);
}

function writeJsonFile($data) {
    global $jsonFile;
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT);
    file_put_contents($jsonFile, $jsonContent);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($_GET['action'] === 'getAvailabilities') {
        $data = readJsonFile();
        echo json_encode($data['disponiveis']);
    } elseif ($_GET['action'] === 'getReservations') {
        $data = readJsonFile();
        echo json_encode($data['reservas']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['action'] === 'addAvailability') {
        $date = $_POST['date'];
        $time = $_POST['time'];
        $data = readJsonFile();
        
        $dateExists = false;
        foreach ($data['disponiveis'] as &$item) {
            if ($item['date'] === $date) {
                if (!in_array($time, $item['times'])) {
                    $item['times'][] = $time;
                }
                $dateExists = true;
                break;
            }
        }
        
        if (!$dateExists) {
            $data['disponiveis'][] = [
                'date' => $date,
                'times' => [$time]
            ];
        }
        
        writeJsonFile($data);
        echo json_encode(['success' => true]);
    } elseif ($_POST['action'] === 'deleteAvailability') {
        $date = $_POST['date'];
        $time = $_POST['time'];
        $data = readJsonFile();
        
        foreach ($data['disponiveis'] as $key => &$item) {
            if ($item['date'] === $date) {
                $timeKey = array_search($time, $item['times']);
                if ($timeKey !== false) {
                    unset($item['times'][$timeKey]);
                    $item['times'] = array_values($item['times']);
                }
                if (empty($item['times'])) {
                    unset($data['disponiveis'][$key]);
                }
                break;
            }
        }
        
        $data['disponiveis'] = array_values($data['disponiveis']);
        writeJsonFile($data);
        echo json_encode(['success' => true]);
    }
}
