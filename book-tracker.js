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
const content = document.querySelector('#content');
const dialog = document.querySelector("#dialog");

const totalBooks = document.querySelector('#totalBooks');
const percentRead = document.querySelector('#percentRead');

const dialogTitle = document.querySelector('#title');
const dialogAuthor = document.querySelector('#author');
const dialogPages = document.querySelector('#pages');
const dialogIsRead = document.querySelector('#isRead');
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
// let bookCount = 0;
// let readCount = 0;
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
    document.querySelector('#gen-new-cover').addEventListener("click", dialogGenerateNewCover);
    increaseBooks();

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
    let gradDeg = Math.floor(Math.random()*360);
    for (let i = 0; i < 2; i++) {
        newColors.push(colorsAll[ Math.floor(Math.random()*colorsAll.length)]);        
    }
    // let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${newColors[0]} 0%, ${newColors[1]} 45%, ${newColors[2]} 100%);`;
    let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${newColors[0]} 0%, ${newColors[1]} 100%);`;

    console.log(linearGrad);
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
        dialogIsRead.value = bookDB.isRead;
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

function dialogSaveClick() {

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
}

function dialogIsReadClick() {    
    console.log("toggled Read Checkbox", dialogIsRead.checked);
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
    bookHTML.querySelector(".pages").textContent = bookDB.pages + " pages";
    let divCover = bookHTML.querySelector(".cover")
    divCover.style.cssText = bookDB.style;

    let cImg = checkImgFile[1];
    if (bookDB.isRead){
        cImg = checkImgFile[0];
    };

    bookHTML.querySelector(".check").src = cImg;

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
    for (let i = 0; i < 3; i++) {
        target = target.parentNode;
    }
    let id = target.id.slice(2);
    
    console.log(libraryDB[id].isRead);

    if (libraryDB[id].isRead) {
        libraryDB[id].isRead = false;
        e.target.src = checkImgFile[1];
        e.target.classList.add("hidden");
    }else {
        libraryDB[id].isRead = true;
        e.target.src = checkImgFile[0];
        e.target.classList.remove("hidden");

    }
};
function bttnClick(e) {
    console.log(e);
    let target = e.target;
    for (let i = 0; i < 4; i++) {
        target = target.parentNode;
    }

    if(e.target.parentNode.classList.contains("delete")) {
        // console.log(target);
        delete libraryDB[target.id.slice(2)]
        target.remove();
        decreaseBooks();
    } else {
        isEditingEntry = true;
        openDialog( target );
    }
    
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



    const book = document.createElement("div");
    book.classList.add("book", "shadow");
    book.id = "id" + bookDB.id;
    const cover = document.createElement("div");
    cover.classList.add("cover", "filled", "outline-w");
    

    const upperIcons = document.createElement("div");
    upperIcons.classList.add("upper-icons");

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
    }    
    imgCheck.src = cImg;
    
    const checkIcon = document.createElement("div");
    checkIcon.classList.add("icon-lg");
    checkIcon.appendChild(imgCheck);


    // const iconCheck = createHtmlSmallButton(checkType, "icon-lg");
    const textTitle = getTextHTML(bookDB.title, ["text-md", "title"] );
    const textAuthor = getTextHTML(bookDB.author, ["text-sm", "author"] );
    const textPage = getTextHTML(bookDB.pages, ["text-sm", "text-sub", "pages"] );
    textPage.textContent = textPage.textContent + " pages";
    
    cover.style.cssText = bookDB.style;
    cover.appendChild(checkIcon);
    book.appendChild(cover);    
    book.append(textTitle);
    book.append(textAuthor);
    book.append(textPage);
    return book;
}