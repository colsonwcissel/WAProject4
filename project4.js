// project3.js
var termMonthMap = {
	'Fall': 8,
	'Spring': 1,
	'Summer': 6
};

var termDayMap = {
	'Fall': 25,
	'Spring': 8,
	'Summer': 15
}

class PlanCourse {
	constructor(term, year, id, name, hours) {
		this.term = term;
		this.year = year;
		this.academicYear = year;
		this.id = id;
		this.name = name;
		this.hours = hours;
		
		if(this.term != 'Fall') {
			this.academicYear--;
		}
	}
	
	render() {
		return '<div class="panelText semesterClass">' + this.id + ' ' + this.name + '</div>';
	}
}

class Plan {
	constructor(name, catalogYear, major, student, courses) {
		this.name = name;
		this.catalogYear = catalogYear;
		this.major = major;
		this.student = student;
		this.courses = courses;
	}
	
	toYears() {
		var years = {};
		
		for(const i in this.courses) {
			let course = this.courses[i];
			
			if(!(course.academicYear in years)) {
				years[course.academicYear] = new Year(course.academicYear);
			}
			
			years[course.academicYear].addCourse(course);
		}
		
		var yearsList = [];
		
		for(const key in years) {
			yearsList.push(years[key]);
		}
		
		yearsList.sort(function(x, y) {
			if(x.year < y.year) {
				return -1;
			} else if(x.year > y.year) {
				return 1;
			} else {
				return 0;
			}
		});
		
		return yearsList;
	}
	
	render() {
		var years = this.toYears();
		var yearsHtml = '';
		
		for(const i in years) {
			yearsHtml += years[i].render();
		}
		
		return yearsHtml;
	}
}

class Term {
	constructor(season, year, courses) {
		this.season = season;
		this.year = year;
		this.courses = courses;
		this.hours = 0;
		
		for(const i in this.courses) {
			this.hours += this.courses[i].hours;
		}
		
		this.past = new Date(this.year, termMonthMap[this.season], termDayMap[this.season]) < new Date();
	}
	
	addCourse(course) {
		this.courses.push(course);
		this.hours += course.hours;
	}
	
	render() {
		var coursesHtml = '';
		
		for(const i in this.courses) {
			coursesHtml += this.courses[i].render();
		}
		
		if(this.past) {
			var semesterType = 'past';
		} else {
			var semesterType = 'future';
		}
		
		return `
<div class="panel semester ` + semesterType + `Semester">
	<div class="panelTitle semesterName">
		` + this.season + ' ' + this.year + `
	</div>
	<div class="panelTitle semesterHours">
		Hours: ` + this.hours + `
	</div>
	<div class="semesterClasses">
		` + coursesHtml + `
	</div>
</div>`;
	}
}

class Year {
	constructor(year) {
		this.year = year;
		
		this.terms = {};
		this.terms['Fall'] = new Term('Fall', this.year, []);
		this.terms['Spring'] = new Term('Spring', this.year + 1, []);
		this.terms['Summer'] = new Term('Summer', this.year + 1, []);
	}
	
	addCourse(course) {
		this.terms[course.term].addCourse(course);
	}
	
	render() {
		var termsHtml = '';
		
		for(const key in this.terms) {
			termsHtml += this.terms[key].render();
		}
		
		return `
<div class="year">
	` + termsHtml + `
</div>`;
	}
}

class Requirements {
	constructor() {
		this.categories = {};
	}
	
	addCategory(name) {
		this.categories[name] = new RequirementCategory(name);
	}
	
	addCourse(id, category) {
		this.categories[category].addCourse(id);
	}
	
	render() {
		let categoriesHtml = '';
		
		for (const name in this.categories) {
			categoriesHtml += this.categories[name].render();
		}
		
		return categoriesHtml;
	}
}

class RequirementCategory {
	constructor(name) {
		this.name = name;
		this.courses = [];
	}
	
	addCourse(id) {
		this.courses.push(allCourses[id]);
	}
	
	render() {
		let coursesHtml = '';
		
		for (const key in this.courses) {
			coursesHtml += this.courses[key].render();
		}
		
		return `
<div class="panel planComponent">
	<div class="panelTitle planComponentTitle">
		` + this.name + `
	</div>
	<div class="planComponentClasses">
		` + coursesHtml + `
	</div>
</div>`;
	}
}

class Course {
	constructor(id, name, description, credits) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.credits = credits;
		
		this.searchString = (id + ' ' + name + ' ' + description).toLowerCase();
	}
	
	matches(query) {
		return this.searchString.includes(query);
	}
	
	render() {
		return '<div class="panelText planComponentClass">' + this.id + ' ' + this.name + '</div>';
	}
}

function loadPlan() {
	$.get('getCombined.php', { plan: $("#selectPlan").val() }).done( function(responseText) {
		// Process the catalog
		let jsonData = JSON.parse(responseText);
		let catalogCourses = jsonData['catalog']['courses'];
		allCourses = {};
		
		for(const id in catalogCourses) {
			let currentCourse = catalogCourses[id]
			
			allCourses[id] = new Course(id, currentCourse['name'], currentCourse['description'], currentCourse['credits']);
		}
		
		// Process the plan
		planData = jsonData['plan'];
		planCourses = planData['courses'];
		
		let courses = [];
		
		for(const key in planCourses) {
			currentPlanCourse = planCourses[key];
			currentCatalogCourse = catalogCourses[key];
			courses.push(new PlanCourse(currentPlanCourse['term'], currentPlanCourse['year'], currentPlanCourse['id'], currentCatalogCourse['name'], currentCatalogCourse['credits']));
		}

		currentPlan = new Plan(planData["name"], planData["currYear"], planData["major"], planData["student"], courses);
		
		// Process the requirements
		let requirements = new Requirements();
		let categories = jsonData['requirements'];
		
		for(const categoryName in categories) {
			let categoryCourses = categories[categoryName]['courses'];
			
			requirements.addCategory(categoryName);
			
			for(const key in categoryCourses) {
				requirements.addCourse(categoryCourses[key], categoryName);
			}
		}
		
		// render stuff
		//document.getElementById("upperRight").innerHTML = lastPlan.render();
		$("#upperLeft").html(requirements.render());
		//$("#upperLeft").html('test test test');
		
		// render selected plan
		$("#upperRight").html(currentPlan.render());
		
		$(".planComponent").accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
		});

		$("#catalogSearchBox").on("input", function() {
			handleCatalogSearchUpdate(this.value);
		});
		handleCatalogSearchUpdate('');
	});
}

function handleCatalogSearchUpdate(searchText) {
	let resultsHtml = '';
	let queries = searchText.toLowerCase().split(" ").filter(function(query) {
		return query.length > 0;
	});
	
	for(const id in allCourses) {
		let course = allCourses[id];
		let addCourse = true;
		
		for(const i in queries) {
			addCourse = addCourse && course.matches(queries[i]);
		}
		
		if(addCourse) {
			resultsHtml += course.render();
		}
	}
	
	$("#catalogResults").html(resultsHtml);
}

function planRequestCallback() {
	if(planRequest.readyState == 4) {
		reqsRequest.send();
	}
}

function bbCallback() {
	if(bbRequest.readyState == 4) {
		let parsed = JSON.parse(bbRequest.responseText);
		
		if("year" in bbParams) {
			if("make" in bbParams) {
				let modelsHtml = '';
				
				for(const key in parsed) {
					let car = parsed[key]
					modelsHtml += '<option value="' + car['id'] + '">' + car['name'] + '</option>';
				}
				
				$("#bbModel").html(modelsHtml);
			} else {
				let makesHtml = '';
				
				for(const key in parsed) {
					let car = parsed[key]
					makesHtml += '<option value="' + car['id'] + '">' + car['name'] + '</option>';
				}
				
				$("#bbMake").html(makesHtml);
			}
		} else {
			let yearsHtml = '';
			
			for(const key in parsed) {
				let year = parsed[key]
				yearsHtml += '<option value="' + year + '">' + year + '</option>';
			}
			
			$("#bbYear").html(yearsHtml);
		}
	}
}

function bbUpdate() {
	bbParams = {
		'fmt': 'json'
	};
	
	let year = $("#bbYear").val();
	
	if(year != null) {
		bbParams['year'] = year;
		
		let make = $("#bbMake").val();
		
		if(make != null) {
			bbParams['make'] = make;
		}
	}
	
	bbRequest = new XMLHttpRequest();
	bbRequest.onreadystatechange = bbCallback;
	bbRequest.open('GET', '/~gallaghd/ymm/ymmdb.php?' + jQuery.param(bbParams), true);
	bbRequest.send();
}

function renderPlan() {
	$(".quadrant").fadeTo(200, 0, function() {
		//console.log(1);
		loadPlan();
		//console.log(2);
		$(".quadrant").fadeTo(200, 1);
		//console.log(3);
	});
}

var allCourses;
/*var plans = {};
var lastPlan;
var planCourses;

var reqsRequest = new XMLHttpRequest();
reqsRequest.onreadystatechange = requestCallback;
reqsRequest.open('GET', '/~gallaghd/cs3220/termProject/getRequirements.php', true);

var planRequest = new XMLHttpRequest();
planRequest.onreadystatechange = planRequestCallback;
planRequest.open('GET', 'getCombined.php', true);

var bbRequest;
var bbParams;*/

$(document).ready(function() {
	//bbUpdate();
	//planRequest.send();
	loadPlan();
	$("body").fadeTo(800, 1);
});
