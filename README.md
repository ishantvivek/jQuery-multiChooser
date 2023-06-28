# jQuery-multiChooser

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

ScreenShot:
![image](https://user-images.githubusercontent.com/24982790/211212880-b8dd5496-eb53-4f77-8b45-01ebdc270a7a.png)
