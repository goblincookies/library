
const dialog = document.querySelector("#dialog");
const dialogTitle = document.querySelector('#title');
const dialogAuthor = document.querySelector('#author');
const dialogPages = document.querySelector('#pages');
const dialogIsRead = document.querySelector('#isRead');
const dialogIsReadCheck = document.querySelector('#isReadCheck');
const dialogCover = document.querySelector('#dialog-cover');
const checkImgFile = [ "images/checkFill.svg", "images/checkOutline.svg"];

// COLORS FOR COVER GRADIENT
let darkColors = [ "#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b",
    "#4d908e","#577590","#277da1","#471ca8","#884ab2","#ff930a","#f24b04","#d1105a"];
let lightColors = ["#fbf8cc","#fde4cf","#ffcfd2","#f1c0e8","#cfbaf0","#a3c4f3",
    "#90dbf4","#8eecf5","#98f5e1","#b9fbc0"];

// BOOK DATA STRUCTURE
function book(id, title, author, pages, isRead, style) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.pages=pages;
    this.isRead = isRead;
    this.style = style;
};

// SERIAL ID MAKES SURE EACH BOOK GETS A UNIQUE ID
// IT'S USED AS HTML ID AND TO ACCESS THE LIBRARY DATABASE
let serialID = 0;
// UNDO ID MAKES IT EASIER TO RESTORE DELETED BOOKS
let undoID = 0;
let isEditingEntry = false;
let editingEntryNum = "0";
// LIBRARY DATABASE
let libraryDB = {};


setup();

function setup() {
    // WRITE A PLACEHOLDER BOOK WHEN FIRST LOADED
    let useDialog = false;
    editingEntryNum = addLibraryEntry(useDialog);
    addBookToPage(editingEntryNum);

    // MAKE SURE DELETE/EDIT HAVE LISTENERS
    updateTinyButtonListeners();

    // SETUP EVENT LISTENERS
    document.querySelector('#addBook').addEventListener("click", openDialog );
    document.querySelector('#save').addEventListener("click", dialogSaveClick );
    document.querySelector('#close').addEventListener("click", dialogCloseClick );
    document.querySelector('#isRead').addEventListener("click", dialogIsReadClick);
    document.querySelector('#isReadCheck').addEventListener("click", dialogImgCheckClick);
    document.querySelector('#gen-new-cover').addEventListener("click", dialogGenerateNewCover);
    
    // ESCAPE CAN BE USED TO CLOSE THE DIALOG WINDOW
    // THIS TRACKS THE ACTION
    dialog.addEventListener("keydown", (e) => { if(e.key == "Escape") { dialogEscape() } } );
    updateSideBookInfo();
}

// VISUALLY UPDATE THE BOOK COUNT
function updateSideBookInfo(){
    // SET BOOK TOTAL TO THE LIBRARY DATABASE SIZE
    let dbSize = Object.keys(libraryDB).length;
    document.querySelector('#totalBooks').textContent = dbSize;

    // RECALCULATE THE READ PERCENTAGE
    let readCount = 0;

    for (const [key, value] of Object.entries(libraryDB)) {
        if (libraryDB[key].isRead) {
            readCount += 1;
        }
    }
    // WRITE PERCENTAGE TO SCREEN
    const percentRead = document.querySelector('#percentRead');
    percentRead.textContent = readCount > 0 ? Math.floor((readCount/dbSize)*100) + "%" : "0%";
};

// GENERATE AND APPLY A NEW GRADIENT
function dialogGenerateNewCover( ) {
    dialogCover.classList.remove("filled");
    dialogCover.style.removeProperty("background");
    dialogCover.style.cssText = generateNewGradient();
}

// CREATE THE CSS GRADIENT STYLE
function generateNewGradient() {
    let newColors = [];
    let gradDeg = 45; // << COULD BE RANDOM, BUT IT LOOKS MESSY TO ME

    newColors.push(lightColors[ Math.floor(Math.random()*lightColors.length)]);
    newColors.push(darkColors[ Math.floor(Math.random()*darkColors.length)]);

    let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${newColors[0]} 0%, ${newColors[1]} 100%);`;

    console.log(linearGrad);
    return linearGrad.toString();
}

// CLOSE THE DIALOG WINDOW
// THIS DOES NOT SAVE ANYTHING
function dialogCloseClick() {
    console.log("closed")
    isEditingEntry = false;
    dialog.close();
}

// DIALOG IS CLOSED WITH ESCAPE BUTTON
function dialogEscape() {
    console.log("closed")
    isEditingEntry = false;
};

// OPEN THE DIALOG WINDOW
function openDialog( target ) {

    // PREFILL INPUT
    if (isEditingEntry) {
        // GET ID
        editingEntryNum = target.id.slice(2);
        // POPULATE INPUT WITH DATABASE DATA FOR EDITING
        let bookDB = libraryDB[editingEntryNum];
        dialogCover.style.cssText = bookDB.style;
        dialogTitle.value = bookDB.title;
        dialogAuthor.value = bookDB.author;
        dialogPages.value = bookDB.pages;
        dialogIsRead.checked = bookDB.isRead;

        // VISUALLY UPDATE THE BIG CHECKMARK
        let divCheck = document.querySelector("#isReadCheck");
        let imgCheck = divCheck.querySelector("img");
        imgCheck.src = bookDB.isRead ? checkImgFile[0] : checkImgFile[1];

    } else {
        // SET INPUT TO DEFAULT
        dialogCover.style.cssText = generateNewGradient();
        dialogTitle.value = "";
        dialogAuthor.value = "";
        dialogPages.value = "";

        dialogIsRead.checked = false;
        // VISUALLY UPDATE THE BIG CHECKMARK
        let divCheck = document.querySelector("#isReadCheck");
        let imgCheck = divCheck.querySelector("img");
        imgCheck.src = dialogIsRead.checked ? checkImgFile[0] : checkImgFile[1];
    }
    // ONCE DATA IS FILLED/REMOVED, SHOW DIALOG
    dialog.showModal();
}

// NAIVE FORM CHECK
// SINCE THIS DOES NOT ACCESS A REAL DATABASE
// WITH BOOKS TO CROSS-REFERENCE, IT ONLY CHECKS
// THAT ALL INPUT FIELDS HAVE DATA
function dialogValidityCheck() {

    let isValidTitle = false;
    let isValidAuthor = false;
    let isValidPages = false;
    
    // REMOVES SPACES, AND THEN CHECKS THAT IT'S AT LEAST 1 DIGIT LONG
    if (dialogTitle.value.replace(/\s/g, '').length > 0 ) {isValidTitle = true;}
    if (dialogAuthor.value.replace(/\s/g, '').length > 0 ) {isValidAuthor = true;}
    // CHECK IF PAGE IS A NUMBER
    if (parseInt(dialogPages.value).toString() == dialogPages.value) {isValidPages = true; };

    // UPDATES TITLE PASS/FAIL VISUALS
    if(isValidTitle) {
        document.querySelector("#titleLabel").textContent = "Title";
        dialogTitle.classList.remove("error");
    } else {
        // TITLE DATA NOT VALID
        let spanTitleError = document.createElement("span");
        let labelTitle= document.querySelector("#titleLabel")
        spanTitleError.classList.add("required");
        spanTitleError.textContent = "*required*";
        labelTitle.textContent = "Title";
        labelTitle.appendChild(spanTitleError);
        dialogTitle.classList.add("error");
    }

    // UPDATES AUTHOR PASS/FAIL VISUALS
    if(isValidAuthor) {
        document.querySelector("#authorLabel").textContent = "Author";
        dialogAuthor.classList.remove("error");
    } else {
        // PAGE DATA NOT VALID
        let spanAuthorError = document.createElement("span");
        let labelAuthor= document.querySelector("#authorLabel")
        spanAuthorError.classList.add("required");
        spanAuthorError.textContent = "*required*";
        labelAuthor.textContent = "Author";
        labelAuthor.appendChild(spanAuthorError);
        dialogAuthor.classList.add("error");
    }

    // UPDATES PAGES PASS/FAIL VISUALS
    if(isValidPages){
        document.querySelector("#pageLabel").textContent = "Pages";
        dialogPages.classList.remove("error");
    } else {
        // PAGE DATA NOT VALID
        let spanPageError = document.createElement("span");
        let labelPage= document.querySelector("#pageLabel")
        spanPageError.classList.add("required");
        spanPageError.textContent = "*number*";
        labelPage.textContent = "Pages";
        labelPage.appendChild(spanPageError);
        dialogPages.classList.add("error");
    }

    return (isValidTitle && isValidAuthor && isValidPages);
}

// TRIGGERS WHEN DIALOG 'SAVE' IS CLICKED
function dialogSaveClick() {
    if( dialogValidityCheck() ) {
        if(isEditingEntry) {
            // UPDATE LIBRARY DATABASE
            updateLibraryEntryFromDialog(editingEntryNum);
            // HTML EXISTS, MODIFY IT WITH NEW DATA
            updateHTML(editingEntryNum );
        } else {
            // CREATE NEW ENTRY IN DATABASE
            let useDialog = true;
            editingEntryNum = addLibraryEntry(useDialog);
            // GENERATE NEW HTML
            addBookToPage(editingEntryNum);
        }
        // CLOSE THE DIALOG AND UPDATE THE SIDE INFO
        dialogCloseClick();
        updateSideBookInfo();
    }    
}

// TRIGGERS WHEN THE CHECK MARK IS CLICKED (DIALOG ONLY)
function dialogImgCheckClick() {
    // MANUALLY TRIGGER THE IS-READ CHECKMARK, THEN PROCEED AS NORMAL
    dialogIsRead.checked = !dialogIsRead.checked;
    dialogIsReadClick();
}

// TRIGGERS WHEN THE IS-READ TOGGLE IS CHECKED (DIALOG ONLY)
function dialogIsReadClick() {
    // UPDATE THE BIG CHECK MARK TO MATCH THE IS-READ CHECKED STATE
    let divCheck = document.querySelector("#isReadCheck");
    let imgCheck = divCheck.querySelector("img");    
    imgCheck.src = dialogIsRead.checked ? checkImgFile[0] : checkImgFile[1];
}

// ADDS DATA TO THE LIBRARY DATABASE
function addLibraryEntry(useDialog) {
    serialID+=1;
    let id = serialID.toString();
    // CREATE A NEW BLANK BOOK, ADD IT TO THE DATABASE
    let b = new book;
    libraryDB[id] = b;
    
    if (useDialog){
        // USE THE DATA FROM THE DIALOG
        updateLibraryEntryFromDialog(id)
    } else {
        // HARD CODED FIRST BOOK
        b.id = id;
        b.title = "The Book of Three";
        b.author = "Lloyd Alexander";
        b.pages = "514";
        b.isRead = false;
        b.style = generateNewGradient();
    }
    
    updateSideBookInfo();
    return id;
}

// WRITE DIALOG DATA TO DATABASE
function updateLibraryEntryFromDialog( id ) {
    let bookDB = libraryDB[id];
    bookDB.id = id;
    bookDB.title = dialogTitle.value;
    bookDB.author = dialogAuthor.value;
    bookDB.pages = dialogPages.value;
    bookDB.isRead = dialogIsRead.checked;
    bookDB.style = dialogCover.style.cssText;
}

// UPDATE EXISTING HTML WITH NEW DATA FROM DATABASE
function updateHTML(id) {
    // SELECT THE CORRECT HTML AND DATA
    let bookHTML = document.querySelector("#id"+id);
    let bookDB = libraryDB[id];

    bookHTML.querySelector(".title").textContent = bookDB.title;
    bookHTML.querySelector(".author").textContent = bookDB.author;

    // IF THE DATABASE PAGES ARE A NUMBER, APPEND 'PAGES'
    if (parseInt(bookDB.pages).toString() == bookDB.pages ) {
        bookHTML.querySelector(".pages").textContent = bookDB.pages + " pages";
    } else {
        bookHTML.querySelector(".pages").textContent = "";
    }

    // WRITE NEW GRADIENT
    bookHTML.querySelector(".cover").style.cssText = bookDB.style;

    // VISUALLY UPDATE CHECK MARK BASED ON IS-READ
    let imgCheck = bookHTML.querySelector(".check");
    if (bookDB.isRead){
        imgCheck.src = checkImgFile[0];
        imgCheck.classList.remove("hidden");
    } else {
        imgCheck.src = checkImgFile[1];
        imgCheck.classList.add("hidden");
    }
}

// CREATE NEW HTML AND WRITE IT TO THE PAGE
function addBookToPage ( id ) {
    // GET DATA FROM LIBRARY
    let bookDB = libraryDB[id];

    // MAIN DIV FOR ALL BOOKS
    // APPEND CREATED DATA
    document.querySelector('#content').append( createHtmlBook( bookDB ) );

    // RE-ADD ANY LISTENERS FOR DELETE/EDIT/READ
    updateTinyButtonListeners();
}

// MAKES SURE ALL DELETE/EDIT/READ BUTTONS HAVE LISTENERS
function updateTinyButtonListeners() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
    document.querySelectorAll(".check").forEach(chk => chk.addEventListener("click", checkToggle));
}

// TRIGGERS WHEN ANY CHECK MARK IS CLICKED (LIBRARY VIEW ONLY)
function checkToggle(e) {
    // TARGET THAT WILL BE REASSIGNED
    let target = e.target;

    // TRAVEL UP THE DOM UNTIL FIRST INSTANCE OF DIV WITH AN ID
    // ONLY BOOKS SHOULD HAVE ID'S
    while(target.id == '') {
        target = target.parentNode;
    }

    // GET THE ID, REASSIGN THE IS-READ STATUS IN THE DATABASE
    let id = target.id.slice(2);
    libraryDB[id].isRead = !libraryDB[id].isRead;

    // VISUALLY MATCHES CHECK MARK TO DATA
    if (libraryDB[id].isRead) {
        e.target.classList.remove("hidden");
        e.target.src = checkImgFile[0];
    }else {
        e.target.classList.add("hidden");
        e.target.src = checkImgFile[1];
    }

    updateSideBookInfo();
};

// TRIGGERS WHEN DELETE/EDIT IS CLICKED (LIBRARY VIEW ONLY)
function bttnClick(e) {
    // TARGET THAT WILL BE REASSIGNED
    let target = e.target;

    // TRAVEL UP THE DOM UNTIL FIRST INSTANCE OF DIV WITH AN ID
    // ONLY BOOKS SHOULD HAVE ID'S
    while(target.id == '') {
        target = target.parentNode;
    };

    // TRIGGERS IF BUTTON WAS DELETE
    if(e.target.parentNode.classList.contains("delete")) {
        transformBookToUndo( target );
    } else {
        // TRIGGERS IF BUTTON WAS EDIT
        isEditingEntry = true;
        openDialog( target );
    };
    
};


// TRIGGERS WHEN DELETE IS PRESSED
// REMOVES BOOK INFO AND ALLOWS FOR UNDO
function transformBookToUndo(target){
    // REMOVE BOOK HTML
    target.classList.remove("shadow");
    let cover = target.querySelector(".cover");
    cover.textContent = '';
    cover.classList.remove("filled","outline-w");
    cover.classList.add("blank");
    cover.style.cssText="";
    target.querySelector(".title").remove();
    target.querySelector(".author").remove();
    target.querySelector(".pages").remove();
    
    // ADD UNDO HTML
    const divUndoWrapper = document.createElement("div");
    const btnUndo = document.createElement("button");
    const pUndo = document.createElement("p");
    const imgUndo = document.createElement("img");

    divUndoWrapper.classList.add("undo-wrapper");
    btnUndo.classList.add("undo");
    imgUndo.src = "images/undo.svg";
    pUndo.textContent="undo";
    btnUndo.appendChild(pUndo);
    btnUndo.appendChild(imgUndo);
    divUndoWrapper.appendChild(btnUndo);
    cover.appendChild(divUndoWrapper);

    // SAVE ID
    undoID = target.id.slice(2);
    // ADD EVENT LISTENER TO UNDO 
    btnUndo.addEventListener("click", undoDelete);
    // MOUSE LEAVING AREA WILL CONFIRM DELETE
    cover.addEventListener("mouseleave", confirmDelete);
}

// TRIGGERS WHEN MOUSE LEAVES UNDO AREA
function confirmDelete( e ) {
    let target = e.target.parentNode;

    // REMOVE DATA FROM DATABASE
    delete libraryDB[target.id.slice(2)];
    target.remove();
    updateSideBookInfo();
}

// TRIGGERS WHEN UNDO BUTTON IS CLICKED
// THIS REBUILDS THE HTML FOR AN EXISTING
// BOOK THAT WAS DELETED
function undoDelete() {
    // CREATEHTMLBOOK RETURNS THE DIV FOR THE BOOK
    // IT CAN BE IGNORED HERE BECAUSE IT WILL ATTEMPT
    // TO APPEND IT DO AN ALREADY EXISTING BOOK IF POSSIBLE
    // IN THIS CASE, THE UNDO HTML IS ENOUGH TO OVERWRITE
    let newHTML = createHtmlBook( libraryDB[undoID] );
    let target = document.querySelector("#id"+undoID);
    target.querySelector(".cover").remove();

    updateTinyButtonListeners();
    updateSideBookInfo();
};

// CREATES EITHER DELETE OR EDIT HTML
function createHtmlSmallButton( file ) {    
    // CREATES THE FOLLOWING HTML

    //          <div class="delete button-sm button-action">
    //              <img class="icon-sm" src="images/delete.svg" alt="">
    //          </div>

    const divIcon = document.createElement("div");
    const imgIcon = document.createElement("img");
    imgIcon.src = "images/" + file + ".svg";
    imgIcon.classList.add("icon-sm");

    divIcon.classList.add(file, "button-sm", "button-action");
    divIcon.appendChild(imgIcon);
    // RETURNS THE TOPMOST DIV
    return divIcon;
};


function getTextHTML( text, classAttributes ) {
    const element = document.createElement("div");

    classAttributes.forEach(el => {
        element.classList.add(el);
    });
    
    element.textContent = text;
    return element;
}

function createHtmlBook( bookDB ){
    // CREATES THE FOLLOWING HTML
    
    // <div class="book shadow" id="id0">
    //     <div class="cover filled">
    //         <div class="hidden">
    //             <div class="delete button-sm button-action"><img class="icon-sm" src="images/delete.svg" alt=""></div>
    //             <div class="edit button-sm button-action"><img class="icon-sm" src="images/edit.svg" alt=""></div>
    //         </div>
    //         <div class="icon-lg"><img class="check hidden" src="images/checkOutline.svg" alt=""></div>
    //     </div>
    //     <div class="text-md title">The Book of Three</div>
    //     <div class="text-sm author">By Lloyd Alexander</div>
    //     <div class="text-sm text-sub pages">514 pages</div>
    // </div>

    // CHECK IF THE BOOK ALREADY EXISTS
    // IF IT EXISTS, WE WILL APPEND ALL THE NEW
    // HTML TO THE EXISTING DIV
    let searchID = "#id" + bookDB.id;
    let book = document.querySelector(searchID);
    console.log( `searching for ${searchID}`);

    if(book) {
        // ALREADY EXISTS
        console.log("already exists!");
    } else {
        // IT DOES NOT EXIST, CREATE THE NEW ELEMENT
        console.log("create from scratch please");
        book = document.createElement("div");
    };

    // CREATES HTML AND ADDS CSS CLASSES
    book.classList.add("book", "shadow");
    book.id = "id" + bookDB.id;
    const cover = document.createElement("div");
    cover.classList.add("cover", "filled", "outline-w");

    const upperIcons = document.createElement("div");
    upperIcons.classList.add("hidden");

    const iconDelete = createHtmlSmallButton("delete");
    const iconEdit = createHtmlSmallButton("edit", "button-sm", "button-action");
    upperIcons.appendChild(iconDelete);
    upperIcons.appendChild(iconEdit);

    cover.appendChild(upperIcons);

    const imgCheck = document.createElement("img");
    imgCheck.classList.add("check", "hidden");
    let cImg = checkImgFile[1];
    if (bookDB.isRead) {
        cImg = checkImgFile[0];
        imgCheck.classList.remove("hidden");
    }    
    imgCheck.src = cImg;
    
    const checkIcon = document.createElement("div");
    checkIcon.classList.add("icon-lg");
    checkIcon.appendChild(imgCheck);


    // POPULATE THE TEXT
    const textTitle = getTextHTML(bookDB.title, ["text-md", "title"] );
    const textAuthor = getTextHTML(bookDB.author, ["text-sm", "author"] );
    const textPage = getTextHTML(bookDB.pages, ["text-sm", "text-sub", "pages"] );
    
    // MAKE SURE PAGES ACTUALLY HAS DATA
    if ( parseInt(bookDB.pages).toString() == bookDB.pages ) {
        textPage.textContent = bookDB.pages + " pages";
    } else {
        textPage.textContent = "";
    }
    
    cover.style.cssText = bookDB.style;
    cover.appendChild(checkIcon);
    book.appendChild(cover);    
    book.append(textTitle);
    book.append(textAuthor);
    book.append(textPage);
    // RETURN THE DIV OF THE BOOK HTML
    return book;
}