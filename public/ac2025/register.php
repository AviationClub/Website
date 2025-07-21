<?php
// Database configuration
$db_host = 'aviationclub.database.windows.net';      // Your database host (usually 'localhost')
$db_name = 'aviationclub';  // Your database name
$db_user = 'Aviationclub2';      // Your database username
$db_pass = 'Aviation@Mazen2024 ';      // Your database password

// Function to return the HTML response
function returnResponse($success, $message = '') {
    $title = $success ? '' : 'Registration failed';
    $header = $success ? '' : 'or Contact us on Facebook';
    
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>' . htmlspecialchars($title) . '</title>
        <style>
        * {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}
           body {
                  display: flex;
                  height: 100vh;
                  justify-content: center;
                  align-items: center;
                  background: url(imgs/main_bg7.jpg);
                  background-size: cover;
                  background-position: center;
            }
            .container {
                  width: 100%;
                  max-width: 700px;
                  background: rgba(0, 0, 0, 0.6);
                  padding: 28px;
                  margin: 0 28px;
                  border-radius: 10px;
                  box-shadow: inset -2px 2px 2px #9b9b9b;
                }
                
                .logo {
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
                  width: 60%;
                }
                
                .form-title {
                  font-size: 26px;
                  font-weight: 600;
                  text-align: center;
                  padding-bottom: 6px;
                  color: #fafafa;
                  text-shadow: 2px 2px 2px #101010;
                  border-bottom: solid 1px #9b9b9b;
                }

                .title{
                  font-size: 24px;
                  font-weight: 600;
                  text-align: center;
                  padding: 6px;
                  color: #fafafa;
                }
                .message {
                  color: white;
                  text-align: center;
                  margin-top: 20px;
                  font-size: 22px;
                }
           @media (max-width: 700px) {
              .container, .logo {
                min-width: 300px;
              }
            }
            @media (max-width: 415px) {
                  .logo {
                    min-width: 250px;
                  }
                }
                @media (max-width: 375px) {
                  .logo {
                    min-width: 200px;
                  }
                  .form-title {
                    font-size: 20px;
                  }
                }
        </style>
    </head>
    <body>
        <div class="container">
         <div>
          <img class="logo" src="imgs/logo_mons.png" alt="logo">
          <h1 class="form-title">Aviation Club</h1>
        </div>
        <h1 class="title">' . htmlspecialchars($title) . '</h1>
        <p class="message">' . htmlspecialchars($message) . '</p>
        <p class="message">' . htmlspecialchars($header) . '</p>
        </div>
    </body>
    </html>';
    exit();
}

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    returnResponse(false, "Database connection failed");
}

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate and sanitize input
    $requiredFields = [
        'fullName', 'phoneNumber', 'email', 'academicYear', 
        'department', 'first_preference', 'second_preference'
    ];
    
    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            returnResponse(false, "All fields are required");
        }
    }

    $fullName = filter_input(INPUT_POST, 'fullName', FILTER_SANITIZE_STRING);
    $phoneNumber = filter_input(INPUT_POST, 'phoneNumber', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $academicYear = filter_input(INPUT_POST, 'academicYear', FILTER_SANITIZE_STRING);
    $department = filter_input(INPUT_POST, 'department', FILTER_SANITIZE_STRING);
    $first_preference = filter_input(INPUT_POST, 'first_preference', FILTER_SANITIZE_STRING);
    $second_preference = filter_input(INPUT_POST, 'second_preference', FILTER_SANITIZE_STRING);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        returnResponse(false, "Invalid email format");
    }

    // Validate phone number length (assuming Egyptian numbers)
    if (strlen($phoneNumber) != 11) {
        returnResponse(false, "Phone number must be 11 digits");
    }

    // Database transaction
    $pdo->beginTransaction();
    
    try {
            // Check if phone number exists
    $checkStmt = $pdo->prepare("SELECT id FROM academy25 WHERE phone_number = ?");
    $checkStmt->execute([$phoneNumber]);
    $existingRecord = $checkStmt->fetch();

    if ($existingRecord) {
        // UPDATE existing record
      
            $updateStmt = $pdo->prepare("UPDATE academy25 SET 
                full_name = ?, 
                email = ?, 
                academic_year = ?,
                department = ?,
                first_preference = ?,
                second_preference = ?
                WHERE phone_number = ?");
            
            $updateStmt->execute([
                $fullName,
                $email,
                $_POST['academicYear'],
                $_POST['department'],
                $_POST['first_preference'],
                $_POST['second_preference'],
                $phoneNumber
            ]);
            
            
      
    
        }
        else{
        // Insert data into database
        $stmt = $pdo->prepare("INSERT INTO academy25 
                              (full_name, phone_number, email, academic_year, 
                               department, first_preference, second_preference) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $fullName,
            $phoneNumber,
            $email,
            $academicYear,
            $department,
            $first_preference,
            $second_preference
        ]);
        }
        // Submit to Google Form
        $googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScaNVeoHs3wzfk9ejnXprVjsZGcnnH8ZpSsN8ab-q32cC7sjw/formResponse";
        
        $fields = [
            'entry.2098490856' => $fullName,
            'entry.824023913' => $phoneNumber,
            'entry.1569261934' => $email,
            'entry.1996635909' => $academicYear,
            'entry.1561298937' => $department,
            'entry.920172784' => $first_preference,
            'entry.1456972979' => $second_preference
        ];
        
        $queryString = http_build_query($fields);
        $context = stream_context_create(['http' => ['ignore_errors' => true]]);
        $response = file_get_contents("$googleFormUrl?$queryString", false, $context);
          
        if ($response === false) {
            throw new Exception("");
        }
        
        $pdo->commit();
        if($existingRecord)
        {
            returnResponse(true, "Update successful!");
        }else{
            returnResponse(true, "Registration successful!");
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        returnResponse(false, "Please Try Again " );
    }
} else {
    // Not a POST request
    header("Location: index.html");
    exit();
}
?>