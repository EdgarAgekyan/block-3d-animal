class TrianglePrism {
    constructor() {
        this.type = 'trianglePrism';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Front and back
        drawTriangle3D([0,0,0,  1,0,0, 0.5,1,0]);
        drawTriangle3D([0,0,1,  1,0,1, 0.5,1,1]);

        // Bottom
        drawTriangle3D([0,0,0,  0,0,1, 1,0,0]);
        drawTriangle3D([0,0,0,  1,0,0, 1,0,1]);

        // Left
        drawTriangle3D([0,0,0,  0.5,1,0, 0.5,1,1]);
        drawTriangle3D([0,0,0,  0,0,1, 0.5,1,1]);

        // Right
        drawTriangle3D([1,0,0,  0.5,1,0, 0.5,1,1]);
        drawTriangle3D([1,0,0,  0.5,1,1, 1,0,1]);

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