class Book {
    #bookID = -1;
    #title = "The Book of Three";
    #author = "Lloyd Alexander";
    #pages = "514";
    #isRead = false;
    #style = "";

    constructor () {
    };

    set id (val) { this.#bookID = val; };
    get id () { return this.#bookID; };

    set title (val) { this.#title = val; };
    get title () { return this.#title; };

    set author (val) { this.#author = val; };
    get author () { return this.#author; };

    set pages (val) { this.#pages = val; };
    get pages () { return this.#pages; };

    set isRead (val) { this.#isRead = val; };
    get isRead () { return this.#isRead; };

    set style (val) { this.#style = val; };
    get style () { return this.#style; };

    recordInfo ( title, author, pages, isRead) {
        this.#title = title;
        this.#author = author;
        this.#pages = pages;
        this.#isRead = isRead;
    };

};