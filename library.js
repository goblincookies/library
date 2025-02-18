// GLOBAL VAR
const libraryDB = new Database();
const gradientGen = new GradientGenerator();
const checkImgFile = [ "images/checkFill.svg", "images/checkOutline.svg"];
// GLOBAL VAR

const dialogManager = ( function () {
    let editID = -1;

    const dialog = document.querySelector("#dialog");
    const dialogTitle = document.querySelector('#title');
    const dialogAuthor = document.querySelector('#author');
    const dialogPages = document.querySelector('#page');
    const dialogIsRead = document.querySelector('#isRead');
    const divCheck = document.querySelector('#isReadCheck');
    const dialogCover = document.querySelector('#dialog-cover');

    const editingID = function (val) { editID = val };

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

    const open = function() {

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

    const save = function() {
        if (dialogValidityCheck() ) {

            let book = inputToBook();
            libraryDB.writeBook(book);
            console.log(book);
            updateHTML( book );

            close();
        }
    };

    const close = function() {
        editID = -1;
        updateSideBookInfo();
        dialog.close();
    };
    const escape = function() {
        editID = -1;
        updateSideBookInfo();
    };

    const isRead= function() {
        // UPDATE THE BIG CHECK MARK TO MATCH THE IS-READ CHECKED STATE
        let checkImg = divCheck.querySelector("img");    
        checkImg.src = dialogIsRead.checked ? checkImgFile[0] : checkImgFile[1];
    };

    const checkImg = function() {
        dialogIsRead.checked = !dialogIsRead.checked;
        isRead();
    };
    const gradient = function() {
        dialogCover.classList.remove("filled");
        dialogCover.style.removeProperty("background");
        dialogCover.style.cssText = gradientGen.getNewStyleAsString();
    };

    return { open, save, close, isRead, checkImg, gradient, editingID, escape }
})();


function setup() {
    // WRITE A PLACEHOLDER BOOK WHEN FIRST LOADED
    let book = new Book();
    book.style = gradientGen.getNewStyleAsString();
    libraryDB.writeBook( book )
    updateHTML( book );

    listenersCreate();

};

function listenersUpdate() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
    document.querySelectorAll(".check").forEach(chk => chk.addEventListener("click", checkToggle));
};

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



function bttnClick(e) {
    let target = e.currentTarget;

    while(target.id == '') {
        target = target.parentNode;
    };

    if(e.currentTarget.classList.contains("delete")) {
        // transformBookToUndo( target );
    } else {
        // TRIGGERS IF BUTTON WAS EDIT
        console.log(`editing ${target.id}`);
        dialogManager.editingID( target.id);
        dialogManager.open();
        // isEditingEntry = true;
        // openDialog( target );
    };
};

function checkToggle( e ) {
    let target = e.currentTarget;

    while(target.id == '') {
        target = target.parentNode;
    };
    
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

function createHTML( type, classes) {
    let element = document.createElement( type );
    for(const el of classes) {
        element.classList.add( el);
    };
    return element;
};
function updateHTML( book ) {

    if (document.getElementById(book.id)) {

        // EDITING!
        console.log("editing!");
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