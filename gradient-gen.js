class GradientGenerator {
    // COLORS FOR COVER GRADIENT
    #darkColors = [
        "#f94144","#f3722c","#f8961e","#f9844a","#90be6d","#43aa8b","#4d908e",
        "#577590","#277da1","#471ca8","#884ab2","#ff930a","#f24b04","#d1105a"
    ];
    
    #lightColors = [
        "#fbf8cc","#fde4cf","#ffcfd2","#f1c0e8","#cfbaf0",
        "#a3c4f3","#90dbf4","#8eecf5","#98f5e1","#b9fbc0"
    ];

    
    getNewStyleAsString() {

        // THIS COULD BE RANDOM, BUT INCONSISTENT ANGLES LOOK MESSY TO ME
        let gradDeg = 45;

        let hexA = this.#lightColors[ Math.floor( Math.random()* this.#lightColors.length)];
        let hexB = this.#darkColors[ Math.floor( Math.random()* this.#darkColors.length)];

        let linearGrad = `background:linear-gradient( ${gradDeg}deg, ${hexA} 0%, ${hexB} 100%);`;

        console.log(linearGrad);
        return linearGrad.toString();
    };

};