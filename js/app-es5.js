'use strict';

//I do respect Array API so let's use it
//convert incoming data to array
var constinitDataToArrayData = function constinitDataToArrayData(data) {
    var tempArr = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            tempArr.push(data[key]);
        }
    }
    return tempArr;
};

//transform array of objects to an array of DOM nodes
var getListItems = function getListItems(data, clickedElementID) {
    var ul = void 0,
        li = void 0,
        a = void 0,
        text = void 0;

    var nodesList = data.map(function (item) {
        li = document.createElement('li');

        //if this is menu item for another clicked element,
        //I just return empty element.
        //And yes - I could use Array.filter
        if (item.onlyfor && item.onlyfor !== clickedElementID) {
            return li;
        }

        a = document.createElement('a');
        text = document.createTextNode(item.text);
        a.setAttribute('href', 'javascript:void(0)');
        a.appendChild(text);
        li.appendChild(a);

        //any event handler?
        item.handler ? a.onclick = item.handler : null;

        //is list item disabled
        item.disabled ? li.classList.add('disabled') : null;

        //any subitems and current item NOT disabled?
        if (item.subitem && !item.disabled) {
            var subData = constinitDataToArrayData(item.subitem);
            var subList = getListItems(subData, clickedElementID);

            ul = document.createElement('ul');
            appendList(subList, ul);
            li.appendChild(ul);
        }

        return li;
    });

    //return array of nodes
    return nodesList;
};

//apend array of nodes to DOM element
var appendList = function appendList(list, target) {
    list.forEach(function (element) {
        target.appendChild(element);
    });
};

//Adjust menu position relative to screen edges
var alignmentAdjuster = function alignmentAdjuster(e, menu) {
    menu.classList.remove('transX');
    menu.classList.remove('transY');

    if (e.pageY + menu.offsetHeight > document.documentElement.clientHeight && menu.offsetHeight < e.pageY) {
        menu.classList.add('transY');
    }

    if (e.pageX + menu.offsetWidth > document.documentElement.clientWidth) {
        menu.classList.add('transX');
    }

    if (menu.offsetHeight >= document.documentElement.clientHeight) menu.style.top = 0;
};

//just checking if scroll buttons visibility is needed
var setScrollButtonsVisibility = function setScrollButtonsVisibility(btnUp, btnDown, topPosition, menuHeight, menuScrollHeight) {
    topPosition < 10 ? btnUp.setAttribute('hidden', '') : btnUp.removeAttribute('hidden');
    menuHeight + topPosition > menuScrollHeight - 10 ? btnDown.setAttribute('hidden', '') : btnDown.removeAttribute('hidden');
};

//init function
var contextMenu = function contextMenu(targetNode, initData) {
    var data = constinitDataToArrayData(initData);
    var list = void 0,
        ul = void 0,
        btnUp = void 0,
        btnDown = void 0;

    ul = targetNode.getElementsByTagName('ul')[0];
    btnUp = document.querySelector('.btn-up');
    btnDown = document.querySelector('.btn-down');

    //event listeners
    document.body.oncontextmenu = function (e) {
        e.preventDefault();
        targetNode.style.left = e.pageX + 'px';
        targetNode.style.top = e.pageY + 'px';
        targetNode.style.display = 'flex';
        list = getListItems(data, e.target.id);
        ul.innerHTML = '';
        appendList(list, ul);
        alignmentAdjuster(e, targetNode);
        setScrollButtonsVisibility(btnUp, btnDown, ul.scrollTop, ul.offsetHeight, ul.scrollHeight);
    };

    //event listeners
    document.onclick = function (e) {
        if (e.target.nodeName !== 'BUTTON') {
            targetNode.style.display = 'none';
        }

        if (e.target == btnUp) {
            ul.scrollTop = ul.scrollTop - 32;
            setScrollButtonsVisibility(btnUp, btnDown, ul.scrollTop, ul.offsetHeight, ul.scrollHeight);
        }

        if (e.target == btnDown) {
            ul.scrollTop = ul.scrollTop + 32;
            setScrollButtonsVisibility(btnUp, btnDown, ul.scrollTop, ul.offsetHeight, ul.scrollHeight);
        }
    };
};