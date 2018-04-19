/* 
General notes:

- IE doesn't support arrow functions. So sorry - no pretty sintax today.
- Here I work with DOM elements by references. No functional style today :(
- I used Function Expressions so start function is last (line 84)
*/

//Only pure function is here
let countProperties = function (obj) {
    var count = 0;
    for (var property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            count++;
        }
    }
    return count;
};

let visibleItemsCount = function(menu) {
    return menu.querySelectorAll('.menu-holder>ul>li:not(.hidden)').length;
}

let setListItemsVisibility = function (menu, target) {
    //here we get all nodes with "data-for"
    //searching nodes that requires some DOM element to be shown
    let listItemsArray = [].slice.call(menu.querySelectorAll("li[data-for]"));

    listItemsArray.forEach(function (element) {
        //reset visibility for possible previous iteration
        element.classList.remove('hidden')

        //setting visibility
        //is clicked node === requierd node (stornig required nodes in [data-for])
        if (document.getElementById(element.dataset.for) !== target) { element.classList.add('hidden') };
        
    });

    //adjust up/down buttons visibility with new menu items count
    if (visibleItemsCount(menu) > 8) {
        menu.querySelector('.btn-down').style.display = 'block';
    } else {
        menu.querySelector('.btn-down').style.display = 'none'
    }
}

let processData = function (rootElement, data) {
    let ul, li, text, a, caret;
    ul = document.createElement('ul');
    ul.classList.add('context');

    //let's check first level data for items
    for (let key in data) {
        //actually we don't really need chis check here. But anyway.
        if (data.hasOwnProperty(key)) {
            //make DOM elements
            li = document.createElement('li');
            a = document.createElement('a');
            text = document.createTextNode(data[key].text);

            //setting href for <a>
            a.setAttribute('href', 'javascript:void(0)');

            //is current element must be visible only for specific element?
            if (data[key].hasOwnProperty('onlyfor') && data[key].onlyfor !== null) {
                li.classList.add('menuitem');
                li.setAttribute('data-for', data[key].onlyfor);
            }

            //setting mennu element click handler
            if (data[key].hasOwnProperty('handler') && (data[key].handler !== null) && !data[key].disabled) {
                a.onclick = data[key].handler;
            }

            //is element disabled
            if (data[key].hasOwnProperty('disabled') && data[key].disabled) {
                li.classList.add('disabled');
            }

            //current element is ready. Appending to DOM
            a.appendChild(text);
            li.appendChild(a);
            ul.appendChild(li);
            rootElement.appendChild(ul);

            //any sub-elements?
            if (data[key].hasOwnProperty('subitem') && !data[key].disabled) {
                caret = document.createElement('span');
                caret.classList.add('caret');
                a.appendChild(caret);
                processData(li, data[key].subitem);
            }
        }
    }
};

let contextMenu = function (element, data) {
    let menu = document.getElementById('context-menu');
    let btnUp, btnDown, menuHolder;

    //this DOM elements are already exist
    btnUp = document.querySelector('.btn-up');
    btnDown = document.querySelector('.btn-down');
    menuHolder = document.querySelector('.menu-holder');

    //Adding onClick handlers here because 
    //there is no sense to do it outside this function
    document.onclick = function (e) {
        if (e.target.nodeName !== 'BUTTON') {
            menu.style.display = 'none';
        }

        if (e.target == btnUp) {
            menuHolder.scrollTop = menuHolder.scrollTop - 32;
        }

        if (e.target == btnDown) {
            menuHolder.scrollTop = menuHolder.scrollTop + 32;
        }
    };

    document.body.oncontextmenu = function (e) {
        e.preventDefault();

        //where click happened
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        //showing contect menu
        menu.style.display = 'block';

        //reset positioning classes
        menu.classList.remove('transX');
        menu.classList.remove('transY');

        //checking vertical overflow
        //(do we need to flip menu up?) && (menu height smaller than screen height?)
        if ((e.pageY + menu.offsetHeight + btnUp.offsetHeight + btnDown.offsetHeight > document.documentElement.clientHeight) && (menu.offsetHeight + btnUp.offsetHeight + btnDown.offsetHeight < e.pageY)) {
            //add transition class (vertical position mirroring )
            menu.classList.add('transY');
        }

        //(do we need to flip menu up?) && (menu height bigger than screen height?)
        if ((e.pageY + menu.offsetHeight + btnUp.offsetHeight + btnDown.offsetHeight > document.documentElement.clientHeight) && (menu.offsetHeight + btnUp.offsetHeight + btnDown.offsetHeight > e.pageY)) {
            menu.style.top = document.documentElement.clientHeight - menu.offsetHeight - btnUp.offsetHeight - btnDown.offsetHeight + 'px';
        }

        //checking horizontal overflow
        //(is menu width and X coordinate bigger than screen width?)
        if (e.pageX + menu.offsetWidth > document.documentElement.clientWidth) {
            //add transition class (horizontal position mirroring )
            menu.classList.add('transX');
        }

        //now it's time to check what menu items we need to hide
        //giving menu node and clicked node to function
        setListItemsVisibility(menu, e.target);
    };


    //show/hide scroll buttons (depend on current scroll position)
    element.addEventListener('scroll', function (e) {
        if (this.scrollTop < 10) {
            btnUp.style.display = 'none';
        } else {
            btnUp.style.display = 'block';
        }

        if (this.offsetHeight + this.scrollTop == this.scrollHeight) {
            btnDown.style.display = 'none';
        } else {
            btnDown.style.display = 'block';
        }
    });

    //need to show scroll button if elements overall height
    //bigger than max-height of menu
    if (countProperties(data) > 8) {
        btnDown.style.display = 'block';
    }

    //now, when we're done with preparing, let's process
    //menu items data
    processData(element, data);
};

