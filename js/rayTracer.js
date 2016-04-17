   var selection = 0;

   var width = 800;
   var height = 600;
   var shiftPressed = false;

   function change( el ) {
      if ( el.value === "Using CPU" ) {
         selection = 1;
         el.value = "Using GPU";
      } else {
         selection = 0;
         el.value = "Using CPU";
      }
   }

   var gpu = new GPU();

   function dist(ax,ay,bx,by) {
      return Math.sqrt(Math.pow((bx-ax), 2)+Math.pow((by-ay), 2) );
   }

   // Substracts vector v2 [x,y,z] from vector v1[x,y,z]
   function substractVector(v1, v2) {
      return [v1[0] - v[0], v1[1] - v2[1], v1[2] - v2[2]];
   }

   function cProdX(ay, bz, az, by) {
        return ay*bz - az*by;
   }
    function cProdY(az, bx, ax, bz) {
        return az*bx - ax*bz;
   }
    function cProdZ(ax, by, ay, bx) {
        return ax*by - ay*bx;
   }
   function MagnitudeVector(x,y,z) {
       return Math.sqrt(Math.pow(x, 2) + Math.pow(y,2) + Math.pow(z,2));
   }

    gpu.addFunction(dist);
    gpu.addFunction(substractVector);
    gpu.addFunction(cProdX);
    gpu.addFunction(cProdY);
    gpu.addFunction(cProdZ);
    gpu.addFunction(MagnitudeVector);
    // gpu.addFunction(trace);
    // gpu.addFunction(intersectScene);

    function preprocessScene(camera){
        var fovRadians = Math.PI * (camera[6]/2)/180; // 0
        var heightWidthRatio = height / width; // 1
        var halfWidth = Math.tan(fovRadians); // 2
        var halfHeight = heightWidthRatio * halfWidth; // 3
        var cameraWidth = halfWidth * 2; // 4
        var cameraHeight = halfHeight * 2; // 5
        var pixelWidth = cameraWidth / (width - 1); // 6
        var pixelHeight = cameraHeight / (height - 1); // 7
        return [fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight];
   }

   function getCoordinateSystem(camera) {
        var cameraPoint = Vector.Vector(camera[0], camera[1], camera[2]);
        var cameraDirection = Vector.Vector(camera[3], camera[4], camera[5]);

        var cameraVector = Vector.unitVector(Vector.subtract(cameraDirection, cameraPoint)); // 0, 1, 2
        var camRight = Vector.unitVector(Vector.crossProduct(cameraVector, Vector.UP)); // 3, 4, 5
        var camUp = Vector.unitVector(Vector.crossProduct(camRight, cameraVector)); // 6, 7 ,8

        return [cameraVector.x, cameraVector.y, cameraVector.z, camRight.x, camRight.y, camRight.z, camUp.x, camUp.y, camUp.z];
   }


    function sphereIntersection(rayXVector, rayYVector, rayZVector, rayXPoint, rayYPoint, rayZPoint, sphereXPoint, sphereYPoint, sphereZPoint, sphereRad) {
        // Substract CameraRay from Sphere
        var cam_to_centerX = sphereXPoint - rayXPoint;
        var cam_to_centerY = sphereYPoint - rayYPoint;
        var cam_to_centerZ = sphereZPoint - rayZPoint;
        // Dotproduct of the new vector and the camera vector
        var v = cam_to_centerX * rayXVector + cam_to_centerY * rayYVector + cam_to_centerZ * rayZVector;
        
        

        var cam_to_centerDot = cam_to_centerX*cam_to_centerX + cam_to_centerY*cam_to_centerY + cam_to_centerZ*cam_to_centerZ;

        var discriminant = (sphereRad * sphereRad) - cam_to_centerDot + (v * v);
        if(discriminant < 0) {
            return 1000000;
        } else {
            return v - Math.sqrt(discriminant);
        }
        return 0;
    }   

    gpu.addFunction(sphereIntersection);

    function isLightVisible(pt, scene, light) {
    var distObject =  intersectScene({
        point: pt,
        vector: Vector.unitVector(Vector.subtract(pt, light))
    }, scene);


    return distObject[0] > -0.005;
}



    gpu.addFunction(isLightVisible);
      


   function doit(mode) {
      var opt = {
         dimensions: [width, height],
                  graphical: true,
         safeTextureReadHack: false,
         constants: { OBJCOUNT: objects[0], LIGHTCOUNT: lights[0],    
                         EMPTY: ObjTyp.EMPTY,    SPHERE: ObjTyp.SPHERE,   CUBOID: ObjTyp.CUBOID, 
                      CYLINDER: ObjTyp.CYLINDER,   CONE: ObjTyp.CONE,   TRIANGLE: ObjTyp.TRIANGLE,
                      cX: 0, cY: 1, cZ: 2, cVecX: 3, cVecY: 4, cVecZ:5, fod:6,
                      NUMLIGHTS:0, lX: 1, lY: 2, lZ: 3, lR: 4, lG: 5, lB: 6,
                      RECSZ: 1, R: 2, G: 3, B: 4, SPEC: 5, LAMB: 6, AMB: 7, OPAC: 8, X: 9, Y: 10, Z: 11, RAD:12, WID: 12, bx: 12, HGT: 13, Y2: 13, XD: 14, YD: 15, ZD: 16, DEP: 17, Z2: 14, X3: 15, Y3:16, Z3: 17, WIDTH: 18
                    }, mode: mode
      };

        var y = gpu.createKernel(function(Camera,Lights, Objects, Scene, CameraCoordSystem) {
            var jkj =this.constants.OBJCOUNT;

            var xScale = ((this.thread.x * Scene[6]) - Scene[2]); // (x * pixelWidth) - halfWidth
            var xCompX = CameraCoordSystem[3] * xScale;
            var xCompY = CameraCoordSystem[4] * xScale;
            var xCompZ = CameraCoordSystem[5] * xScale;

            var yScale = this.thread.y * Scene[7] - Scene[3]; // (y * pixelHeight) - halfHeight
            var yCompX = CameraCoordSystem[6] * yScale;
            var yCompY = CameraCoordSystem[7] * yScale;
            var yCompZ = CameraCoordSystem[8] * yScale;


            var rayXVector = CameraCoordSystem[0] + xCompX + yCompX;
            var rayYVector = CameraCoordSystem[1] + xCompY + yCompY;
            var rayZVector = CameraCoordSystem[2] + xCompZ + yCompZ;
            var rayMagnitude = MagnitudeVector(rayXVector, rayYVector, rayZVector);

            rayXVector = rayXVector/rayMagnitude;
            rayYVector = rayYVector/rayMagnitude;
            rayZVector = rayZVector/rayMagnitude;

            var idx = 1;                                     // index for looking through all the objects
            var nextidx = 1; 
            

            
            
            var hitIdx = -1;
            var minDistance = 1000000;
            this.color(0.95,0.95,0.95);                      // By default canvas is light grey
            // var color = trace(rayXVector, rayYVector, rayZVector, 2, 1);
            for (i=0; i<this.constants.OBJCOUNT; i++ ) {     // Look at all object records
                idx = nextidx;                               // Skip to next record
                nextidx = Objects[idx+this.constants.RECSZ]+idx;                // Pre-compute the beginning of the next record

                if (Objects[idx] == this.constants.SPHERE) { // i.e. if it is a SPHERE...

                    var distanceObject = sphereIntersection(rayXVector, rayYVector, rayZVector, Camera[0], Camera[1], Camera[2], 
                                                    Objects[idx + this.constants.X], Objects[idx + this.constants.Y], Objects[idx + this.constants.Z],
                                                    Objects[idx + this.constants.RAD]);
                    if(distanceObject != 1000000){
                        if(distanceObject < minDistance) {
                                minDistance = distanceObject;
                                hitIdx = idx;
                        }
                    }

                    // var b = object.color,
                    // c = Vector.ZERO,
                    // var lambertAmount = 0;


                    //     if (dist(this.thread.x,this.thread.y,Objects[idx+this.constants.X],Objects[idx+this.constants.Y]) < Objects[idx+this.constants.RAD]) {
                        
                    //         this.color(Objects[idx+this.constants.R],Objects[idx+this.constants.G],Objects[idx+this.constants.B]);
                    // }
                    // 
                }
            }
            if(minDistance != 1000000) {
                var pointAtTimeX = Camera[0] +  rayXVector*minDistance;
                var pointAtTimeY = Camera[1] +  rayYVector*minDistance;
                var pointAtTimeZ = Camera[2] +  rayZVector*minDistance;

                var sphereNormalX = pointAtTimeX - Objects[hitIdx + this.constants.X];
                var sphereNormalY = pointAtTimeY - Objects[hitIdx + this.constants.Y];
                var sphereNormalZ = pointAtTimeZ - Objects[hitIdx + this.constants.Z];

                var normalMagnitude = MagnitudeVector(sphereNormalX, sphereNormalY, sphereNormalZ);
                sphereNormalX = sphereNormalX/normalMagnitude;
                sphereNormalY = sphereNormalY/normalMagnitude;
                sphereNormalZ = sphereNormalZ/normalMagnitude;
                var lambertAmount = 0.0;
                var objectLambert = 0;
                if(Objects[hitIdx+this.constants.LAMB] > 0) {
                    for (var i = 0; i < this.constants.LIGHTCOUNT; i++) {
                        var lightPointX = Lights[i*6 + 1];
                        var lightPointY = Lights[i*6 + 2];
                        var lightPointZ = Lights[i*6 + 3];

                        var lightVectorX = lightPointX - pointAtTimeX;
                        var lightVectorY = lightPointY - pointAtTimeY;
                        var lightVectorZ = lightPointZ - pointAtTimeZ;
                        var lightVectorMagnitude = MagnitudeVector(lightVectorX, lightVectorY, lightVectorZ);

                        lightVectorX = lightVectorX/lightVectorMagnitude;
                        lightVectorY = lightVectorY/lightVectorMagnitude;
                        lightVectorZ = lightVectorZ/lightVectorMagnitude;

                        var distanceLight = sphereIntersection(lightVectorX, lightVectorY, lightVectorZ, lightPointX, lightPointY, lightPointZ, 
                                                    Objects[hitIdx + this.constants.X], Objects[hitIdx + this.constants.Y], Objects[hitIdx + this.constants.Z],
                                                    Objects[hitIdx + this.constants.RAD]);

                        if (distanceLight < -0.005){
                            var contribution = lightVectorX*sphereNormalX + lightVectorY*sphereNormalY + lightVectorZ*sphereNormalZ;
                            if (contribution > 0) lambertAmount += contribution;
                        }

                    }
                }
                if (Objects[hitIdx+this.constants.SPEC] > 0) {

                    var dotProductRayNormal = rayXVector*sphereNormalX + rayYVector*sphereNormalY + rayZVector*sphereNormalZ;
                    sphereNormalX *= (dotProductRayNormal*2);
                    sphereNormalY *= (dotProductRayNormal*2);
                    sphereNormalZ *= (dotProductRayNormal*2);

                    var rayXVectorReflection = sphereNormalX - rayXVector;
                    var rayYVectorReflection = sphereNormalY - rayYVector;
                    var rayZVectorReflection = sphereNormalZ - rayZVector;

                    // For when GPU.js supports recursion (or a stack)
                    // var reflectedColor = trace(reflectedRay, scene, ++depth);
                    // if (reflectedColor) {
                    //     c = Vector.add(c, Vector.scale(reflectedColor, object.specular));
                    // }

                }

                var specularR = 0.0;
                var specularG = 0.0;
                var specularB = 0.0;

                lambertAmount = Math.min(1, lambertAmount);
                var colorR = Objects[hitIdx+this.constants.R]*lambertAmount*Objects[hitIdx+this.constants.LAMB] + Objects[hitIdx+this.constants.R]*Objects[hitIdx+this.constants.AMB];
                var colorG = Objects[hitIdx+this.constants.G]*lambertAmount*Objects[hitIdx+this.constants.LAMB] + Objects[hitIdx+this.constants.G]*Objects[hitIdx+this.constants.AMB];
                var colorB = Objects[hitIdx+this.constants.B]*lambertAmount*Objects[hitIdx+this.constants.LAMB] + Objects[hitIdx+this.constants.B]*Objects[hitIdx+this.constants.AMB];
                this.color(colorR, colorG, colorB, Objects[hitIdx+this.constants.OPAC]);
            }

        // GO BACK TO TUTORIAL, NOT DONE
            //         index = (x * 4) + (y * width * 4),
            // data.data[index + 0] = color.x;
            // data.data[index + 1] = color.y;
            // data.data[index + 2] = color.z;
            // data.data[index + 3] = 255;


      }, opt);
      return y;
   }

   var mykernel = doit("gpu");
   var mycode   = doit("cpu");
    var scene = preprocessScene(camera);
    var cameraCoordinateSystem = getCoordinateSystem(camera);
   mykernel(camera,lights,objects, scene, cameraCoordinateSystem);
   var canvas = mykernel.getCanvas();
   document.getElementsByTagName('body')[0].appendChild(canvas);

   var f = document.querySelector("#fps");
   function renderLoop() {
      f.innerHTML = fps.getFPS();

      if (selection === 0) {
          mycode(camera,lights,objects, scene, cameraCoordinateSystem);
          var cv = document.getElementsByTagName("canvas")[0];
          var bdy = cv.parentNode;
          var newCanvas = mycode.getCanvas();
          bdy.replaceChild(newCanvas, cv);
      } else {
          mykernel(camera,lights,objects, scene, cameraCoordinateSystem);
          var cv = document.getElementsByTagName("canvas")[0];
          var bdy = cv.parentNode;
          var newCanvas = mykernel.getCanvas();
          bdy.replaceChild(newCanvas, cv);
      }
      // objects[10] = (objects[10]+2);
      // objects[24] = (objects[24]+2) % 100;
      // objects[38] = (objects[38]+2) % 100;
     // setTimeout(renderLoop,1);            // Uncomment this line, and comment the next line
      requestAnimationFrame(renderLoop);     // to see how fast this could run...
   }
   window.onkeyup = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if(key == 16) {
            shiftPressed = false;
       }
       if(shiftPressed) {
            if (key == 88) {
               camera[3] += 10;
           }else if (key == 90) {
               camera[3] -= 10;
           }
            else if (key == 39) {
               camera[4] += 10;
           }else if (key == 37) {
               camera[4] -= 10;
           }
            else if (key == 39) {
               camera[5] += 10;
           }else if (key == 37) {
               camera[5] -= 10;
           }
       } else {
           if (key == 38) {
               camera[0] += 10;
           }else if (key == 40) {
               camera[0] -= 10;
           }
            else if (key == 88) {
               camera[1] += 10;
           }else if (key == 90) {
               camera[1] -= 10;
           }
            else if (key == 39) {
               camera[2] += 10;
           }else if (key == 37) {
               camera[2] -= 10;
           }
       }
       scene = preprocessScene(camera);
       cameraCoordinateSystem = getCoordinateSystem(camera);
    }

    window.onkeydown = function(e){
        if (event.shiftKey) {
            shiftPressed = true;
        }
    }


   window.onload = renderLoop;