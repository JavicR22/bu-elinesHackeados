<!doctype
html >
  <html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Rutas de Busetas - Dos rutas</title>
  <style>\
    html,body,#map { height: 100%; margin: 0; padding: 0; }\
    #map { height: 80vh; }\
    .controls { padding: 10px; }\
    button { padding: 8px 12px; margin: 5px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="controls">
    <strong>Simular:</strong><br>
    <button id="startBtn1">Ruta Original</button>
    <button id="startBtn2">Ruta Nueva</button>
  </div>
  <div id="map"></div>
\
  <!-- Reemplaza con tu propia API KEY -->
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBJid6cm7TqtvO1c0B0b9tOKfZNbA6l6Ho&callback=initMap" async defer></script>

  <script>
    // -------- RUTA ORIGINAL --------
    const stops1 = [\
      {lat:4.119962, lng:-73.565602, name:'San Antonio'}, \
      {lat:4.128293, lng:-73.568883, name:'Camino Ganadero'}, \
      {lat:4.132105, lng:-73.565558, name:'Hotel Campanario'},\
      {lat:4.138859, lng:-73.594127, name:'Avenida Catama'},\
      {lat:4.149229, lng:-73.628838, name:'Hotel Rosada'},\
      {lat:4.149261, lng:-73.635636, name:'Parque del Hacha'},\
      {lat:4.146947, lng:-73.636648, name:'Parque de los estudiantes'},\
      {lat:4.145018, lng:-73.637844, name:'Fiscalia'},\
      {lat:4.143767, lng:-73.637424, name:'Clinica Meta'},\
      {lat:4.146866, lng:-73.639007, name:'Clinica Martha'},\
      {lat:4.149313, lng:-73.639250, name:'Clinica San Ignacio'},\
      {lat:4.145927, lng:-73.642055, name:'Calle 37'},\
      {lat:4.144459, lng:-73.643422, name:'Hospital Departamental'}
    ];

    // -------- NUEVA RUTA (ejemplo Villavicencio centro) --------
    const stops2 = [\
      {lat:4.142572, lng:-73.629326, name:'Plaza Los Libertadores'},\
      {lat:4.144660, lng:-73.628400, name:'Catedral'},\
      {lat:4.146520, lng:-73.627050, name:'Parque Infantil'},\
      {lat:4.149890, lng:-73.626250, name:'Siete de Agosto'},\
      {lat:4.152100, lng:-73.624800, name:'Terminalito'}
    ];

    let map;
    let route1 = {}, route2 = {};

    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: stops1[0],
        zoom: 14,\
      });

      // Configurar ambas rutas
      setupRoute(stops1, "blue", route1);
      setupRoute(stops2, "green", route2);

      document.getElementById('startBtn1').addEventListener('click', () => simulateBus(route1));
      document.getElementById('startBtn2').addEventListener('click', () => simulateBus(route2));
    }

    function setupRoute(stops, color, routeObj) {\
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,\
        suppressMarkers: true,\
        polylineOptions: { strokeColor: color, strokeWeight: 5 }
      });

      directionsService.route({\
        origin: stops[0],
        destination: stops[stops.length-1],\
        waypoints: stops.slice(1,-1).map(s => ({location: s})),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result,status)=>{\
        if(status==="OK"){
          directionsRenderer.setDirections(result);
          routeObj.path = result.routes[0].overview_path;
          routeObj.busMarker = new google.maps.Marker({
            position: routeObj.path[0],
            map,
            title: "Buseta",
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              strokeColor: color
            }
          });

          // Paradas
          const stopIcon = {
            url:"https://maps.gstatic.com/mapfiles/transit/iw2/6/bus.png",
            scaledSize:new google.maps.Size(28,28)
          };
          stops.forEach(s=>{
            new google.maps.Marker({
              position:s,
              map,
              title:s.name,
              icon:stopIcon
            });
          });
        }
      });
    }

    function simulateBus(routeObj) {
      if(!routeObj.path) return;
      let i = 0;
      function step(){
        if(i>=routeObj.path.length) return;
        routeObj.busMarker.setPosition(routeObj.path[i]);
        i++;
        setTimeout(step, 500); // velocidad
      }
      step();
    }
  </script>
</body>
</html>
