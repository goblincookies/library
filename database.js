// MANAGES THE DATABASE
class Database {

    #searialID = 0;
    #database = {};
    #undoID = -1;

    // VERIFIES THAT THE DATATYPE IS OF THE BOOK CLASS
    isNotABook( val ) {
        if ( val instanceof Book) { return false; };

        console.log((typeof val), "is not a book object");
        return true;
    };

    // WRITES TO DATABASE
    writeBook ( book ) {
        if( this.isNotABook( book ) ) { return 0; };

        if (book.id < 0){
            this.#searialID += 1;
            book.id = this.#searialID;
        };

        console.log(`writing to database id:${ book.id } -- ${book.title}`)

        this.#database[book.id] = book;
    };

    // CREATES A BLANK BOOK WITH NO INFORMATION
    ghostBook () {
        let ghostBook = new Book();
        let gradGen = new GradientGenerator();
        ghostBook.style = gradGen.getNewStyleAsString();
        ghostBook.recordInfo("", "", "", false);
        return ghostBook;
    };

    // RETURNS THE BOOK FLAGGED FOR DELETION
    getUndoBook( ) {
        if (this.#database[ this.#undoID ] ) { return this.#database[ this.#undoID ] };

        //  DOESN'T EXIST
        console.log(`database can't find that book(${this.#undoID}), sending a blank one`);
        return this.ghostBook();
    };

    // RETURNS THE SPECIFIED BOOK FROM THE DATABASE
    // IF IT CANNOT BE FOUND, IT RETURNS AN EMPTY BOOK
    getBook( id ) {
        if (this.#database[id]) { return this.#database[id] }

        // DOESN'T EXIST
        console.log(`database can't find that book(${id}), sending a blank one`);
        return this.ghostBook();
    };

    // DELETES A SPECIFIC ENTRY
    deleteEntry( id ) {
        if (this.#database[id]) {
            this.#undoID = -1;
            delete this.#database[id];
            return 0;
        };
        // DOESN'T EXIST
        console.log(`database can't find that book(${id}), maybe it's already deleted?`);
    };

    // RETURNS THE SIZE OF THE DATABASE
    count () {
        return Object.keys(this.#database).length;
    };

    // RETURNS THE NUMBER OF OBJECTS WITH THE "ISREAD" PROPERTY AS TRUE
    readCount () {
        let readCount = 0;

        for (const [key, value] of Object.keys(this.#database)) {
            if (this.#database[key].isRead) {
                readCount += 1;
            }
        };
        return readCount;
    };

    // SAVES THE ID; FLAGGED TO BE DELETED
    set undoID (val) { this.#undoID = val };
    get undoID () { return this.#undoID };
};