/**
  * Multi Chooser configurablility plugin
  * Created by Ishant Vivek <ishantvivek1311@gmail.com>

  * A plugin created for specific purpose of choosing multiple options with elegant drop down list of checkboxes.
  * This plugin depends on jQuery and i18n.

  * Call the init() method first with the the id/class of the container element and options where the plugin will intialised.
  * This will create the HTML for the selection controls.

  * The options are
        columnPair: The array of key value pair of the elements. Key will used as the class and data attribute and value will be used as the
                    display value and tooltip of the element. E.g:
                      [ { option1: The first Option },
                        { option2: The Second Option },
                        { option3: The Third Option }
                      ]
        availableList: Array list of the keys which will appear on the available columns. Note: list of keys given in columnPair must be
                       given. E.g: [ option1, option2, option3 ]
        selectedList: Array list of the keys which will appear on the selected columns(pre-selected). Note: list of keys given in columnPair must be
                       given. E.g: [ option1, option2, option3 ]

  * Methods are also available for the following.
        ** done: It returns HTML elements of selectedList, parent container of selected elements and array list of selected items.
                 - selectedList, parentElement, list
*/

var multiChooser = multiChooser || (function($) {

    let selectedList;
    let availableList;
    let columnPair;

    let regionalDefaults = {
        selectAll : 'Select All',
        filter: 'Filter',
        moveRight: 'Move to right',
        removeRight: 'Remove from right',
        moveUp : '↑',
        moveDown: '↓',
        moveUpTitle: 'Move up',
        moveDownTitle: 'Move down',
        moveSelected: '>',
        removeSelected: '<',
        moveAll: '>>',
        removeAll: '<<',
        moveSelectedTitle: 'Move selected to right',
        removeSelectedTitle: 'Clear selected items from right',
        moveAllTitle: 'Move all to right',
        removeAllTitle: 'Clear all items from right',
        noAvailableData: 'No Data Available',
        noAddedData: 'No Data Added'
    }

    // This method is called with init() and creates a container where all required elements will be appended
    function createBox() {
        // create the main container element
        const box = $('<div class="main"></div>');
        // the box for all the available list
        const dragBox = $('<div class="dragBox"></div>');
        // the box for all the selected list
        const dropBox = $('<div class="dropBox"></div>');
        // button box container having all the buttons for moving elements
        const buttonBox = $('<div class="buttonBox"></div>');
        // ul element where all available list items will be added
        const dragList = $('<ul id="draggable"></ul>');
        // ul element where all selected list items will be added
        const dropList = $(' <ul id="droppable"></ul>');
        // buttons for adding and removing elements
        const buttonBoxHdr = $('<div class="buttonBoxHdr"></div>');
        const addAll = $('<span class="addAll btn btn-primary" tabindex="0" title="' + regionalDefaults.moveAllTitle + '">'
                        + regionalDefaults.moveAll + '</span>');
        const addSelected = $('<span class="addSelected btn btn-primary" tabindex="0" title="' + regionalDefaults.moveSelectedTitle + '">'
                        + regionalDefaults.moveSelected + '</span>');
        const removeAll = $('<span class="removeAll btn btn-primary" tabindex="0" title="' + regionalDefaults.removeAllTitle + '">'
                        + regionalDefaults.removeAll + '</span>');
        const removeSelected = $('<span class="removeSelected btn btn-primary" tabindex="0" title="' + regionalDefaults.removeSelectedTitle + '">'
                        + regionalDefaults.removeSelected + '</span>');
        // select all checkbox for available items
        const selectAlldrag = $('<div class="selectAlldrag"></div>');
        const selectAlldragChkBox = $('<label title="'+ regionalDefaults.selectAll + '"><input id="selectAlldragChkBox" type="checkbox"></input>'
                                    + regionalDefaults.selectAll + '</label>');
        // select all checkbox for selected items
        const selectAlldrop = $('<div class="selectAlldrop"></div>');
        const selectAlldropChkBox = $('<label title="'+ regionalDefaults.selectAll + '"><input id="selectAlldropChkBox" type="checkbox"></input>'
                                    + regionalDefaults.selectAll + '</label>');
        // filter box for filtering items
        const dragFilterBox =  $('<input id="dragFilterBox" type="text" title="'+ regionalDefaults.filter + '" placeholder="'
                               + regionalDefaults.filter + '"></input>');
        // for moving selected elements up and down 
        const navigator = $('<div class="navigator"></div>');
        const dropUpNav = $('<span class="dropUpNav btn btn-primary" tabindex="0" title="' + regionalDefaults.moveUpTitle + '">' + regionalDefaults.moveUp + '</span>');
        const dropDownNav = $('<span class="dropDownNav btn btn-primary" tabindex="0" title="'+ regionalDefaults.moveDownTitle + '">' + regionalDefaults.moveDown + '</span>');
        // event listener for selecting all element
        selectAlldragChkBox.on('click', function(e){
            selectAllList(this, e);
        });
        selectAlldropChkBox.on('click', function(e){
            selectAllList(this, e);
        });
        // event listener for filter
        dragFilterBox.on('input', function(e){
            filterList(this, e);
        });
        // listener for moving elements up and down
        dropUpNav.on('click', function(){
            navUp();
        });
        dropDownNav.on('click', function(){
            navDown();
        });
        // add/remove selected or all elements
        addSelected.on('click', function(){
            addSelectedOptions();
        });
        removeSelected.on('click', function(){
            removeSelectedOptions();
        });
        addAll.on('click', function(){
           moveAllOptions();
        });
        removeAll.on('click', function(){
            removeAllOptions();
         });
        selectAlldragChkBox.appendTo(selectAlldrag);
        selectAlldropChkBox.appendTo(selectAlldrop);
        dropUpNav.appendTo(navigator);
        dropDownNav.appendTo(navigator);
        navigator.appendTo(selectAlldrop);
        dragFilterBox.appendTo(selectAlldrag);
        buttonBoxHdr.appendTo(buttonBox);
        addSelected.appendTo(buttonBoxHdr);
        removeSelected.appendTo(buttonBoxHdr);
        addAll.appendTo(buttonBoxHdr);
        removeAll.appendTo(buttonBoxHdr);
        selectAlldrag.appendTo(dragBox);
        dragList.appendTo(dragBox);
        selectAlldrop.appendTo(dropBox);
        dropList.appendTo(dropBox);
        dragBox.appendTo(box);
        buttonBox.appendTo(box);
        dropBox.appendTo(box);
        createDragBox(availableList, dragList);
        createDropBox(selectedList, dropList);
        // returns complete html box with all the required child elements
        return box;
    }

    // for creating a watermark when list is empty
    function createNodata(target, text) {
        const noData = $('<div class="noData">' + text + '</div>');
        noData.appendTo(target);
    }

    // create available list
    function createDragBox(list, dragList) {

        if(list.length === 0) {
            const text = regionalDefaults.noAvailableData;
            createNodata(dragList.parent(), text);
            return;
        }

        list.forEach(function(elem){
            const button = $('<span class="dragButton ui-icon ui-icon-plus" title="'+ regionalDefaults.moveRight + '" tabindex="0"></span>');
            const chkBox = $('<label title="'+ columnPair[elem] + '"><input id="dragChkBox" type="checkbox"></input>'+ columnPair[elem] +'</label>');
            const listItem = $('<li title="'+ columnPair[elem] + '" class="' + elem + '" tabindex="0" data-attribute="' + elem + '"></li>');
            listItem.on('click keypress', function(e) {
                if(e.which === 1 || e.which === 13)
                    selectList(this, e);
            });
            chkBox.appendTo(listItem);
            button.appendTo(listItem);
            listItem.appendTo(dragList);
        });
        dragList.parent().find('.noData').remove();
    }

    // create pre-selected list
    function createDropBox(list, dropList) {

        if(list.length === 0) {
            const text = regionalDefaults.noAddedData;
            createNodata(dropList.parent(), text);
            return;
        }

        list.forEach(function(elem){
            const button = $('<span class="dropButton ui-icon ui-icon-minus" title="'+ regionalDefaults.removeRight + '" tabindex="0"></span>');
            const chkBox = $('<label title="'+ columnPair[elem] + '"><input id="dropChkBox" type="checkbox"></input>'+ columnPair[elem] +'</label>');
            const listItem = $('<li title="'+ columnPair[elem] + '" class="' + elem + '" tabindex="0" data-attribute="' + elem + '"></li>');
            const upButton = $('<span class="upButton btn btn-primary" tabindex="0" title="'+ regionalDefaults.moveUpTitle +'">' + regionalDefaults.moveUp + '</span>');
            const downButton = $('<span class="downButton btn btn-primary" tabindex="0" title="'+ regionalDefaults.moveDownTitle +'">' + regionalDefaults.moveDown + '</span>');
            // attach functions of up and down button
            upButton.on('click', function(e) {
                e.stopPropagation();
                goUp(this, e);
            });
            downButton.on('click', function(e) {
                e.stopPropagation();
                goDown(this, e);
            });
            listItem.on('click', function(e) {
                if(e.which === 1 || e.which === 13)
                    selectList(this, e);
            });
            chkBox.appendTo(listItem);
            upButton.appendTo(listItem);
            downButton.appendTo(listItem);
            button.appendTo(listItem);
            listItem.appendTo(dropList);
        });
    }

    // method for selecting/de-selecting item(s)
    function selectList(that, e) {
        if(e.target === $(that).find('.dropButton')[0] || e.target === $(that).find('.dragButton')[0])
            return;
        if(e.target !== $(that).find('label')[0])
            that.classList.toggle('ui-state-highlight');
        if(e.target !== $(that).find('input')[0] && e.target !== $(that).find('label')[0]) {
            $(that).find('input').prop('checked')
              ? $(that).find('input').prop('checked', false)
              : $(that).find('input').prop('checked', true);
        }
    }

    // method for selecting/de-selecting all items
    function selectAllList(that, e) {
        const attributes = $(that).parent().next().children();
        const isChecked = $(that).find('input').prop('checked');
        if(e.target !== that && attributes.length > 0) {
            for(let attr of attributes){
                if(isChecked) {
                    $(attr).find('input').prop('checked', true);
                    $(attr).addClass('ui-state-highlight');
                }
                else {
                    $(attr).find('input').prop('checked', false);
                    $(attr).removeClass('ui-state-highlight');
                }
            }
        }
    }

    $(document).on('click keypress', '.dragButton', function(e){
        if(e.which === 1 || e.which === 13)
            addToSelectedList(this, e);
    });

    $(document).on('click keypress', '.dropButton', function(e){
        if(e.which === 1 || e.which === 13)
            removeFromSelectedList(this, e);
    });

    // add element to select list
    function addToSelectedList(that, e) {
        const upButton = $('<span class="upButton btn btn-primary" tabindex="0" title="'+ regionalDefaults.moveUpTitle +'">' + regionalDefaults.moveUp + '</span>');
        const downButton = $('<span class="downButton btn btn-primary" tabindex="0" title="'+ regionalDefaults.moveDownTitle +'">' + regionalDefaults.moveDown + '</span>');
        // attach functions of up and down button
        upButton.on('click', function(e) {
            goUp(this, e);
            e.stopPropagation();
        });
        downButton.on('click', function(e) {
            goDown(this, e);
            e.stopPropagation();
        });
        $(that).switchClass('ui-icon-plus', 'ui-icon-minus');
        $(that).switchClass('dragButton', 'dropButton');
        const attribute = $(that).parent();
        const dragBox = $('#draggable');
        const dropBox = $('#droppable')
        dragBox.find(attribute).remove();
        attribute.on('click', function(e) {
            selectList(this, e);
        });
        upButton.insertBefore(attribute.find('.dropButton'));
        downButton.insertBefore(attribute.find('.dropButton'));
        dropBox.append(attribute);
        availableList = availableList.filter(function(elem) {
            return elem !== $(attribute[0]).attr('data-attribute');
        })
        if(dragBox.children().length === 0) {
            const text = regionalDefaults.noAvailableData;
            createNodata(dragBox.parent(), text);
            dropBox.parent().find('.noData').remove();
        }
        else {
            $('.noData').remove();
        }
    }

    // remove element from select list
    function removeFromSelectedList(that, e) {
        $(that).switchClass('ui-icon-minus', 'ui-icon-plus');
        $(that).switchClass('dropButton', 'dragButton');
        const attribute = $(that).parent();
        const dragBox = $('#draggable');
        const dropBox = $('#droppable')
        attribute.find('.upButton').remove();
        attribute.find('.downButton').remove();
        dropBox.find(attribute).remove();
        attribute.on('click', function(e) {
            selectList(this, e);
        });
        dragBox.prepend(attribute);
        availableList.push($(attribute[0]).attr('data-attribute'));
        if(dropBox.children().length === 0){
            const text = regionalDefaults.noAddedData;
            createNodata(dropBox.parent(), text);
            dragBox.parent().find('.noData').remove();;
        }
        else {
            $('.noData').remove();
        }
    }

    function addSelectedOptions() {
        const selectedOptions = $('#draggable').children().filter(function(idx, el) {
            return el.classList.contains('ui-state-highlight');
        });
        selectedOptions.each(function(idx, elem){
            addToSelectedList(elem.lastChild);
        });
        $('#selectAlldragChkBox').prop('checked', false);
    }

    function removeSelectedOptions() {
        const selectedOptions = $('#droppable').children().filter(function(idx, el) {
            return el.classList.contains('ui-state-highlight');
        }).sort(function(){
            return -1;
        });
        selectedOptions.each(function(idx, elem){
            removeFromSelectedList(elem.lastChild);
        });
        $('#selectAlldropChkBox').prop('checked', false);
    }

    function moveAllOptions() {
        const selectedOptions = $('#draggable').children();
        selectedOptions.each(function(idx, elem){
            addToSelectedList(elem.lastChild);
        });
    }

    function removeAllOptions() {
        const selectedOptions = $('#droppable').children().sort(function(){
            return -1;
        });
        selectedOptions.each(function(idx, elem){
            removeFromSelectedList(elem.lastChild);
        });
    }

    // method for filtering list
    function filterList(that, e) {
        const dragBox = $('#draggable');
        const searchValue = new RegExp(e.target.value, 'i');
        dragBox.empty();
        const newList = availableList.filter(function(elem){
            return columnPair[elem].match(searchValue);
        });
        createDragBox(newList, dragBox);
    }

    function navUp() {
        const dropBox = $('#droppable');
        const selectedItem = dropBox.children().filter(function(idx, el) {
           return el.classList.contains('ui-state-highlight');
        });
        if(selectedItem.length > 0) {
            selectedItem.each(function(idx, item){
                if($(item).prev().length > 0) {
                    let prevElement = $(item).prev();
                    const upButton = $(item).find('.upButton');
                    const downButton = $(item).find('.downButton');
                    dropBox.find(item).remove();
                    $(item).insertBefore(prevElement);
                    $(item).on('click', function(e) {
                        selectList(this, e);
                    });
                    // attach functions of up and down button
                    upButton.on('click', function(e) {
                        goUp(this, e);
                        e.stopPropagation();
                    });
                    downButton.on('click', function(e) {
                        goDown(this, e);
                        e.stopPropagation();
                    });
                }
            });
            selectedItem.focus();
        }
    }

    function navDown() {
        const dropBox = $('#droppable');
        const selectedItem = dropBox.children().filter(function(idx, el) {
           return el.classList.contains('ui-state-highlight');
        }).sort(function(a,b) {
            return -1;
        });
        if(selectedItem.length > 0) {
            selectedItem.each(function(idx, item){
                if($(item).next().length > 0) {
                    let nextElement = $(item).next();
                    const upButton = $(item).find('.upButton');
                    const downButton = $(item).find('.downButton');
                    dropBox.find(item).remove();
                    $(item).insertAfter(nextElement);
                    $(item).on('click', function(e) {
                        selectList(this, e);
                    });
                    // attach functions of up and down button
                    upButton.on('click', function(e) {
                        goUp(this, e);
                        e.stopPropagation();
                    });
                    downButton.on('click', function(e) {
                        goDown(this, e);
                        e.stopPropagation();
                    });
                }
            });
            selectedItem.focus();
        }
    }

    function goUp(that, e) {
        const currentElement = $(that).parent();
        const prevElement = currentElement.prev();
        const upButton = currentElement.find('.upButton');
        const downButton = currentElement.find('.downButton');
        if(prevElement.length > 0) {
            currentElement.remove();
            upButton.on('click', function(e) {
                goUp(this, e);
                e.stopPropagation();
            });
            downButton.on('click', function(e) {
                goDown(this, e);
                e.stopPropagation();
            });
            currentElement.on('click', function(e) {
                selectList(this, e);
            });
            currentElement.insertBefore(prevElement);
        }
    }

    function goDown(that, e) {
        const currentElement = $(that).parent();
        const nextElement = currentElement.next();
        const upButton = currentElement.find('.upButton');
        const downButton = currentElement.find('.downButton');
        if(nextElement.length > 0) {
            currentElement.remove();
            upButton.on('click', function(e) {
                goUp(this, e);
                e.stopPropagation();
            });
            downButton.on('click', function(e) {
                goDown(this, e);
                e.stopPropagation();
            });
            currentElement.on('click', function(e) {
                selectList(this, e);
            });
            currentElement.insertAfter(nextElement);
        }
    }

    return {
        init: function(element, options) {
            if(element === undefined || element === null || options.columnPair === undefined || options.columnPair.length === 0) {
                alert('Empty elements, Column Chooser cannot be intialised.');
                return;
            }
            columnPair = options.columnPair;
            availableList = options.availableList;
            selectedList= options.selectedList || [];
            createBox().appendTo(element);
        },
        done: function() {
            let preferences = $('#droppable').children().map(function(idx, item) {
                return $(item).attr('data-attribute');
            });
            return {
                selectedList: $('#droppable').children(),
                parentElement: $('#droppable'),
                list: preferences.get()
            }
        }
    }
})(jQuery);
