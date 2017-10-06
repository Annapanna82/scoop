// Helper functions
function find(selector, element){
	if ( ! isElement(element) )
	{
		return document.querySelector(selector);
	}
	return element.querySelector(selector);
};

function findAll(selector, element){
	if ( ! isElement(element) )
	{
		return document.querySelectorAll(selector);
	}
	return element.querySelectorAll(selector);
};

function removeClass(element, classname){
	if ( isArray(element) ) {
		each(element, function(e){
			removeClass(e, classname);
		});
	}else {
		element.classList.remove(classname);
	}
};
function addClass(element, classname){
	if ( isArray(element) ) {
		each(element, function(e){
			addClass(e, classname);
		});
	}else {
		element.classList.add(classname);
	}
};

function each(array, func){
	Array.prototype.forEach.call(array, func);
};

function isElement(element){
	try {
		return element instanceof HTMLElement;
	}
	catch(e){
		return (typeof element==="object") && (element.nodeType===1) && (typeof element.style === "object") && (typeof element.ownerDocument ==="object");
	}
};
function isArray(array){
	try {
		return array instanceof Array;
	}
	catch(e){
		return  (!isElement(array)) && (typeof array==="object") && array !== null && typeof(array.length) === 'number';
	}
};

// Hello friends.
var toggleData = document.getElementsByClassName('toggle-data');
if( toggleData.length > 0 ){
    Array.prototype.forEach.call(toggleData, (el) => {
        el.onclick = function() {
            this.classList.toggle('is-active');
            var mainHeader = document.getElementById('main');
            mainHeader.classList.toggle('is-active');
        }
    });
}

each(document.querySelectorAll('.filter'), function(el){
    console.log(el);
    el.onchange = updateFilter
});
function updateFilter(event){
    
    console.log('w');

    var selectedFilter = document.getElementsByClassName('filter-' + event.target.dataset.filter);
    var selectedCategory = event.target.value;

    // Loop over selected filter-row
    each(selectedFilter, function(el){
        
        // Hide all thats active
        var activeItems = findAll('.is-active', el);
        each(activeItems, function(el){
            removeClass(el, 'is-active');
        });

        // Set active on selected class.
        var category =  findAll('.' + selectedCategory, el)
        each(category, function(el){
            addClass(el, 'is-active');
        });

    });


}