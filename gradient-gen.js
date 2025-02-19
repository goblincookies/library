// CREATES A 2 COLOR LINEAR GRADIENT
class GradientGenerator {

    #lastLight = -1;
    #lastDark = -1;

    // COLORS FOR COVER GRADIENT
    #darkColors = [
        "#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b","#4d908e",
        "#577590","#277da1","#471ca8","#884ab2","#ff930a","#f24b04","#d1105a"
    ];
    #lightColors = [
        "#fbf8cc","#fde4cf","#ffcfd2","#f1c0e8","#cfbaf0",
        "#a3c4f3","#90dbf4","#8eecf5","#98f5e1","#b9fbc0"
    ];
    
    getRandomIndex( array ) {
        return Math.floor( Math.random()* array.length);
    };

    // RETURNS A LINEAR GRADIENT STYLED FOR CSS AS A STRING
    getNewStyleAsString() {

        // THIS COULD BE RANDOM, BUT INCONSISTENT ANGLES LOOK MESSY TO ME
        let gradDeg = 45;

        // RANDOMLY SELECT THE COLORS
        let lightIndex = this.getRandomIndex( this.#lightColors );
        let darkIndex = this.getRandomIndex( this.#darkColors );

        // MAKE SURE THEY ARE DIFFERENT THAN LAST TIME
        while (lightIndex == this.#lastLight) {
            lightIndex = this.getRandomIndex( this.#lightColors );
        };
        while (darkIndex == this.#lastDark) {
            darkIndex = this.getRandomIndex( this.#darkColors );
        };

        // REMEMBER THESE COLORS FOR NEXT TIME
        this.#lastLight = lightIndex;
        this.#lastDark = darkIndex;

        // GET THE HEXT VALUES
        let hexA = this.#lightColors[ lightIndex ];
        let hexB = this.#darkColors[ darkIndex ];

        // POPULATE THE CSS
        let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${hexA} 0%, ${hexB} 100%);`;

        console.log(linearGrad);
        return linearGrad.toString();
    };

};