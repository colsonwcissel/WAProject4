<?php

/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

session_start();

$conn = new mysqli('james', 'cs3220', '', 'cs3220_Sp19');

if($conn->connect_error) {
	$message = 'Database error';
} else {
	$majorQuery = $conn->prepare('SELECT majorId, name FROM legion_major;');
	$majorQuery->execute();
	$majorQuery->bind_result($majorId, $majorName);
	
	$majorsOptions = '';
	
	while($majorQuery->fetch()) {
		$majorsOptions .= '<option value="' . $majorId . '">' . $majorName . '</option>';
	}
	
	$catalogQuery = $conn->prepare('SELECT catalogId, catalogYear FROM legion_catalog;');
	$catalogQuery->execute();
	$catalogQuery->bind_result($catalogId, $catalogYear);
	
	$catalogOptions = '';
	
	while($catalogQuery->fetch()) {
		$catalogOptions .= '<option value="' . $catalogId . '">' . $catalogYear . '</option>';
	}
	
	if($_POST['validate'] == '1') {
		$usernameQuery = $conn->prepare('SELECT username FROM legion_user WHERE username = ?');
		//$message = $conn->error;
		$usernameQuery->bind_param('s', $_POST['username']);
		$usernameQuery->execute();
		$usernameQuery->store_result();
		$usernameQuery->bind_result($dbPassword);
		$usernameQuery->fetch();
		
		if($usernameQuery->num_rows == 0) {
			/*$createQuery = $conn->prepare('
				START TRANSACTION;
				INSERT INTO legion_user (username, password, firstname, lastname, majorId)
					VALUES (?, ?, ?, ?, ?);
				INSERT INTO legion_plan (planId, name, currTerm, currYear, username, catalogId, majorId)
					VALUES (NULL, ?, ?, ?, ?, ?, ?);
				COMMIT;
			');*/
			$createQuery = $conn->prepare('
				INSERT INTO legion_user (username, password, firstname, lastname, majorId)
					VALUES (?, ?, ?, ?, ?);');
			//echo 'Err2:' . $conn->error;
			$createQuery->bind_param('ssssi', $_POST['username'], $_POST['password'], $_POST['firstname'], $_POST['lastname'], $_POST['major']);
			$createQuery->execute();
			
			$createQuery2 = $conn->prepare('
				INSERT INTO legion_plan (planId, name, currTerm, currYear, username, catalogId, majorId)
					VALUES (NULL, ?, ?, ?, ?, ?, ?);');
			//echo 'Err3:' . $conn->error;
			$createQuery2->bind_param('ssisii', $_POST['planName'], $currTerm, $currYear, $_POST['username'], $_POST['catalog'], $_POST['major']);
			$createQuery2->execute();
			
			$planIdQuery = $conn->prepare('
				select planId from legion_plan where name = ? and username = ?');
			//echo 'Err4:' . $conn->error;
			$planIdQuery->bind_param('ss', $_POST['planName'], $_POST['username']);
			$planIdQuery->bind_result($planId);
			$planIdQuery->execute();
			$planIdQuery->store_result();
			$planIdQuery->fetch();
			
			$createQuery3 = $conn->prepare('
				INSERT INTO legion_user_plan (username, planId, isDefault)
					VALUES (?, ?, 1);');
			//echo 'Err5:' . $conn->error;
			$createQuery3->bind_param('si', $_POST['username'], $planId);
			$createQuery3->execute();
			
			$_SESSION['user'] = $_POST['username'];
			
			header('Location: project4.php');
		} else {
			$message = 'Username not available<br>';
		}
	}
}

$conn->close();

?>
<!DOCTYPE html>
<html>
	<head>
		<title>Create User</title>
		<link rel="stylesheet" type="text/css" href="project4-2.css">
	</head>
	<body>
		<!--<div id="lowerLeft" class="quadrant">-->
			<div id="catalog" class="panel">
				<div class="panelText">
					<?php echo $message; ?>
					<form action="create4.php" method="post">
						<input type="hidden" name="validate" value="1">
						Username<br>
						<input type="text" name="username"><br>
						Password<br>
						<input type="password" name="password"><br>
						First name<br>
						<input type="text" name="firstname"><br>
						Last name<br>
						<input type="text" name="lastname"><br>
						Major<br>
						<select name="major">
							<?php echo $majorsOptions; ?>
						</select><br>
						Catalog year<br>
						<select name="catalog">
							<?php echo $catalogOptions; ?>
						</select><br>
						Plan name<br>
						<input type="text" name="planName"><br>
						<input type="submit" value="submit"><br>
						<br>
						<a href="login4.php">Login</a>
			</div></div><!--</div>-->
		</form>
	</body>
</html>