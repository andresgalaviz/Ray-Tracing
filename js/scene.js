   var camera = [
      // -100,0,0,                     // x,y,z coordinates 
      200, 0,0,                     // x,y,z coordinates                                                                                   
      1,0,0,                     // Direction normal vector                                                                             
      45                         // field of view : example 45                                                                          
   ];
 
   var lights = [    
      2,                    // number of lights                                                                                    
      0,200,0, 0,1,0,        // light 1, x,y,z location, and rgb colour (green)                                                     
      0,-200,0, 1,1,1,        // light 2, x,y,z location, and rgb colour (white)                                                     
      // 0,0,-100, 1,1,1,        // light 2, x,y,z location, and rgb colour (white)                                                     
   ];

   var objects = [
      // Number of objects
      2,                  
      // SPHERE    , ressz, r,  g,
       
      ObjTyp.SPHERE, 13,    0.0,1.0,0.0,0.0,0.4,0.2,0.7, 0,0,0,15,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,                  
      ObjTyp.SPHERE, 13,    1.0,0.0,0.0,0.0,1.0,0.5,0.8, 0,50,0,15,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad, 
      // ObjTyp.SPHERE, 13,    0.0,0.0,1.0,0.0,1.0,0.7,0.8, 0,0,0,15,           // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,                                  
   ]



