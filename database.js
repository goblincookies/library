class Database {

    #searialID = 0;
    #database = {};
    constructor () {

    };


    isNotABook( val ) {
        if ( val instanceof Book) { return false; };

        console.log((typeof val), "is not a book object");
        return true;
    };

    writeBook ( book ) {
        if( this.isNotABook( book ) ) { return 0; };

        if (book.id < 0){
            this.#searialID += 1;
            book.id = this.#searialID;
        };

        console.log(`writing to database id:${ book.id } -- ${book.title}`)

        this.#database[book.id] = book;
    };

    removeBook( book ) {
        if( this.isNotABook( book ) ) { return 0; };

        delete this.#database[ book.id ];
    };

    getBook( id ) {
        if (this.#database[id]) { return this.#database[id] }

        // DOESN'T EXIST
        console.log(`database can't find that book(${id}), sending a blank one`);
        let ghostBook = new Book();
        let gradGen = new GradientGenerator();
        ghostBook.style = gradGen.getNewStyleAsString();
        ghostBook.recordInfo("", "", "", false);
        return ghostBook;
    };

    count () {
        return Object.keys(this.#database).length; }

    readCount () {
        let readCount = 0;

        for (const [key, value] of Object.keys(this.#database)) {
            if (this.#database[key].isRead) {
                readCount += 1;
            }
        };
        return readCount;
    }
};

// let book = new Book();
// let gradientGen = new GradientGenerator();
// let db = new Database();
// book.style = gradientGen.genNew();

// // console.log(book.id)

// // db.writeBook(9);
// db.writeBook(book);
