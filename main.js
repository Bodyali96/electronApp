const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// SET ENV
process.env.NODE_ENV = 'development';

// listen for the app to be ready
app.on('ready', function() {
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            // to allow "require" function and other node modules
            nodeIntegration: true
          }
    });
    // load the html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    })

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert the menu
    Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
    // create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        webPreferences: {
            // to allow "require" function and other node modules
            nodeIntegration: true
          },
        title: "Add Shopping List Item"
    });
    // load the html file into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // garbage collection
    addWindow.on('close', function() {
        addWindow = null;
    });
}

// catch item: add
ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close(); 
})

// create menu template
// when you create a menu in electron, it is just an array of objects
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Commant+N': 'Ctrl+N',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Commant+E': 'Ctrl+E',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                // add a hot key to exit when typing ctrl + Q
                accelerator: process.platform == 'darwin' ? 'Commant+Q': 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu to prevent "electron" menu item
if(process.platform == 'darwin') {
    // add an empty item to the beginning of the menu items
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: "Dev Tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: process.platform == 'darwin' ? 'Commant+I': 'Ctrl+I',
                // we adding item and focusedWindow to make devtools able to show up on any window
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}