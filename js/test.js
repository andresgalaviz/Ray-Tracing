var gpu = new GPU();
var opt = {
    dimensions: [100,100],
    graphical: true
};

var render = gpu.createKernel(function() {
    this.color(this.thread.x/100, this.thread.y/100, 0, 1);
    // return this.thread.x;
}, opt);
    
console.log(render());

var canvas = render.getCanvas();
document.getElementsByTagName('body')[0].appendChild(canvas);



// var myFunc = gpu.createKernel(function() {
//     return 100;
// }).dimensions([100, 200]);

// var myFunc2 = gpu.createKernel(function() {
//     return this.thread.x;
// }, opt);

// var myFunc3 = gpu.createKernel(function(x) {
//     return x*this.thread.x;
// }, opt);

// var myFunc4 = gpu.createKernel(function(X) {
//     return X[this.thread.x%3];
// }, opt);


// console.log(myFunc());
// console.log(myFunc2());
// console.log(myFunc3(2));
