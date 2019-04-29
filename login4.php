<?php

/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

session_start();

if($_POST['validate'] == '1') {
	/*if($_POST['username'] == 'test' && $_POST['password'] == 'test') {
		$_SESSION['user'] = $_POST['username'];
		
		header('Location: project4.php');
	} else {
		$message = 'Incorrect username or password<br>';
	}*/
	
	$conn = new mysqli('james', 'cs3220', '', 'cs3220_Sp19');
	
	if($conn->connect_error) {
		$message = 'Database error';
	} else {
		$query = $conn->prepare("SELECT password FROM legion_user WHERE username = ?");
		//$message = $conn->error;
		$query->bind_param('s', $_POST['username']);
		$query->execute();
		$query->store_result();
		$query->bind_result($dbPassword);
		$query->fetch();
		
		if($query->num_rows > 0) {
			if($_POST['password'] == $dbPassword) {
				$_SESSION['user'] = $_POST['username'];
				
				header('Location: project4.php');
			} else {
				$message = 'Incorrect username or password<br>';
			}
		} else {
			$message = 'Incorrect username or password<br>';
		}
		
		$conn->close();
	}
}

?>
<!DOCTYPE html>
<html>
	<head>
		<title>Login</title>
		<link rel="stylesheet" type="text/css" href="project4-2.css">
	</head>
	<body>
		<div id="lowerLeft" class="quadrant">
			<div id="catalog" class="panel">
				<div class="panelText">
					<?php echo $message; ?>
					<form action="login4.php" method="post">
						<input type="hidden" name="validate" value="1">
						Username<br>
						<input type="text" name="username"><br>
						Password<br>
						<input type="password" name="password"><br>
						<input type="submit" value="submit">
					</form>
					<br>
					<a href="create4.php">Create user</a>
				</div>
			</div>
		</div>
	</body>
</html>