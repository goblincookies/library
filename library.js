// GLOBAL VAR
const libraryDB = new Database();
const gradientGen = new GradientGenerator();
const checkImgFile = [ "images/checkFill.svg", "images/checkOutline.svg"];

// MANAGES THE DIALOG POPUP FOR INPUTING DATA
const dialogManager = ( function () {
    let editID = -1;

    const dialog = document.querySelector("#dialog");
    const dialogTitle = document.querySelector('#title');
    const dialogAuthor = document.querySelector('#author');
    const dialogPages = document.querySelector('#page');
    const dialogIsRead = document.querySelector('#isRead');
    const divCheck = document.querySelector('#isReadCheck');
    const dialogCover = document.querySelector('#dialog-cover');

    // RECORDS THE ID THAT IS BEING EDITED
    const editingID = function (val) { editID = val };

    // CONFORMS THE DIALOG INPUT FIELDS INTO A BOOK OBJECT
    const inputToBook = function() {
        let book = new Book();
        
        book.recordInfo(
            dialogTitle.value,
            dialogAuthor.value,
            dialogPages.value,
            dialogIsRead.checked
        );
        book.style = dialogCover.style.cssText;
        book.id = editID;
        return book;
    };

    // NAIVE FORM CHECK SINCE THIS DOES NOT ACCESS
    // A REAL DATABASE WITH BOOKS TO CROSS-REFERENCE,
    // IT ONLY CHECKS THAT ALL INPUT FIELDS HAVE DATA
    const dialogValidityCheck = function() {
        let isValidTitle = false;
        let isValidAuthor = false;
        let isValidPages = false;
        
        // REMOVES SPACES, AND THEN CHECKS THAT IT'S AT LEAST 1 DIGIT LONG
        if (dialogTitle.value.replace(/\s/g, '').length > 0 ) {isValidTitle = true;}
        if (dialogAuthor.value.replace(/\s/g, '').length > 0 ) {isValidAuthor = true;}
        // CHECK IF PAGE IS A NUMBER
        if (parseInt(dialogPages.value).toString() == dialogPages.value) {isValidPages = true; };

        passFailVisuals( isValidTitle, "title");
        passFailVisuals( isValidAuthor, "author");
        passFailVisuals( isValidPages, "page");

        return (isValidTitle && isValidAuthor && isValidPages);
    };

    // UPDATES THE VISUAL HTML/CSS FOR THE INPUT FIELDS
    const passFailVisuals = function( boolcheck, field ) {

        let label = document.querySelector("#" + field + "Label" );
        let inputBox = document.querySelector("#" + field)
        
        if(boolcheck) {
            inputBox.classList.remove("error");
            // label.querySelector("span").remove()
            label.textContent = field.charAt(0).toUpperCase() + field.slice(1);
        } else {
            // PAGE DATA NOT VALID
            let spanError = document.createElement("span");
            spanError.classList.add("required");
            spanError.textContent = (field == "page") ? "*number*" : "*required*";
            label.textContent = field.charAt(0).toUpperCase() + field.slice(1);

            // label.textContent = text;
            label.appendChild(spanError);
            inputBox.classList.add("error");
        };
    };

    // TRIGGERS WHEN THE USER CLICKS THE (+) RECTANGLE
    // OPENS THE DIALOG AND POPULATES THE INPUT FIELDS
    const open = function() {
        // THE DATABASE WILL RETURN THE BOOK INFORMATION IF IT'S BEEN
        // RECORDED, OTHERWISE THE DATA WILL BE EMPTY STRINGS.
        let book = libraryDB.getBook( editID );
        dialogCover.style.cssText = book.style;
        dialogTitle.value = book.title;
        dialogAuthor.value = book.author;
        dialogPages.value = book.pages;
        dialogIsRead.checked = book.isRead;

        let imgCheck = divCheck.querySelector("img");
        imgCheck.src = book.isRead ? checkImgFile[0] : checkImgFile[1];

        dialog.showModal();
    };

    // TRIGGERS WHEN THE USER CLICKS 'SAVE'
    const save = function() {
        // CHECKS IF THE INFO IS APPROPRIATE
        if (dialogValidityCheck() ) {
            // CREATE A BOOK OBJECT
            let book = inputToBook();
            // UPDATE THE DATABASE
            libraryDB.writeBook(book);
            // UPDATE THE HTML
            updateHTML( book );
            // CLOSE THE DIALOG
            close();
        };
    };

    // CLOSE THE DIALOG WINDOW
    // THIS DOES NOT SAVE ANYTHING
    const close = function() {
        editID = -1;
        updateSideBookInfo();
        dialog.close();
    };

    // DIALOG IS CLOSED WITH ESCAPE BUTTON
    const escape = function() {
        editID = -1;
        updateSideBookInfo();
    };

    // TRIGGERS WHEN THE IS-READ TOGGLE IS CHECKED (DIALOG ONLY)
    const isRead = function() {
        // UPDATE THE BIG CHECK MARK TO MATCH THE IS-READ CHECKED STATE
        let checkImg = divCheck.querySelector("img");    
        checkImg.src = dialogIsRead.checked ? checkImgFile[0] : checkImgFile[1];
    };

    // TRIGGERS WHEN THE CHECK MARK IS CLICKED (DIALOG ONLY)
    const checkImg = function() {
        dialogIsRead.checked = !dialogIsRead.checked;
        isRead();
    };

    // GENERATE AND APPLY A NEW GRADIENT
    const gradient = function() {
        dialogCover.classList.remove("filled");
        dialogCover.style.removeProperty("background");
        dialogCover.style.cssText = gradientGen.getNewStyleAsString();
    };

    return { open, save, close, isRead, checkImg, gradient, editingID, escape }
})();

// RUNS WHEN FIRST LOADED
function setup() {
    // WRITE A PLACEHOLDER BOOK WHEN FIRST LOADED
    let book = new Book();
    book.style = gradientGen.getNewStyleAsString();
    libraryDB.writeBook( book )
    updateHTML( book );

    listenersCreate();

};

// UPDATES ANY LISTENERS
function listenersUpdate() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
    document.querySelectorAll(".check").forEach(chk => chk.addEventListener("click", checkToggle));
};

// CREATE INITIAL LISTENERS
function listenersCreate() {

    document.querySelector('#addBook').addEventListener("click", dialogManager.open );
    document.querySelector('#save').addEventListener("click", dialogManager.save );
    document.querySelector('#close').addEventListener("click", dialogManager.close );
    document.querySelector('#isRead').addEventListener("click", dialogManager.isRead);
    document.querySelector('#isReadCheck').addEventListener("click", dialogManager.checkImg);
    document.querySelector('#gen-new-cover').addEventListener("click", dialogManager.gradient);
    
    // ESCAPE CAN BE USED TO CLOSE THE DIALOG WINDOW
    // THIS TRACKS THE ACTION
    dialog.addEventListener("keydown", (e) => { if(e.key == "Escape") { dialogManager.escape() } } );
    updateSideBookInfo();
};

// TRIGGERS WHEN DELETE/EDIT IS CLICKED (LIBRARY VIEW ONLY)
function bttnClick(e) {
    // TARGET THAT WILL BE REASSIGNED
    let target = e.currentTarget;

    // TRAVEL UP THE DOM UNTIL FIRST INSTANCE OF DIV WITH AN ID
    // ONLY BOOKS SHOULD HAVE ID'S
    while(target.id == '') {
        target = target.parentNode;
    };

    // TRIGGERS IF BUTTON WAS DELETE
    if(e.currentTarget.classList.contains("delete")) {
        transformBookToUndo( target );
    } else {
        // TRIGGERS IF BUTTON WAS EDIT
        console.log(`editing ${target.id}`);
        dialogManager.editingID( target.id);
        dialogManager.open();
    };
};

// TRIGGERS WHEN ANY CHECK MARK IS CLICKED (LIBRARY VIEW ONLY)
function checkToggle( e ) {
    // TARGET THAT WILL BE REASSIGNED
    let target = e.currentTarget;

    // TRAVEL UP THE DOM UNTIL FIRST INSTANCE OF DIV WITH AN ID
    // ONLY BOOKS SHOULD HAVE ID'S
    while(target.id == '') {
        target = target.parentNode;
    };
    
    // UPDATE THE DATABASE TO MATCH THE NEW IS-READ STATUS
    let book = libraryDB.getBook(target.id);
    book.isRead = !book.isRead;
    libraryDB.writeBook(book);

    // VISUALLY MATCHES CHECK MARK TO DATA
    if (book.isRead) {
        e.currentTarget.classList.remove("hidden");
        e.currentTarget.src = checkImgFile[0];
    }else {
        e.currentTarget.classList.add("hidden");
        e.currentTarget.src = checkImgFile[1];
    };

    updateSideBookInfo();
};

// VISUALLY UPDATE THE BOOK COUNT
function updateSideBookInfo(){
    let count = libraryDB.count();
    let readCount = libraryDB.readCount();
    // SET BOOK TOTAL TO THE LIBRARY DATABASE SIZE
    document.querySelector('#totalBooks').textContent = count;

    // RECALCULATE THE READ PERCENTAGE


    // WRITE PERCENTAGE TO SCREEN
    const percentRead = document.querySelector('#percentRead');
    percentRead.textContent = readCount > 0 ? Math.floor((readCount/count)*100) + "%" : "0%";
};

// SIMPLE HELPER TO CREATE AN ELEMENT AND ASSIGN AN ARRAY OF CLASSES
function createHTML( type, classes) {
    let element = document.createElement( type );
    for(const el of classes) {
        element.classList.add( el);
    };
    return element;
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
    target.querySelector(".page").remove();
    
    // ADD UNDO HTML
    const undoWrapperDiv = createHTML("div", ["undo-wrapper"]);
    // const divUndoWrapper = document.createElement("div");
    const undoButton = createHTML("button", ["undo"]);
    // const btnUndo = document.createElement("button");

    const undoP = document.createElement("p");
    undoP.textContent="undo";
    const undoImg = document.createElement("img");

    // divUndoWrapper.classList.add("undo-wrapper");
    undoButton.classList.add("undo");
    undoImg.src = "images/undo.svg";
    undoButton.appendChild(undoP);
    undoButton.appendChild(undoImg);
    undoWrapperDiv.appendChild(undoButton);
    cover.appendChild(undoWrapperDiv);

    // SAVE ID
    libraryDB.undoID = target.id;
    // ADD EVENT LISTENER TO UNDO 
    undoButton.addEventListener("click", undoDelete);
    // MOUSE LEAVING AREA WILL CONFIRM DELETE
    cover.addEventListener("mouseleave", confirmDelete);
};

// TRIGGERS WHEN MOUSE LEAVES UNDO AREA
function confirmDelete( e ) {
    let target = e.currentTarget.parentNode;

    // REMOVE DATA FROM DATABASE
    libraryDB.deleteEntry( target.id );
    target.remove();
    updateSideBookInfo();
};

// TRIGGERS WHEN UNDO BUTTON IS CLICKED
// THIS REBUILDS THE HTML FOR AN EXISTING
// BOOK THAT WAS DELETED
function undoDelete() {
    // CREATEHTMLBOOK RETURNS THE DIV FOR THE BOOK
    // IT CAN BE IGNORED HERE BECAUSE IT WILL ATTEMPT
    // TO APPEND IT DO AN ALREADY EXISTING BOOK IF POSSIBLE
    // IN THIS CASE, THE UNDO HTML IS ENOUGH TO OVERWRITE
    let newHTML = createHtml_Book( libraryDB.getUndoBook() );
    let target = document.getElementById( libraryDB.undoID );
    target.querySelector(".cover").remove();

    listenersUpdate();
    updateSideBookInfo();
};

// CALLED WHEN ADDING A NEW BOOK
// OR MODIFYING AN EXISTING BOOK
function updateHTML( book ) {

    if (document.getElementById(book.id)) {
        // EDITING A BOOK!
        let bookHTML = document.getElementById(book.id);
        bookHTML.querySelector(".title").textContent = book.title;
        bookHTML.querySelector(".author").textContent = book.author;
        bookHTML.querySelector(".page").textContent = book.pages + " pages";
        bookHTML.querySelector(".cover").style.cssText = book.style;

        // VISUALLY UPDATE CHECK MARK BASED ON IS-READ
        let checkImg = bookHTML.querySelector(".check");

        if (book.isRead){
            checkImg.src = checkImgFile[0];
            checkImg.classList.remove("hidden");
        } else {
            checkImg.src = checkImgFile[1];
            checkImg.classList.add("hidden");
        };

    } else {
        // add to page
        document.querySelector('#content').append( createHtml_Book( book ) );
    };

    listenersUpdate();
};

// CREATES THE BOOK HTML
function createHtml_Book( book ){
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
    console.log( `searching for ${book.id}`);
    let bookDiv = document.getElementById(book.id.toString());

    // CHECK IF IT EXISTS
    bookDiv = (bookDiv) ? bookDiv : document.createElement("div");

    // CREATES HTML AND ADDS CSS CLASSES
    bookDiv.classList.add("book", "shadow");
    bookDiv.id = book.id;

    const coverDiv = createHTML("div", ["cover", "filled", "outline-w"]);
    const upperIconsDiv = createHTML("div", ["hidden"]);
    

    const deleteDiv = createHTML("div", ["delete", "button-sm", "button-action"]);
    const deleteImg = createHTML("img", ["icon-sm"]);
    deleteImg.src = "images/delete.svg";
    deleteDiv.appendChild(deleteImg);

    const editDiv = createHTML("div", ["button-sm", "button-action"]);
    const editImg = createHTML("img", ["icon-sm"]);
    editImg.src = "images/edit.svg";
    editDiv.appendChild(editImg);

    upperIconsDiv.appendChild(deleteDiv);
    upperIconsDiv.appendChild(editDiv);

    coverDiv.appendChild(upperIconsDiv);

    const checkImg = createHTML("img", ["check", "hidden"]);

    checkImg.src = book.isRead ? checkImgFile[0] : checkImgFile[1];
    if (book.isRead) { checkImg.classList.remove("hidden"); }

    const checkDiv = createHTML("div", ["icon-lg"]);
    checkDiv.appendChild( checkImg );

    // POPULATE THE TEXT
    const titleDiv = createHTML("div", ["text-md", "title"] );
    titleDiv.textContent = book.title;
    const authorDiv = createHTML("div", ["text-sm", "author"] );
    authorDiv.textContent = book.author;
    const pageDiv = createHTML("div", ["text-sm", "text-sub", "page"]);

    // MAKE SURE PAGES ACTUALLY HAS DATA
    if ( parseInt(book.pages).toString() == book.pages ) {
        pageDiv.textContent = book.pages + " pages";
    } else {
        pageDiv.textContent = "";
    };
    
    coverDiv.style.cssText = book.style;
    coverDiv.appendChild(checkDiv);
    bookDiv.appendChild(coverDiv);    
    bookDiv.append(titleDiv);
    bookDiv.append(authorDiv);
    bookDiv.append(pageDiv);

    // RETURN THE DIV OF THE BOOK HTML
    return bookDiv;
};

setup();