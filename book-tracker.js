// const addBook = document.querySelector('#addBook');
// const dialogClose = document.querySelector('#close');
// const dialogSave = document.querySelector('#save');
let colorsAll = [ "#000000","#7c7c7c","#bcbcbc","#0000fc","#0078f8",
    "#3cbcfc","#a4e4fc","#0000bc","#0058f8","#6888fc","#b8b8f8","#4428bc",
    "#6844fc","#9878f8","#d8b8f8","#940084","#d800cc","#f878f8","#f8b8f8",
    "#a80020","#e40058","#f85898","#f8a4c0","#a81000","#f83800","#f87858",
    "#f0d0b0","#881400","#e45c10","#fca044","#fce0a8","#503000","#ac7c00",
    "#f8b800","#f8d878","#007800","#00b800","#b8f818","#d8f878","#006800",
    "#00a800","#58d854","#b8f8b8","#005800","#00a844","#58f898","#b8f8d8",
    "#004058","#008888","#00e8d8","#00fcfc","#f8d8f8","#787878"];

let darkColors = [ "#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b",
    "#4d908e","#577590","#277da1","#471ca8","#884ab2","#ff930a","#f24b04","#d1105a"];
let lightColors = ["#fbf8cc","#fde4cf","#ffcfd2","#f1c0e8","#cfbaf0","#a3c4f3",
    "#90dbf4","#8eecf5","#98f5e1","#b9fbc0"];

const content = document.querySelector('#content');
const dialog = document.querySelector("#dialog");

const totalBooks = document.querySelector('#totalBooks');
const percentRead = document.querySelector('#percentRead');

const dialogTitle = document.querySelector('#title');
const dialogAuthor = document.querySelector('#author');
const dialogPages = document.querySelector('#pages');
const dialogIsRead = document.querySelector('#isRead');
const dialogIsReadCheck = document.querySelector('#isReadCheck');

const dialogCover = document.querySelector('#dialog-cover');
const checkImgFile = [ "images/checkFill.svg", "images/checkOutline.svg"];


function book(id, title, author, pages, isRead, style) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.pages=pages;
    this.isRead = isRead;
    this.style = style;
};

let serialID = 0;
let undoID = 0;
let isEditingEntry = false;
let editingEntryNum = "0";
let libraryDB = {}; // [id]:b1 };



setup();

function setup() {
    // console.log("is editing entry:", isEditingEntry);

    // let id = bookCount.toString();
    // let b1 = new book(id, "The Book of Three", "Lloyd Alexander", "514", false );
    // libraryDB[id] = b1;

    let useDialog = false;
    editingEntryNum = addLibraryEntry(useDialog);
    addBookToPage(editingEntryNum);


    updateTinyButtonListeners();
    document.querySelector('#addBook').addEventListener("click", openDialog );
    document.querySelector('#save').addEventListener("click", dialogSaveClick );
    document.querySelector('#close').addEventListener("click", dialogCloseClick );
    document.querySelector('#isRead').addEventListener("click", dialogIsReadClick);
    document.querySelector('#isReadCheck').addEventListener("click", dialogImgCheckClick);

    document.querySelector('#gen-new-cover').addEventListener("click", dialogGenerateNewCover);
    increaseBooks();
    calcReadPercent();
}

function increaseBooks(){
    // bookCount+=1;
    totalBooks.textContent = Object.keys(libraryDB).length;
    // console.log(bookCount, Object.keys(libraryDB).length);
    calcReadPercent();

};
function decreaseBooks(){
    totalBooks.textContent = Object.keys(libraryDB).length;
    // bookCount-= 1;
    // if(bookCount<0) {
    //     bookCount=0;
    // };
    calcReadPercent();
    // console.log(bookCount, Object.keys(libraryDB).length);
    
}
function calcReadPercent() {
    let readCount = 0;

    for (const [key, value] of Object.entries(libraryDB)) {
        console.log(key, value);
        if (libraryDB[key].isRead) {
            readCount += 1;
        }
    }
    if (readCount > 0 ) {
        percentRead.textContent = Math.floor((readCount/Object.keys(libraryDB).length)*100) + "%";
    } else {
        percentRead.textContent = "0%";
    }
}

function dialogGenerateNewCover( e ) {
    console.log("generating a new cover");
    dialogCover.classList.remove("filled");
    dialogCover.style.removeProperty("background");
    dialogCover.style.cssText = generateNewGradient();
}

function generateNewGradient() {
    let newColors = [];
    let gradDeg = 45;

    newColors.push(lightColors[ Math.floor(Math.random()*lightColors.length)]);
    newColors.push(darkColors[ Math.floor(Math.random()*darkColors.length)]);

    // let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${newColors[0]} 0%, ${newColors[1]} 100%);`;
    let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${newColors[0]} 0%, ${newColors[1]} 100%);`;

    console.log(linearGrad);
    // return linearGrad.toString();
    return linearGrad.toString();
}

function dialogCloseClick() {
    isEditingEntry = false;
    console.log("closing");
    dialog.close();
}

function openDialog( target ) {
    
    console.log("opening dialog");
    console.log("editing entry:",isEditingEntry);
    console.log(target);

    if (isEditingEntry) {
        editingEntryNum = target.id.slice(2);
        // populate dialog with data
        let bookDB = libraryDB[editingEntryNum];
        dialogTitle.value = bookDB.title;
        dialogAuthor.value = bookDB.author;
        dialogPages.value = bookDB.pages;
        dialogIsRead.checked = bookDB.isRead;

        let divCheck = document.querySelector("#isReadCheck");
        let imgCheck = divCheck.querySelector("img");
        imgCheck.src = bookDB.isRead ? checkImgFile[0] : checkImgFile[1];

        dialogCover.style.cssText = bookDB.style;

    } else {
        dialogCover.style.cssText = generateNewGradient();
        dialogTitle.value = "";
        dialogAuthor.value = "";
        dialogPages.value = "";
        dialogIsRead.value = false;
    }
    dialog.showModal();
}
function dialogValidityCheck() {

    // check if page is number
    let isValidTitle = false;
    let isValidAuthor = false;
    let isValidPages = false;

    if (dialogTitle.value.replace(/\s/g, '').length > 0 ) {isValidTitle = true;}
    if (dialogAuthor.value.replace(/\s/g, '').length > 0 ) {isValidAuthor = true;}
    if (parseInt(dialogPages.value).toString() == dialogPages.value) {isValidPages = true; };

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
function dialogSaveClick() {

    if( dialogValidityCheck() ) {
        if(isEditingEntry) {
            // update entry
            updateLibraryEntryFromDialog(editingEntryNum);
            // update HTML
            updateHTML(editingEntryNum );
        } else {
            // add entry
            let useDialog = true;
            editingEntryNum = addLibraryEntry(useDialog);
            // write new HTML
            addBookToPage(editingEntryNum);
            // increaseBooks();
        }
    
        console.log("saving the book")
        dialogCloseClick();
        calcReadPercent();
    }    
}
function dialogImgCheckClick() {
    dialogIsRead.checked = ! dialogIsRead.checked;
    dialogIsReadClick();
}

function dialogIsReadClick() {
    
    // if its the img, manually toggle things

    console.log("toggled Read Checkbox", dialogIsRead.checked);
    let divCheck = document.querySelector("#isReadCheck");
    let imgCheck = divCheck.querySelector("img");
    
    imgCheck.src = dialogIsRead.checked ? checkImgFile[0] : checkImgFile[1];

}

function addLibraryEntry(useDialog) {
    serialID+=1;
    let id = serialID.toString();
    let b = new book;
    // libraryDB = { [id]:b };
    libraryDB[id] = b;
    // bookCount+=1;
    increaseBooks();

    if (useDialog){
        updateLibraryEntryFromDialog(id)
    } else {
        b.id = id;
        b.title = "The Book of Three";
        b.author = "Lloyd Alexander";
        b.pages = "514";
        b.isRead = false;
        b.style = generateNewGradient();
    }
    return id;
}

function updateLibraryEntryFromDialog( id ) {
    let bookDB = libraryDB[id];
    bookDB.id = id;
    bookDB.title = dialogTitle.value;
    bookDB.author = dialogAuthor.value;
    bookDB.pages = dialogPages.value;
    bookDB.isRead = dialogIsRead.checked;
    bookDB.style = dialogCover.style.cssText;
    // console.log(dialogIsRead.checked);
}

function updateHTML(id) {
    let bookHTML = document.querySelector("#id"+editingEntryNum);
    let bookDB = libraryDB[id];

    bookHTML.querySelector(".title").textContent = bookDB.title;
    bookHTML.querySelector(".author").textContent = bookDB.author;
    console.log("book length! " + bookDB.pages.length);

    if (parseInt(bookDB.pages).toString() == bookDB.pages ) {
        bookHTML.querySelector(".pages").textContent = bookDB.pages + " pages";
    } else {
        bookHTML.querySelector(".pages").textContent = "";
    }

    let divCover = bookHTML.querySelector(".cover")
    divCover.style.cssText = bookDB.style;


    let imgCheck = bookHTML.querySelector(".check");
    if (bookDB.isRead){
        imgCheck.src = checkImgFile[0];
        imgCheck.classList.remove("hidden");
    } else {
        imgCheck.src = checkImgFile[1];
        imgCheck.classList.add("hidden");
    }
}

function addBookToPage ( id ) {
    // get html
    // add to DOM
    let bookDB = libraryDB[id];
    content.append( createHtmlBook( bookDB ) );
    // bTitle, bAuthor, bPages, bRead, cColors
    updateTinyButtonListeners();
}

function updateTinyButtonListeners() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
    document.querySelectorAll(".check").forEach(chk => chk.addEventListener("click", checkToggle));
}
function checkToggle(e) {
    let target = e.target;
    console.log("clicked on: ", target);

    while(target.id == '') {
        target = target.parentNode;
    }

    let id = target.id.slice(2);
    libraryDB[id].isRead = !libraryDB[id].isRead;

    if (libraryDB[id].isRead) {
        e.target.classList.remove("hidden");
        e.target.src = checkImgFile[0];
    }else {
        e.target.classList.add("hidden");
        e.target.src = checkImgFile[1];
    }

    calcReadPercent();
};
function bttnClick(e) {
    // console.log(e.target);
    let target = e.target;

    while(target.id == '') {
        target = target.parentNode;
        // console.log(target);
    }
    
    // for (let i = 0; i < 4; i++) {
    //     target = target.parentNode;
    // }

    if(e.target.parentNode.classList.contains("delete")) {
        // console.log(target);
        // delete libraryDB[target.id.slice(2)];
        decreaseBooks();

        transformBookToUndo( target );

        // target.remove();

        // ADD UNDO ELEMENT

    } else {
        isEditingEntry = true;
        openDialog( target );
    }
    
}
function transformBookToUndo(target){
    target.classList.remove("shadow");
    let cover = target.querySelector(".cover");
    cover.textContent = '';
    cover.classList.remove("filled","outline-w");
    cover.classList.add("blank");
    cover.style.cssText="";
    target.querySelector(".title").remove();
    target.querySelector(".author").remove();
    target.querySelector(".pages").remove();

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

    undoID = target.id.slice(2);
    btnUndo.addEventListener("click", undoDelete);
    cover.addEventListener("mouseleave", confirmDelete);
    // 
    // 
    // 
}
function confirmDelete( e ) {
    console.log("delete it all!");
    let target = e.target.parentNode;
    delete libraryDB[target.id.slice(2)];
    target.remove();
    decreaseBooks();
}

function undoDelete() {

    // console.log(target);
    console.log("whoops, undo that");
    console.log(`let's bring back ${undoID} to the page!`);
    // console.log(target.id.slice(2));
    

    let newHTML = createHtmlBook( libraryDB[undoID] );
    let target = document.querySelector("#id"+undoID);
    target.querySelector(".cover").remove();

    updateTinyButtonListeners();
    increaseBooks();

}

function createHtmlSmallButton( file ) {
    // CHECK IF FILE IS APPROVED
    // ADD CHECKFILL CHECKOUTLINE CLOSE DELETE EDIT

    //          <div class="delete button-sm button-action">
    //              <img class="icon-sm" src="images/delete.svg" alt="">
    //          </div>

    const divIcon = document.createElement("div");
    const imgIcon = document.createElement("img");
    imgIcon.src = "images/" + file + ".svg";
    imgIcon.classList.add("icon-sm");

    divIcon.classList.add(file, "button-sm", "button-action");
    divIcon.appendChild(imgIcon);
    return divIcon;
}

function getTextHTML( text, classAttributes ) {
    const element = document.createElement("div");

    classAttributes.forEach(el => {
        element.classList.add(el);
    });
    
    element.textContent = text;
    return element;
}

function createHtmlBook( bookDB ){
    // NEW NEW NEW NEW
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

    
    let searchID = "#id" + bookDB.id;
    let book = document.querySelector(searchID);
    console.log( `searching for ${searchID}`);

    if(book) {
        console.log("already exists!");
        book
    } else {
        console.log("create from scratch please");
        book = document.createElement("div");
    }



    book.classList.add("book", "shadow");
    book.id = "id" + bookDB.id;
    const cover = document.createElement("div");
    cover.classList.add("cover", "filled", "outline-w");
    

    const upperIcons = document.createElement("div");
    upperIcons.classList.add("hidden");

    const iconDelete = createHtmlSmallButton("delete"); //, "button-sm", "button-action");
    const iconEdit = createHtmlSmallButton("edit", "button-sm", "button-action");
    upperIcons.appendChild(iconDelete);
    upperIcons.appendChild(iconEdit);

    cover.appendChild(upperIcons);

    const imgCheck = document.createElement("img");
    imgCheck.classList.add("check", "hidden");
    let cImg = checkImgFile[1];
    // let checkType = "checkOutline";
    // console.log(b)
    if (bookDB.isRead) {
        cImg = checkImgFile[0];
        imgCheck.classList.remove("hidden");
    }    
    imgCheck.src = cImg;
    
    const checkIcon = document.createElement("div");
    checkIcon.classList.add("icon-lg");
    checkIcon.appendChild(imgCheck);


    // const iconCheck = createHtmlSmallButton(checkType, "icon-lg");
    const textTitle = getTextHTML(bookDB.title, ["text-md", "title"] );
    const textAuthor = getTextHTML(bookDB.author, ["text-sm", "author"] );
    const textPage = getTextHTML(bookDB.pages, ["text-sm", "text-sub", "pages"] );
    
    if ( parseInt(bookDB.pages).toString() == bookDB.pages ) {
        textPage.textContent = bookDB.pages + " pages";
    } else {
        textPage.textContent = "";
    }
    // textPage.textContent = textPage.textContent + " pages";
    
    cover.style.cssText = bookDB.style;
    cover.appendChild(checkIcon);
    book.appendChild(cover);    
    book.append(textTitle);
    book.append(textAuthor);
    book.append(textPage);
    return book;
}