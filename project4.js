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
	constructor(term, year, id, name, hours,planned) {
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
		let plan = 'plan';
		return `<div class="panelText semesterClass" id="${this.id}-plan" draggable="true" ondragstart="drag(event,'plan')" onclick="deleteMe(event)">${this.id} ${this.name}</div>`;
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

	getCourse(id){
		for(const i in this.courses) {
			if(this.courses[i].id == id){
				return courses[i];
			}
		}
	}

	removeCourse(id){
		for(const i in this.courses) {
			if(this.courses[i].id == id){
				this.courses.splice(i, 1);
			}
		}
	}

	addCourse(course){
		this.courses.push(course);
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
			//console.log("plan: ", this.courses[i]);
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
	<div class="semesterClasses" ondrop="drop(event)" ondragover="allowDrop(event)">
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

		//console.log(coursesHtml);
		
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
	constructor(id, name, description, credits,planned) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.credits = credits;
		this.planned = planned;
		
		this.searchString = (id + ' ' + name + ' ' + description).toLowerCase();
	}
	
	matches(query) {
		return this.searchString.includes(query);
	}

	getPlanned(){
		if(this.planned){
			return 'planned';
		} else {
			return ''
		}
	}
	
	render() {
		return `<div class="panelText planComponentClass ${this.getPlanned()}" id="${this.id}-other" draggable="true" ondragstart="drag(event,'other')">${this.id} ${this.name}</div>`;
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
			courses.push(new PlanCourse(currentPlanCourse['term'], currentPlanCourse['year'], currentPlanCourse['id'], currentCatalogCourse['name'], currentCatalogCourse['credits'],true));
		}

		currentPlan = new Plan(planData["name"], planData["currYear"], planData["major"], planData["student"], courses);
		
		// Process the requirements
		let requirements = new Requirements();
		let categories = jsonData['requirements'];
		
		for(const categoryName in categories) {
			let categoryCourses = categories[categoryName]['courses'];
			
			requirements.addCategory(categoryName);
			
			for(const key in categoryCourses) {
				checkPlanned(categoryCourses[key], currentPlan);
				requirements.addCourse(categoryCourses[key], categoryName);
			}
		}
		
		// render stuff
		$("#upperLeft").html(requirements.render());
		
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

function renderPlan() {
	$(".quadrant").fadeTo(200, 0, function() {
		loadPlan();
		$(".quadrant").fadeTo(200, 1);
	});
}

$(document).ready(function() {
	loadPlan();
	$("body").fadeTo(800, 1);
});


function allowDrop(ev) {
	ev.preventDefault();
}
  
function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}
  
function drop(ev) {

	// console.log(item.parentNode.parentNode.innerText);
	// console.log(item.parentNode.parentNode.innerText.split(' ').join(',').split('\n').join(',').split(','));

	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var origin = ev.dataTransfer.getData("origin");
	item = document.getElementById(data);
	if(item.id.includes("plan")){
		updateTimes(item, ev.target);
		ev.target.appendChild(item);
	} else{
		if(!document.getElementById(data).className.includes('planned')){
			addCourse(item,ev.target);
			var myc = item.cloneNode(true);
			myc.className = 'panelText semesterClass';
			planItems(item.id);
			myc.id = item.id.replace('-other','-plan');
			myc.addEventListener("click", function(){
				deleteMe(window.event);
			  });
			ev.target.appendChild(myc);
		} else {
			window.alert("you have already planned this course");
		}
	}
}

function updateTimes(item, target){
	courseId = item.id.replace('-plan','');
	let course = allCourses[courseId];
	let times = target.parentNode.innerText.split(' ').join(',').split('\n').join(',').split(',');
	currentPlan.addCourse(new PlanCourse(times[0],times[1],course.id,course.name,course.credits,true));
	currentPlan.removeCourse(courseId);
}

function addCourse(item,target){
	courseId = item.id.replace('-other','');
	let course = allCourses[courseId];
	let times = target.parentNode.innerText.split(' ').join(',').split('\n').join(',').split(',');
	currentPlan.addCourse(new PlanCourse(times[0],times[1],course.id,course.name,course.credits,true));
}

function checkPlanned(course, currentPlan){
	for(var i in currentPlan.courses){
		if(currentPlan.courses[i].id === course){
			allCourses[course].planned = 'planned';
		}
	}
}

function deleteMe(ev) {
	let course = new PlanCourse()
	var item = document.getElementById(ev.target.id);
	currentPlan.removeCourse(ev.target.id.replace('-plan',''));
	unplanItems(item.id);
	item.parentNode.removeChild(item);
}

function unplanItems(planId){
	var items = document.getElementsByClassName('panelText planComponentClass planned ');
	for (let thing of items) {
		if(thing.id == planId.replace('-plan','-other')){
			thing.className=thing.className.replace(' planned','');
		}
	}
}

function planItems(planId){
	var items = document.getElementsByClassName('panelText planComponentClass');
	for (let thing of items) {
		if(thing.id == planId){
			thing.className=thing.className + ' planned';
		}
	}
}

