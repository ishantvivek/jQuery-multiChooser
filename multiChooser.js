/**
  * Multi Chooser configurablility plugin
  * Created by Ishant Vivek <ishantvivek1311@gmail.com>

  * A plugin created for specific purpose of choosing multiple options with elegant drop down list of checkboxes.
  * This plugin depends on jQuery.

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
        onElementChange: An event change function to execute specified operation on addition or removal of a element.

  * Methods are also available for the following.
        ** getSelectedPreferences: It returns HTML elements of selectedList, parent container of selected elements and array list of selected items.
                 - selectedList, parentElement, list
        ** resetToDefault: It resets the availableList and selectedList to the default list provided.
*/

var multiChooser =
    multiChooser ||
    (function($) {
        let selectedList;
        let availableList;
        let totalList;
        let columnPair;
        let $draggable;
        let $droppable;

        let regionalDefaults = {
            selectAll: 'Select All',
            filter: 'Filter',
            moveRight: 'Move to right',
            removeRight: 'Remove from right',
            moveUp: '↑',
            moveDown: '↓',
            moveUpNavigator: '↑↑',
            moveDownNavigator: '↓↓',
            moveUpNavigatorTitle: 'Move one or more elements up',
            moveDownNavigatorTitle: 'Move one or more elements down',
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
        };

        // This method is called with init() and creates a container where all required elements will be appended
        function createBox() {
            const $mainContainer = $('<div class="main"></div>');
            const $dragBox = $('<div class="dragBox"></div>');
            const $dropBox = $('<div class="dropBox"></div>');
            const $buttonBox = $('<div class="buttonBox"></div>');
            const $buttonBoxHdr = $('<div class="buttonBoxHdr"></div>');
            $draggable = $('<ul id="draggable"></ul>');
            $droppable = $('<ul id="droppable"></ul>');

            const $addAll = $('<button class="addAll btn btn-primary"></span>')
                .attr('title', regionalDefaults.moveAllTitle)
                .text(regionalDefaults.moveAll);
            $addAll.on('click', function() {
                moveAllOptions();
            });

            const $addSelected = $(
                '<button class="addSelected btn btn-primary"></span>'
            )
                .attr('title', regionalDefaults.moveSelectedTitle)
                .text(regionalDefaults.moveSelected);
            $addSelected.on('click', function() {
                addSelectedOptions();
            });

            const $removeAll = $(
                '<button class="removeAll btn btn-primary"></span>'
            )
                .attr('title', regionalDefaults.removeAllTitle)
                .text(regionalDefaults.removeAll);
            $removeAll.on('click', function() {
                removeAllOptions();
            });

            const $removeSelected = $(
                '<button class="removeSelected btn btn-primary"></span>'
            )
                .attr('title', regionalDefaults.removeSelectedTitle)
                .text(regionalDefaults.removeSelected);
            $removeSelected.on('click', function() {
                removeSelectedOptions();
            });

            const $selectAllDragBox = $('<div class="selectAlldrag"></div>');
            const $selectAllDragBoxLabel = $('<label></label>').attr(
                'title',
                regionalDefaults.selectAll
            );
            const $selectAllDragChkBox = $(
                '<input id="selectAlldragChkBox" type="checkbox"></input>'
            ).appendTo($selectAllDragBoxLabel);
            $selectAllDragBoxLabel.append(regionalDefaults.selectAll);
            $selectAllDragBoxLabel.on('click', function(e) {
                selectAllList(this, e);
            });

            const $selectAllDropBox = $('<div class="selectAlldrop"></div>');
            const $selectAllDropBoxLabel = $('<label></label>').attr(
                'title',
                regionalDefaults.selectAll
            );
            const $selectAllDropChkBox = $(
                '<input id="selectAlldropChkBox" type="checkbox"></input>'
            ).appendTo($selectAllDropBoxLabel);
            $selectAllDropBoxLabel.append(regionalDefaults.selectAll);
            $selectAllDropBoxLabel.on('click', function(e) {
                selectAllList(this, e);
            });

            const $dragFilterBox = $(
                '<input id="dragFilterBox" type="text"></input>'
            ).attr({
                title: regionalDefaults.filter,
                placeholder: regionalDefaults.filter,
                'aria-label': regionalDefaults.filter
            });
            $dragFilterBox.on('input', function() {
                filterList(this);
            });

            const $navigator = $('<div class="navigator"></div>');
            const $moveUpNavigator = $(
                '<button class="dropUpNav btn btn-primary"></button>'
            )
                .attr('title', regionalDefaults.moveUpNavigatorTitle)
                .text(regionalDefaults.moveUpNavigator);
            $moveUpNavigator.on('click', function() {
                navUp();
            });
            const $moveDownNavigator = $(
                '<button class="dropDownNav btn btn-primary"></button>'
            )
                .attr('title', regionalDefaults.moveDownNavigatorTitle)
                .text(regionalDefaults.moveDownNavigator);
            $moveDownNavigator.on('click', function() {
                navDown();
            });

            $selectAllDragBoxLabel.appendTo($selectAllDragBox);
            $selectAllDropBoxLabel.appendTo($selectAllDropBox);
            $moveUpNavigator.appendTo($navigator);
            $moveDownNavigator.appendTo($navigator);
            $navigator.appendTo($selectAllDropBox);
            $dragFilterBox.appendTo($selectAllDragBox);
            $buttonBoxHdr.appendTo($buttonBox);
            $addSelected.appendTo($buttonBoxHdr);
            $removeSelected.appendTo($buttonBoxHdr);
            $addAll.appendTo($buttonBoxHdr);
            $removeAll.appendTo($buttonBoxHdr);
            $selectAllDragBox.appendTo($dragBox);
            $draggable.appendTo($dragBox);
            $selectAllDropBox.appendTo($dropBox);
            $droppable.appendTo($dropBox);
            $dragBox.appendTo($mainContainer);
            $buttonBox.appendTo($mainContainer);
            $dropBox.appendTo($mainContainer);
            createDragBox(availableList, $draggable);
            createDropBox(selectedList, $droppable);
            return $mainContainer;
        }

        function createEmptyDataWatermark($target, watermark) {
            if ($target.find('.noData').length < 1) {
                const $noData = $('<div class="noData"></div>').text(watermark);
                $noData.appendTo($target);
            }
        }

        function createDragBox(list, $dragList) {
            if (list.length === 0) {
                const watermark = regionalDefaults.noAvailableData;
                createEmptyDataWatermark($dragList.parent(), watermark);
                return;
            }

            list.forEach(function(elem) {
                const itemName = columnPair[elem];
                const $addButton = $(
                    '<button class="dragButton ui-icon ui-icon-plus"></button>'
                ).attr('title', regionalDefaults.moveRight);
                const $chkBoxLabel = $('<label></label>').attr(
                    'title',
                    itemName
                );
                const $checkBox = $('<input type="checkbox"></input>')
                    .attr('id', 'dragChkBox_' + elem)
                    .appendTo($chkBoxLabel);
                $chkBoxLabel.append(itemName);
                const $listAttributes = $('<li></li>')
                    .attr({
                        class: elem.replace(/ /g, '') + '_attr',
                        title: itemName,
                        tabindex: 0,
                        'data-attribute': elem
                    })
                    .on('click keypress', function(e) {
                        if (e.which === 1 || e.which === 13)
                            selectList(this, e);
                    });
                $chkBoxLabel.appendTo($listAttributes);
                $addButton.appendTo($listAttributes);
                $listAttributes.appendTo($dragList);
            });
            $dragList.parent().find('.noData').remove();
        }

        function createDropBox(list, $dropList) {
            if (list.length === 0) {
                const watermark = regionalDefaults.noAddedData;
                createEmptyDataWatermark($dropList.parent(), watermark);
                return;
            }

            list.forEach(function(elem) {
                const itemName = columnPair[elem];
                const $removeButton = $(
                    '<button class="dropButton ui-icon ui-icon-minus"></button>'
                ).attr('title', regionalDefaults.removeRight);
                const $chkBoxLabel = $('<label></label>').attr(
                    'title',
                    itemName
                );
                const $checkBox = $('<input type="checkbox"></input>')
                    .attr('id', 'dropChkBox_' + elem)
                    .appendTo($chkBoxLabel);
                $chkBoxLabel.append(itemName);
                const $listAttributes = $('<li></li>')
                    .attr({
                        class: elem.replace(/ /g, '') + '_attr',
                        title: itemName,
                        tabindex: 0,
                        'data-attribute': elem
                    })
                    .on('click keypress', function(e) {
                        if (e.which === 1 || e.which === 13)
                            selectList(this, e);
                    });

                const $upButton = $(
                    '<button class="upButton btn btn-primary"></button>'
                )
                    .attr('title', regionalDefaults.moveUpTitle)
                    .text(regionalDefaults.moveUp);
                const $downButton = $(
                    '<button class="downButton btn btn-primary"></button>'
                )
                    .attr('title', regionalDefaults.moveDownTitle)
                    .text(regionalDefaults.moveDown);
                $upButton.on('click', function(e) {
                    e.stopPropagation();
                    goUp(this, e);
                });
                $downButton.on('click', function(e) {
                    e.stopPropagation();
                    goDown(this, e);
                });

                $chkBoxLabel.appendTo($listAttributes);
                $upButton.appendTo($listAttributes);
                $downButton.appendTo($listAttributes);
                $removeButton.appendTo($listAttributes);
                $listAttributes.appendTo($dropList);
            });
            $dropList.parent().find('.noData').remove();
        }

        function selectList(selectedItem, e) {
            const $target = $(e.target);
            if (
                $target.is('.dropButton, .dragButton, .upButton, .downButton')
            ) {
                return;
            }
            if (!$target.is('label')) {
                $(selectedItem).toggleClass('ui-state-highlight');
            }
            if (!$target.is('input, label')) {
                $(selectedItem).find('input').prop('checked', function(i, val) {
                    return !val;
                });
            }
        }

        function selectAllList(target, event) {
            const $attributes = $(target).parent().next().children();
            const isChecked = $(target).find('input').prop('checked');
            if (event.target !== target && $attributes.length > 0) {
                $attributes.each(function() {
                    const $input = $(this).find('input');
                    $input.prop('checked', isChecked);
                    $(this).toggleClass('ui-state-highlight', isChecked);
                });
            }
        }

        $(document).on('click', '.dragButton', function(e) {
            addToSelectedList($(this).parent(), e);
        });

        $(document).on('click', '.dropButton', function(e) {
            removeFromSelectedList($(this).parent(), e);
        });

        function addToSelectedList($attribute) {
            const $upButton = $(
                '<button class="upButton btn btn-primary"></button>'
            )
                .attr('title', regionalDefaults.moveUpTitle)
                .text(regionalDefaults.moveUp);
            $upButton.on('click', function(e) {
                goUp(this, e);
                e.stopPropagation();
            });
            const $downButton = $(
                '<button class="downButton btn btn-primary"></button>'
            )
                .attr('title', regionalDefaults.moveDownTitle)
                .text(regionalDefaults.moveDown);
            $downButton.on('click', function(e) {
                goDown(this, e);
                e.stopPropagation();
            });
            const $button = $attribute.find('.dragButton');
            $button.switchClass('ui-icon-plus', 'ui-icon-minus');
            $button.switchClass('dragButton', 'dropButton');
            $button.attr('title', regionalDefaults.removeRight);
            $attribute.remove();
            $attribute.on('click', function(e) {
                selectList(this, e);
            });
            $upButton.insertBefore($button);
            $downButton.insertBefore($button);
            $droppable.append($attribute);
            $attribute.focus();
            availableList = availableList.filter(function(elem) {
                return elem !== $attribute.attr('data-attribute');
            });
            $('#dragFilterBox').val('').trigger('input');
            $droppable.triggerHandler('elementChange');
            if ($draggable.children().length === 0) {
                const watermark = regionalDefaults.noAvailableData;
                createEmptyDataWatermark($draggable.parent(), watermark);
                $droppable.parent().find('.noData').remove();
            } else {
                $('.noData').remove();
            }
        }

        function removeFromSelectedList($attribute) {
            const $button = $attribute.find('.dropButton');
            $button.switchClass('ui-icon-minus', 'ui-icon-plus');
            $button.switchClass('dropButton', 'dragButton');
            $button.attr('title', regionalDefaults.moveRight);
            $attribute.find('.upButton').remove();
            $attribute.find('.downButton').remove();
            $attribute.remove();
            $attribute.on('click', function(e) {
                selectList(this, e);
            });
            $draggable.prepend($attribute);
            $attribute.focus();
            $droppable.triggerHandler('elementChange');
            availableList.push($attribute.attr('data-attribute'));
            if ($droppable.children().length === 0) {
                const watermark = regionalDefaults.noAddedData;
                createEmptyDataWatermark($droppable.parent(), watermark);
                $draggable.parent().find('.noData').remove();
            } else {
                $('.noData').remove();
            }
        }

        function addSelectedOptions() {
            const $selectedOptions = $draggable.find(':checkbox:checked');
            $selectedOptions.each(function(idx, elem) {
                const $parent = $(elem).parent().parent();
                addToSelectedList($parent);
            });
            $('#selectAlldragChkBox').prop('checked', false);
        }

        function removeSelectedOptions() {
            const $selectedOptions = $droppable
                .find(':checkbox:checked')
                .sort(function() {
                    return -1;
                });
            $selectedOptions.each(function(idx, elem) {
                const $parent = $(elem).parent().parent();
                removeFromSelectedList($parent);
            });
            $('#selectAlldropChkBox').prop('checked', false);
        }

        function moveAllOptions() {
            const $selectedOptions = $draggable.children();
            $selectedOptions.each(function(idx, elem) {
                const $parent = $(elem);
                addToSelectedList($parent);
            });
            $('#selectAlldragChkBox').prop('checked', false);
        }

        function removeAllOptions() {
            const $selectedOptions = $droppable.children().sort(function() {
                return -1;
            });
            $selectedOptions.each(function(idx, elem) {
                const $parent = $(elem);
                removeFromSelectedList($parent);
            });
            $('#selectAlldropChkBox').prop('checked', false);
        }

        function filterList(input) {
            // Disable the select all checkBox
            $(input).parent().find(':checkbox').prop('checked', false);
            const searchValue = new RegExp(input.value, 'i');
            $draggable.empty();
            const newList = availableList
                .filter(function(elem) {
                    return columnPair[elem].match(searchValue);
                })
                .sort(function(a, b) {
                    return columnPair[a].localeCompare(columnPair[b]);
                });
            createDragBox(newList, $draggable);
        }

        function navUp() {
            const $selectedItem = $droppable.children('.ui-state-highlight');
            if ($selectedItem.length > 0) {
                $selectedItem.each(function(idx, item) {
                    const $prevElement = $(item).prev();
                    if ($prevElement.length > 0) {
                        $(item).insertBefore($prevElement);
                    }
                });
                $selectedItem.focus();
            }
        }

        function navDown() {
            const $selectedItem = $droppable
                .children('.ui-state-highlight')
                .sort(function() {
                    return -1;
                });
            if ($selectedItem.length > 0) {
                $selectedItem.each(function(idx, item) {
                    const $nextElement = $(item).next();
                    if ($nextElement.length > 0) {
                        $(item).insertAfter($nextElement);
                    }
                });
                $selectedItem.focus();
            }
        }

        function goUp(target, e) {
            const $currentElement = $(target).parent();
            const $prevElement = $currentElement.prev();
            if ($prevElement.length > 0) {
                $currentElement.insertBefore($prevElement);
                $currentElement.focus();
            }
        }

        function goDown(target, e) {
            const $currentElement = $(target).parent();
            const $nextElement = $currentElement.next();
            if ($nextElement.length > 0) {
                $currentElement.insertAfter($nextElement);
                $currentElement.focus();
            }
        }

        return {
            init: function(targetElement, options) {
                if (
                    targetElement == null ||
                    options.columnPair === undefined ||
                    options.columnPair.length === 0
                ) {
                    const emptyElementsMessage =
                        'Empty elements, Column Chooser cannot be intialised.';
                    alert(emptyElementsMessage);
                    return;
                }
                // create a parent div for styling
                const mainContainer = $('<div class="multiChooser"></div>');
                columnPair = options.columnPair;
                availableList = options.availableList.sort(function(a, b) {
                    if (columnPair[a] === columnPair[b]) return 0;
                    return columnPair[a] < columnPair[b] ? -1 : 1;
                });
                selectedList = options.selectedList || [];
                totalList = selectedList.concat(availableList);
                createBox().appendTo(mainContainer);
                // append the container to target element
                mainContainer.appendTo(targetElement);
                $droppable.on('elementChange', function() {
                    if (options.onElementChange) options.onElementChange();
                });
            },
            getSelectedPreferences: function() {
                const preferences = $droppable
                    .children()
                    .map(function(idx, item) {
                        return $(item).attr('data-attribute');
                    })
                    .get();
                return {
                    selectedList: $droppable.children(),
                    parentElement: $droppable,
                    list: preferences
                };
            },
            resetToDefault: function(defaultList) {
                // remove drag and drop list
                $draggable.empty();
                $droppable.empty();
                $('#selectAlldropChkBox').prop('checked', false);
                $('#selectAlldragChkBox').prop('checked', false);
                selectedList = defaultList;
                availableList = totalList
                    .filter(function(elem) {
                        return !selectedList.includes(elem);
                    })
                    .sort(function(a, b) {
                        if (columnPair[a] === columnPair[b]) return 0;
                        return columnPair[a] < columnPair[b] ? -1 : 1;
                    });
                createDragBox(availableList, $draggable);
                createDropBox(selectedList, $droppable);
            }
        };
    })(jQuery);
