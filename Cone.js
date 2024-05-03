class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        

        // 3 main parts
        // Point of cone
        // Middle of bottom of cone
        // and all the surrounding parts
        // no scrap that

        // Tip/Point of Cone
        // Then we have a width as we go in a circle

        // so we always want the top point, which is (0.5, 1, 0.5)
        // which means we are at highest level in middle

        var radius = .2;
        var segments = 100;
        let increment = (2 * Math.PI) / segments;

        for (let i = 0; i < segments; i++) {
            // gl.uniform4f(u_FragColor, rgba[0]*(i/100), rgba[1]*(i/100), rgba[2]*(i/100), rgba[3]);
            let angle = i * increment;
            let x = 0.5 + radius * Math.cos(angle);
            let y = 0.5 + radius * Math.sin(angle);
            let x2 = 0.5 + radius * Math.cos(angle + increment);
            let y2 = 0.5 + radius * Math.sin(angle + increment);
            drawTriangle3D([0.5,0.95,0.5,  x,0.05,y,  x2,0.05,y2 ]);
        }

        // Drawing bottom of cone
        for (let i = 0; i < segments; i++) {
            let angle = i * increment;
            let x = 0.5 + radius * Math.cos(angle);
            let y = 0.05;
            let z = 0.5 + radius * Math.sin(angle);
            let x2 = 0.5 + radius * Math.cos(angle + increment);
            let z2 = 0.5 + radius * Math.sin(angle + increment);
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangle3D([0.5,0.05,0.5,  x,y, z,  x2,y,z2]);
        }


        // // Front of cube
        // drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        // drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // // Back of cube
        // drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
        // drawTriangle3D([0,0,1, 0,1,1, 1,1,1]);

        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);


        // // Top of cube
        // drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
        // drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

        // // Bottom of cube
        // drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
        // drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);

        // // Left of Cube
        // drawTriangle3D([0,0,0, 0,1,1, 0,0,1]);
        // drawTriangle3D([0,0,0, 0,1,0, 0,1,1]);

        // // // Right of Cube
        // drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);
        // drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);


    }
}