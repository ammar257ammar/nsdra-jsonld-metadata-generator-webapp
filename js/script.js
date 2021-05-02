var lists = "";
var miList = "";
var miMap = new Map();
var seed = "12345";

function updateChangeListeners(){

    var propCheck = document.querySelectorAll("input[id$='-name']");

    propCheck.forEach(function (element, index) {

        element.addEventListener('change', function() {

            currentCheckbox = this;

            if (this.checked) {

                if(jsonObj.hasOwnProperty("variableMeasured")){
                    jsonObj.variableMeasured.push({"@type": "schema:PropertyValue", "name": miMap.get(this.id)});
                }else{
                    jsonObj.variableMeasured = [];
                    jsonObj.variableMeasured.push({"@type": "schema:PropertyValue", "name": miMap.get(this.id)});
                }

            } else {

                jsonObj.variableMeasured.forEach(function (element, index) {
                    if(element.name === miMap.get(currentCheckbox.id)){
                        jsonObj.variableMeasured.splice(index,1);
                    }
                    if(jsonObj.variableMeasured.length == 0){
                        delete jsonObj.variableMeasured;
                    }
                });
            }

            jsonldTextArea.value = JSON.stringify(jsonObj,null, '\t');
        });
    });
}

async function fetchText() {

    let response = await fetch("lists.json");
    lists = await response.json();
    miList = lists.lists[0]["maturity indicators"];

    var switches = document.getElementById("switches");

    var listsDropdown = document.getElementById("mi-list-select");

    for(i = 0; i < lists.lists.length; i++){

        var opt = document.createElement('option');
        opt.value = lists.lists[i].id;

        if(i == 0){
            opt.selected = "selected";
        }

        opt.innerHTML = lists.lists[i].title;
        listsDropdown.appendChild(opt);
    }

    for(i = 0 ; i < miList.length; i++){

        var hash = murmurhash3_32_gc(miList[i].variable,seed);
        switches.innerHTML = switches.innerHTML +
        `
        <div class="row pchem">
			<div class="col-md-12">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="`+hash+`-name">
					<label class="custom-control-label" for="`+hash+`-name"><strong>`+miList[i].name+`</strong></label>
				</div>
			</div>
		</div>
        `;
       miMap.set(hash+'-name',miList[i].variable);
    }
    updateChangeListeners();
}

fetchText();

/*
fetch("lists.json")
    .then(response => response.json())
    .then(json => lists = json);
    .then(json => miList = json.lists[0]["maturity indicators"] )
*/

var json = `
{
  "@context": {
    "bs": "https://bioschemas.org/",
	"schema": "https://schema.org/",
	"citation": "schema:citation",
	"name": "schema:name",
	"url": "schema:name",
	"variableMeasured": "schema:variableMeasured"
  },
  "@type": "schema:Dataset"
}
`;

var jsonldTextArea = document.getElementById("generated-jsonld");

var dsId = document.getElementById("ds-id");
var dsTitle = document.getElementById("ds-title");
var dsUrl = document.getElementById("ds-url");
var dsCitation = document.getElementById("ds-citation");

jsonldTextArea.value = json;

var jsonObj = JSON.parse(json);

var inputArr = [dsTitle, dsId, dsUrl, dsCitation];

var inputMap = new Map();

inputMap.set('ds-id','@id');
inputMap.set('ds-title', 'name');
inputMap.set('ds-url', 'url');
inputMap.set('ds-citation', 'citation');

inputArr.forEach(function (element, index) {

    element.addEventListener('keyup', function (event) {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        let jsonProp = inputMap.get(element.id);

        if(element.value == ""){
            delete jsonObj[jsonProp];
        }else if(!jsonObj.hasOwnProperty(jsonProp)){
            jsonObj[jsonProp] = element.value;
        }else{
            jsonObj[jsonProp] = element.value;
        }

        jsonldTextArea.value = JSON.stringify(jsonObj,null, "\t");

    });
});

document.getElementById("resetForm").addEventListener('click', function (event) {
    jsonldTextArea.value = json;
    jsonObj = JSON.parse(json);
});

document.getElementById("mi-list-select").addEventListener('change', function() {

    miList = lists.lists[this.selectedIndex]["maturity indicators"];

    miMap = new Map();

    var switches = document.getElementById("switches");

    switches.innerHTML = "";

    jsonObj.variableMeasured = [];
    jsonldTextArea.value = JSON.stringify(jsonObj,null, "\t");

    for(i = 0 ; i < miList.length; i++){

        var hash = murmurhash3_32_gc(miList[i].variable,seed);
        switches.innerHTML = switches.innerHTML +
        `
        <div class="row pchem">
			<div class="col-md-12">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="`+hash+`-name">
					<label class="custom-control-label" for="`+hash+`-name"><strong>`+miList[i].name+`</strong></label>
				</div>
			</div>
		</div>
        `;
       miMap.set(hash+'-name',miList[i].variable);
    }
    updateChangeListeners();
});