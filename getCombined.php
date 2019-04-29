<?php

/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

session_start();

$conn = new mysqli('james', 'cs3220', '', 'cs3220_Sp19');

if($conn->connect_error) {
	echo 'Database error';
} else {
	$plan['name'] = $_GET['plan'];
	$plan['student'] = $_SESSION['user'];
	
	$planQuery = $conn->prepare('
		select planId, currTerm, currYear, catalogYear, legion_major.name, legion_plan.catalogId
		from legion_plan, legion_catalog, legion_major
		where username = ?
			and legion_plan.name = ?
			and legion_plan.catalogId = legion_catalog.catalogId
			and legion_plan.majorId = legion_major.majorId;');
	//echo 'Err1:' . $conn->error . '<br>';
	$planQuery->bind_param('ss', $_SESSION['user'], $_GET['plan']);
	$planQuery->bind_result($planId, $plan['currTerm'], $plan['currYear'], $plan['catYear'], $plan['major'], $catalogId);
	$planQuery->execute();
	$planQuery->store_result();
	$planQuery->fetch();
	
	$plannedCoursesQuery = $conn->prepare('
		select courseIdentifier, plannedYear, plannedSemester
		from legion_plan_course, legion_course
		where planId = ? and legion_plan_course.courseId = legion_course.courseId;');
	//echo 'Err2:' . $conn->error . '<br>';
	$plannedCoursesQuery->bind_param('i', $planId);
	$plannedCoursesQuery->bind_result($courseId, $plannedYear, $plannedSemester);
	$plannedCoursesQuery->execute();
	
	while($plannedCoursesQuery->fetch()) {
		$plan['courses'][$courseId]['id'] = $courseId;
		$plan['courses'][$courseId]['year'] = intval($plannedYear);
		$plan['courses'][$courseId]['term'] = $plannedSemester;
	}
	
	$catalog['year'] = $plan['catYear'];
	
	$catQuery = $conn->prepare('
		select courseIdentifier, name, description, credits
		from legion_course_catalog natural join legion_course
		where catalogId = ?');
	//echo 'Err3:' . $conn->error . '<br>';
	$catQuery->bind_param('i', $catalogId);
	$catQuery->bind_result($courseId, $courseName, $courseDesc, $courseCreds);
	$catQuery->execute();
	
	while($catQuery->fetch()) {
		$catalog['courses'][$courseId]['id'] = $courseId;
		$catalog['courses'][$courseId]['name'] = $courseName;
		$catalog['courses'][$courseId]['description'] = $courseDesc;
		$catalog['courses'][$courseId]['credits'] = $courseCreds;
	}
	
	$reqQuery = $conn->prepare('
		Select legion_category.name, courseIdentifier
			from legion_category, legion_course_category, legion_course
			where legion_category.categoryId = legion_course_category.categoryId and legion_course.courseId = legion_course_category.courseId and legion_category.requirementId = 
			(Select requirementId
				from legion_catalog_requirement natural join legion_requirement
				where catalogId = ?);');
	$reqQuery->bind_param('i', $catalogId);
	$reqQuery->bind_result($category, $courseId);
	$reqQuery->execute();
	
	while($reqQuery->fetch()) {
		if(!array_key_exists($category, $requirements)) {
			$requirements[$category]['courses'] = array();
		}
		
		array_push($requirements[$category]['courses'], $courseId);
	}
	
	$data['plan'] = $plan;
	$data['catalog'] = $catalog;
	$data['requirements'] = $requirements;
	
	echo json_encode($data);
	
	/*
	$query = $conn->prepare('SELECT name, currTerm, currYear, catalogId FROM legion_plan WHERE username = ?');
	//echo 'Err:' . $conn->error;
	//echo 'Usr:' . $_SESSION['user'];
	$query->bind_param('s', $_SESSION['user']);
	$query->execute();
	$query->store_result();
	$query->bind_result($planName, $currTerm, $currYear, $catalogId);
	
	$plans = array();
	$catalogIds = array();
	
	while($query->fetch()) {
		$plan['student'] = $_SESSION['user'];
		$plan['name'] = $planName;
		$plan['currYear'] = $currYear;
		$plan['currTerm'] = $currTerm;
		
		array_push($plans, $plan);
		array_push($catalogIds, $catalogId);
	}
	
	$catalogIds = array_unique($catalogIds);
	
	$catYearQuery = $catCourseQuery = $conn->prepare('
		SELECT catalogYear
		FROM legion_catalog
		WHERE catalogId = ?');
	$catYearQuery->bind_param('i', $catId);
	$catYearQuery->bind_result($catYear);
	
	$catCourseQuery = $conn->prepare('
		SELECT courseIdentifier, name, credits, description
		FROM legion_course, legion_course_catalog
		WHERE legion_course_catalog.courseId = legion_course.courseId
			AND legion_course_catalog.catalogId = ?');
	$catCourseQuery->bind_param('i', $catId);
	$catCourseQuery->execute();
	$catCourseQuery->store_result();
	$catCourseQuery->bind_result($courseId, $courseName, $courseCreds, $courseDesc);
	
	foreach($catalogIds as $catId) {
		$catYearQuery->execute();
		$catalogs[$catId]['year'] = $catYear;
		
		$catCourseQuery
		
		while($catCourseQuery->fetch()) {
			$catalogs[$catId]['courses'][$courseId]['id'] = $courseId;
			$catalogs[$catId]['courses'][$courseId]['name'] = $courseName;
			$catalogs[$catId]['courses'][$courseId]['description'] = $courseDesc;
			$catalogs[$catId]['courses'][$courseId]['credits'] = $courseCreds;
		}
	}
	
	
	echo json_encode($out);*/

	$conn->close();
}

?>