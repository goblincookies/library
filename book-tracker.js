const addBook = document.querySelector('#addBook');
const content = document.querySelector('#content');
const dialog = document.querySelector("#dialog");
const close = document.querySelector('#close');
const totalBooks = document.querySelector('#totalBooks');
const percentRead = document.querySelector('#percentRead');
const dialogSave = document.querySelector('#save');

const dialogTitle = document.querySelector('#title');
const dialogAuthor = document.querySelector('#author');
const dialogPages = document.querySelector('#pages');
const dialogIsRead = document.querySelector('#isRead');

const checkImgFile = [ "images/checkFill.svg", "images/checkOutline.svg"];

function book(id, title, author, pages, isRead) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.pages=pages;
    this.isRead = isRead;
};

let bookCount = 0;
let readCount = 0;
let isEditingEntry = false;
let editingEntryNum = "0";

let id = bookCount.toString();
let b1 = new book(id, "The Book of Three", "Lloyd Alexander", "514", false );
let libraryDB = { [id]:b1 };
bookCount+=1;

dialogSave.addEventListener("click", saveBook );
addBook.addEventListener("click", openDialog );
close.addEventListener("click", closeDialog );

setup();

function setup() {
    console.log("is editing entry:", isEditingEntry);
    updateTinyButtonListeners();
}

function closeDialog() {
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
    } else {
        dialogTitle.value = "";
        dialogAuthor.value = "";
        dialogPages.value = "";
        dialogIsRead.value = false;
    }
    dialog.showModal();
}

function saveBook() {

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
    }

    console.log("saving the book")
    closeDialog();
}
function addLibraryEntry(useDialog) {
    let id = bookCount.toString();
    let b = new book;
    // libraryDB = { [id]:b };
    libraryDB[id] = b;
    bookCount+=1;
    
    if (useDialog){
        updateLibraryEntryFromDialog(id)
    } else {
        b.title = "The Book of Three";
        b.author = "Lloyd Alexander";
        b.pages = "514";
        b.isRead = false;
    }
    return id;
}

function updateLibraryEntryFromDialog( id ) {
    let bookDB = libraryDB[id];
    bookDB.id = id;
    bookDB.title = dialogTitle.value;
    bookDB.author = dialogAuthor.value;
    bookDB.pages = dialogPages.value;
    bookDB.isRead = dialogIsRead.value;
}

function updateHTML(id) {
    let bookHTML = document.querySelector("#id"+editingEntryNum);
    let bookDB = libraryDB[id];

    bookHTML.querySelector(".title").textContent = bookDB.title;
    bookHTML.querySelector(".author").textContent = bookDB.author;
    bookHTML.querySelector(".pages").textContent = bookDB.pages;

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
    content.append( getBookHtml( bookDB ) );
    // bTitle, bAuthor, bPages, bRead, cColors
    updateTinyButtonListeners();
}

function updateTinyButtonListeners() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
    document.querySelectorAll(".check").forEach(chk => chk.addEventListener("click", checkToggle));
}
function checkToggle(e) {
    console.log(e);
    let target = e.target;
    for (let i = 0; i < 3; i++) {
        target = target.parentNode;
    }
    let id = target.id.slice(2);
    
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
        target.remove();
    } else {
        isEditingEntry = true;
        openDialog( target );
    }
    
}

function getIconHTML( file, iconSize ) {
    // CHECK IF FILE IS APPROVED
    // ADD CHECKFILL CHECKOUTLINE CLOSE DELETE EDIT
    //  <div class="delete button-sm">
    //          <img class="icon-sm" src="images/delete.svg" alt="">
    //  </div>

    const img = document.createElement("img");
    img.src = "images/" + file + ".svg";
    img.classList.add(iconSize);
    
    const icon = document.createElement("div");
    icon.classList.add(file, "button-sm", "button-action");
    icon.appendChild(img);
    return icon;
}

function getTextHTML( text, classAttributes ) {
    const element = document.createElement("div");

    classAttributes.forEach(el => {
        element.classList.add(el);
    });
    
    element.textContent = text;
    return element;
}

function getBookHtml( bookDB ){
    // 
// } bTitle, bAuthor, bPages, bRead, cColors) {

    // <div class="book shadow">
    //     <div class="cover filled">
    //         <div class="upper-icons">
    //             <div class="delete button-sm"><img class="icon-sm" src="images/delete.svg" alt=""></div>
    //             <div class="edit button-sm"><img class="icon-sm" src="images/edit.svg" alt=""></div>
    //         </div>
    //         <div class="icon-lg check"><img class="" src="images/checkOutline.svg" alt=""></div>
    //     </div>
    //     <div class="text-md">The Book of Three</div>
    //     <div class="text-sm">By Lloyd Alexander</div>
    //     <div class="text-sm text-sub">514 pages</div>
    // </div>

    const book = document.createElement("div");
    book.classList.add("book", "shadow");
    book.id = bookDB.id;
    const cover = document.createElement("div");
    cover.classList.add("cover", "filled");
    

    const upperIcons = document.createElement("div");
    upperIcons.classList.add("upper-icons");
    const iconDelete = getIconHTML("delete", "icon-sm");
    const iconEdit = getIconHTML("edit", "icon-sm");
    upperIcons.appendChild(iconDelete);
    upperIcons.appendChild(iconEdit);

    cover.appendChild(upperIcons);

    const checkImg = document.createElement("img");
    checkImg.classList.add("check", "hidden");
    let cImg = checkImgFile[1];
    // let checkType = "checkOutline";
    if (bookDB.isRead) {
        cImg = checkImgFile[0];
    }    
    checkImg.src = cImg;
    
    const checkIcon = document.createElement("div");
    checkIcon.classList.add("icon-lg", "check");
    checkIcon.appendChild(checkImg);


    // const iconCheck = getIconHTML(checkType, "icon-lg");
    const textTitle = getTextHTML(bookDB.title, ["text-md", "title"] );
    const textAuthor = getTextHTML(bookDB.author, ["text-sm", "author"] );
    const textPage = getTextHTML(bookDB.pages, ["text-sm", "text-sub", "pages"] );
    textPage.textContent = textPage.textContent + " pages";
    
    cover.appendChild(checkIcon);
    book.appendChild(cover);    
    book.append(textTitle);
    book.append(textAuthor);
    book.append(textPage);
    return book;
}