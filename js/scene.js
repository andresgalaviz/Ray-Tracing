   var camera = [
      // -100,0,0,                     // x,y,z coordinates 
      -150,0,0,                     // x,y,z coordinates                                                                                   
      1,0,0,                     // Direction normal vector                                                                             
      45                         // field of view : example 45                                                                          
   ];
 
   var lights = [    
      2,                    // number of lights                                                                                    
      -100, -50,0, 0,1,0,        // light 1, x,y,z location, and rgb colour (green)                                                     
      0,100,0, 1,1,1,        // light 2, x,y,z location, and rgb colour (white)                                                     
      -150,-100,0, 1,0,1,        // light 2, x,y,z location, and rgb colour (blue)                                                     
   ];

   var objects = [
      // Number of objects
      3,                  
      // SPHERE    , ressz, r,  g,
       
      ObjTyp.SPHERE, 13,    0.0,1.0,0.0,0.0,0.9,0.1,0.7, 0,0,24,15,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,                  
      ObjTyp.SPHERE, 13,    1.0,1.0,0.1,0.0,1.0,0.5,0.8, 0,25,5,5,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad, 
      ObjTyp.SPHERE, 13,    1.0,0.4,1.0,0.0,1.0,0.7,0.8, -25,1,0,5,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,                                  
   ]



