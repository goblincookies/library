const addBook = document.querySelector('#addBook');
const content = document.querySelector('#content');
const dialog = document.querySelector("#dialog");
const close = document.querySelector('#close');
const totalBooks = document.querySelector('#totalBooks');
const percentRead = document.querySelector('#percentRead');
const dialogSave = document.querySelector('#save');

let bookCount = 0;
let readCount = 0;
let isEditingEntry = false;

dialogSave.addEventListener("click", saveBook );
addBook.addEventListener("click", openDialog );
close.addEventListener("click", closeDialog );

setup();

function setup() {
    updateTinyButtonListeners();
}

function closeDialog() {
    isEditingEntry = false;
    console.log("closing");
    dialog.close();
}

function openDialog( target ) {
    console.log("opening");
    dialog.showModal();
}

function saveBook() {
    if (isEditingEntry) {
        
    }else{
        
        addBookToPage()
    }
    closeDialog();
}

function addBookToPage () {
    // get html
    // add to DOM
    content.append( getBookHtml( "New Books are Great!", "Somebody Else", "523", false, "red") );
    // bTitle, bAuthor, bPages, bRead, cColors
    updateTinyButtonListeners();
}

function updateTinyButtonListeners() {
    document.querySelectorAll(".button-action").forEach( bttn => bttn.addEventListener("click", bttnClick) );
}

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
function editContent( target ) {

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

function getBookHtml( bTitle, bAuthor, bPages, bRead, cColors) {

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
    let checkType = "checkOutline";
    if (bRead) {
        checkType = "checkFill";
    }    
    checkImg.src = "images/" + checkType + ".svg";
    
    const checkIcon = document.createElement("div");
    checkIcon.classList.add("icon-lg", "check");
    checkIcon.appendChild(checkImg);


    // const iconCheck = getIconHTML(checkType, "icon-lg");
    const textTitle = getTextHTML(bTitle, ["text-md"] );
    const textAuthor = getTextHTML(bAuthor, ["text-sm"] );
    const textPage = getTextHTML(bPages, ["text-sm", "text-sub"] );
    textPage.textContent = textPage.textContent + " pages";
    
    cover.appendChild(checkIcon);
    book.appendChild(cover);    
    book.append(textTitle);
    book.append(textAuthor);
    book.append(textPage);
    return book;
}