<?php
session_start(); // Uruchomienie sesji

// Ścieżka do pliku z logami
$logFile = 'logs.txt';

// Bazowy prompt AI
$aiPrompt = '### Wczuj się w rolę kartografa nawigatora. Przeanalizuj drogę pilota na mapie, która jest siatką z pól 4 x 4. Każde pole mapy to liczba od 1 do 16. Zacznij od liczby 1: START.
### Przeanalizuj krokowo komendy z INFO pilota. Każde zdanie to jedna komenda.
I. Każda komenda z INFO pilota może wykonywać następujące operacje, ale tylko wg <rules>:
- w dół oznacza operację D: +1 do wyniku
- w górę oznacza operację G: -1 do wyniku
- w prawo oznacza operację R: +4 do wyniku
- w lewo oznacza operację L: -4 do wyniku
II. Na koniec: odczytaj KEYWORDS (słowa po dwukropku) dla końcowej wartości wg poniższej tabeli:
1: START
2: trawa
3: trawa
4: skały
5: trawa
6: młyn
7: trawa
8: skały
9: trawa drzewo
10: trawa
11: skały
12: samochód
13: dom
14: trawa
15: trawa drzewa
16: jaskinia
III. W odpowiedzi podaj wszystkie kroki i wynik końcowy. W tagach <result> podaj KEYWORDS (bez markdown) dla wyniku końcowego. Np.: <result>trawa drzewo</result>
<rules>
- jeśli (WYNIK % 4 === 0) i kolejną operacją jest D +1, nie możesz jej użyć, więc przejdź wtedy do kolejnej komendy INFO pilota.
- jeśli (WYNIK % 4 === 1) i kolejną operacją jest G -1, nie możesz jej użyć, więc przejdź wtedy do kolejnej komendy INFO pilota.
- jeśli (WYNIK > 16), cofnij ostatnią operację, i przejdź do kolejnej komendy INFO pilota.
- jeśli pilot użyje zwrotu: "Zaczynamy od nowa", zresetuj obecny wynik do wartości 1 i przejdź do kolejnej komendy INFO pilota.
- jeśli pilot użyje zwrotu: "nie! nie! czekaaaaj", cofnij wszystkie operacje ostatniej komendy, i przejdź do kolejnej komendy INFO pilota.
- jeśli pilot każe iść do końca lub maksymalnie w jakąś stronę, lub "na sam dół", wykonuj dany typ operacji w pętli dopóki to będzie możliwe.
- jesli pilot każe iść w jakąś stronę o daną liczbę pól, wykonuj operację tyle razy o ile pól trzeba iść.
</rules>
### INFO pilota:
';

// Funkcja do zapisywania logów
function saveLog($data) {
  global $logFile;
  $logEntry = "[" . date('Y-m-d H:i:s') . "] " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
  file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// Inicjalizacja licznika zapytań w sesji
if (!isset($_SESSION['request_count'])) {
  $_SESSION['request_count'] = 0;
}

// Obsługa żądań POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if ($_SESSION['request_count'] >= 5) {
      // Logowanie komunikatu o przekroczeniu limitu
      saveLog(['error' => 'Limit zapytań (5) na odświeżenie strony został przekroczony.']);
      http_response_code(429); // Kod HTTP dla Too Many Requests
      header('Content-Type: application/json');
      echo json_encode(['error' => 'Limit zapytań został przekroczony.']);
      exit;
  }

  // Zwiększenie licznika zapytań
  $_SESSION['request_count']++;

  // Pobranie danych JSON z ciała żądania
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);

  if ($data) {
      saveLog(['received_data' => $data]);

      // Sprawdzenie, czy 'instruction' jest obecne w danych
      $fullPrompt = isset($data['instruction']) ? $aiPrompt . ' ' . $data['instruction'] : $aiPrompt;

      // Przygotowanie zapytania do OpenAI API
      $apiKey = 'sk-proj-'; // Klucz API
      $model = 'gpt-4o';
      $messages = [
          ['role' => 'system', 'content' => 'You are a helpful assistant.'],
          ['role' => 'user', 'content' => $fullPrompt]
      ];
      $payload = [
          'model' => $model,
          'messages' => $messages,
          'max_tokens' => 1024,
          'temperature' => 0.2
      ];

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [
          'Content-Type: application/json',
          'Authorization: Bearer ' . $apiKey
      ]);

      $result = curl_exec($ch);

      if (curl_errno($ch)) {
          $error_msg = curl_error($ch);
          saveLog(['curl_error' => $error_msg]);
          http_response_code(500);
          header('Content-Type: application/json');
          echo json_encode(['error' => 'Błąd komunikacji z OpenAI API: ' . $error_msg]);
      } else {
          $response = json_decode($result, true);

          if (isset($response['error'])) {
              $error_msg = $response['error']['message'] ?? 'Nieznany błąd';
              saveLog(['api_error' => $error_msg]);
              http_response_code(500);
              header('Content-Type: application/json');
              echo json_encode(['error' => 'Błąd OpenAI API: ' . $error_msg]);
          } else {
              $aiResponse = $response['choices'][0]['message']['content'] ?? '';
              preg_match('/<result>(.*?)<\/result>/', $aiResponse, $matches);
              $resultContent = $matches[1] ?? 'Brak danych w tagach <result>';

              $responseToCentral = ['description' => $resultContent];
              saveLog([
                  'prompt' => $fullPrompt,
                  'aiResponse' => $aiResponse,
                  'extractedResult' => $resultContent,
                  'responseToCentral' => $responseToCentral
              ]);

              header('Content-Type: application/json');
              echo json_encode($responseToCentral);
          }
      }
      curl_close($ch);
  } else {
      http_response_code(400);
      header('Content-Type: application/json');
      echo json_encode(['error' => 'Niepoprawny format JSON']);
  }
  exit;
}

// Wyzerowanie licznika zapytań przy odświeżeniu strony
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $_SESSION['request_count'] = 0;
}

// Wyświetlanie logów w przeglądarce
?>
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Real-Time JSON Logger</title>
  <style>
      body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f9; }
      h1 { text-align: center; }
      .log-container { border: 1px solid #ccc; padding: 10px; background: #fff; }
      .log-entry { margin: 5px 0; padding: 5px; border-bottom: 1px solid #eee; }
      .log-entry:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <h1>Real-Time JSON Logger</h1>
  <div id="log-container" class="log-container">
      <?php
      if (file_exists($logFile)) {
          $logs = file($logFile);
          foreach ($logs as $log) {
              echo '<div class="log-entry">' . htmlspecialchars($log) . '</div>';
          }
      } else {
          echo '<p>Brak dostępnych logów.</p>';
      }
      ?>
  </div>
  <script>
      setInterval(() => {
          fetch(location.href)
              .then(response => response.text())
              .then(html => {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, 'text/html');
                  const newLogs = doc.querySelector('.log-container').innerHTML;
                  document.querySelector('.log-container').innerHTML = newLogs;
              });
      }, 3000);
  </script>
</body>
</html>
