<?php

/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

session_start();

if(empty($_SESSION['user'])) {
	header('Location: login4.php');
} else {
	$conn = new mysqli('james', 'cs3220', '', 'cs3220_Sp19');
	
	if($conn->connect_error) {
		$message = 'Database error';
	} else {
		$query = $conn->prepare('SELECT firstname, lastname FROM legion_user WHERE username = ?');
		//echo $conn->error;
		$query->bind_param('s', $_SESSION['user']);
		$query->execute();
		$query->store_result();
		$query->bind_result($dbFirstname, $dbLastname);
		$query->fetch();
		
		if($query->num_rows == 0) {
			$message = 'Error stuff<br>';
		}
		
		$planOptions = '';
		
		$plansQuery = $conn->prepare('select name
			from legion_plan, legion_user_plan
			where legion_plan.planId = legion_user_plan.planId
				and legion_plan.username = ?
			order by isDefault desc');
		/*$plansQuery = $conn->prepare('select name
			from legion_plan
			where legion_plan.username = ?');*/
		//echo $conn->error;
		$plansQuery->bind_param('s', $_SESSION['user']);
		$plansQuery->execute();
		$plansQuery->bind_result($planName);
		
		while($plansQuery->fetch()) {
			$planOptions .= '<option value="' . $planName . '">' . $planName . '</option>';
		}
		
		$conn->close();
	}
}

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta name="viewport" content="width=device-width,initial-scale=1.0">
		<title>
			almostAPE
		</title>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<!--<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">-->
		<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
		<link rel="stylesheet" type="text/css" href="project4.css">
	</head>
	<body>
		<header id="header">
			<div id="pageTitle">
				<span id="pageTitleAlmost">almost</span><span id="pageTitleAPE">APE</span>
			</div>
			<div id="planSelectorDiv">
				<select id="selectPlan" onchange="renderPlan()">
					<?php echo $planOptions; ?>
				</select>
				<?php echo $dbFirstname . ' ' . $dbLastname; ?>
			</div>
		</header>
		<div id="upperLeft" class="quadrant">
		</div>
		<div id="upperRight" class="quadrant">
		</div>
		<div id="lowerLeft" class="quadrant">
		</div>
		<div id="lowerRight" class="quadrant">
			<div id="catalog" class="panel">
				<div class="panelTitle">
					Course Catalog
				</div>
				<div id="catalogSearch">
					<input id="catalogSearchBox" class="inputText" type="text">
				</div>
				<div id="catalogResults" class="panelText">
				</div>
			</div>
		</div>
		<script src="project4.js"></script>
	</body>
</html>