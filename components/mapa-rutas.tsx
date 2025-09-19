// components/mapa-rutas.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stop {
    lat: number;
    lng: number;
    name: string;
    routes: string[];
}

interface RouteResultData {
    userLocation: { lat: number; lng: number };
    nearestStop: Stop;
    destinationStop: Stop;
    finalDestination: { lat: number; lng: number; name: string };
    routeName: string;
}

// Definición de rutas con paraderos ordenados
const ROUTES_CONFIG = {
    "Ruta Original": [
        { lat: 4.119962, lng: -73.565602, name: "San Antonio" },
        { lat: 4.128293, lng: -73.568883, name: "Camino Ganadero" },
        { lat: 4.132105, lng: -73.565558, name: "Hotel Campanario" },
        { lat: 4.138859, lng: -73.594127, name: "Avenida Catama" },
        { lat: 4.149229, lng: -73.628838, name: "Hotel Rosada" },
        { lat: 4.149168, lng: -73.635393, name: "Parque del Hacha" },
        { lat: 4.146900, lng: -73.636694, name: "Parque estudiantes" },
        { lat: 4.145042, lng: -73.637872, name: "La Fiscalia" },
        { lat: 4.143898, lng: -73.637490, name: "Clinica Meta" },
        { lat: 4.146778, lng: -73.639070, name: "Clinica Martha" },
        { lat: 4.149314, lng: -73.639233, name: "Clinica San Ignacio" },
        { lat: 4.145893, lng: -73.642111, name: "Unillanos" },
        { lat: 4.144452, lng: -73.643401, name: "Hospital Departamental" },
    ],
    "Ruta Nueva": [
        { lat: 4.144452, lng: -73.643401, name: "Hospital Departamental" },
        { lat: 4.145995, lng: -73.639693, name: "JamesTown" },
        { lat: 4.145807, lng: -73.635663, name: "La Bascula" },
        { lat: 4.143342, lng: -73.633646, name: "Unicentro" },
        { lat: 4.128320, lng: -73.622222, name: "Makro" },
        { lat: 4.124150, lng: -73.619062, name: "La Alborada" },
        { lat: 4.115587, lng: -73.609647, name: "Univ. Cooperativa" },
        { lat: 4.116238, lng: -73.597437, name: "Gaviotas" },
        { lat: 4.116759, lng: -73.587668, name: "Kirpas" },
        { lat: 4.124877, lng: -73.575490, name: "Malocas" },
        { lat: 4.128078, lng: -73.569144, name: "Camino Ganadero" },
        { lat: 4.125908, lng: -73.564518, name: "San Antonio" },
    ]
};

// Velocidad del bus: 20 km/h = 5.56 m/s
const BUS_SPEED_MPS = 5.56;
// Tiempo de espera en paradero: 60 segundos
const STOP_WAIT_TIME = 60000;

// Estructura para almacenar rutas reales entre paraderos
interface RouteSegment {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    path: google.maps.LatLng[];
    distance: number;
    duration: number;
}

export default function MapaRutas({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [routeInfo, setRouteInfo] = useState<RouteResultData | null>(null);
    const animationRef = useRef<number | null>(null);
    const busesRef = useRef<Map<string, any>>(new Map());
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const routeSegmentsRef = useRef<Map<string, RouteSegment[]>>(new Map()); // routeName -> segments

    // Inicializar mapa
    useEffect(() => {
        const init = async () => {
            if (!mapRef.current || !window.google?.maps) {
                const timer = setTimeout(init, 500);
                return () => clearTimeout(timer);
            }

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 4.144452, lng: -73.643401 },
                zoom: 13,
                mapId: "YOUR_MAP_ID"
            });

            // Escuchar evento para mostrar ruta
            const handleShowRoute = (event: CustomEvent) => {
                const detail = event.detail;
                setRouteInfo(detail);
                showRouteForSelected(detail, map);
            };

            window.addEventListener('showCompleteRoute', handleShowRoute as EventListener);

            // Mostrar todas las rutas por defecto al iniciar
            await loadAndShowAllRoutes(map);

            setLoading(false);

            return () => {
                window.removeEventListener('showCompleteRoute', handleShowRoute as EventListener);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                cleanup(map);
            };
        };

        init();

    }, []);

    const cleanup = (map: google.maps.Map) => {
        // Limpiar marcadores
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Limpiar directions renderers
        directionsRenderersRef.current.forEach(renderer => renderer.setMap(null));
        directionsRenderersRef.current = [];

        // Limpiar polylines
        polylinesRef.current.forEach(polyline => polyline.setMap(null));
        polylinesRef.current = [];

        // Limpiar buses del DOM
        busesRef.current.forEach((busOverlay) => {
            if (busOverlay && busOverlay.marker && busOverlay.marker.parentElement) {
                busOverlay.marker.parentElement.removeChild(busOverlay.marker);
            }
        });
        busesRef.current.clear();

        if (infoWindowRef.current) {
            infoWindowRef.current.close();
        }
    };

    const loadAndShowAllRoutes = async (map: google.maps.Map) => {
        cleanup(map);

        for (const [routeName, stops] of Object.entries(ROUTES_CONFIG)) {
            await loadRouteSegments(routeName, stops);
        }

        drawAllRoutesAndStops(map);
        startBusSimulation(map, null);
    };

    const loadRouteSegments = (routeName: string, stops: { lat: number; lng: number; name: string }[]): Promise<void> => {
        return new Promise((resolve) => {
            if (stops.length < 2) {
                resolve();
                return;
            }

            const segments: RouteSegment[] = [];
            const directionsService = new window.google.maps.DirectionsService();
            let completed = 0;

            for (let i = 0; i < stops.length - 1; i++) {
                const origin = new window.google.maps.LatLng(stops[i].lat, stops[i].lng);
                const destination = new window.google.maps.LatLng(stops[i + 1].lat, stops[i + 1].lng);

                directionsService.route(
                    {
                        origin,
                        destination,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === 'OK' && result && result.routes[0]) {
                            const route = result.routes[0];
                            const path = route.overview_path;
                            const distance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
                            const duration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

                            segments.push({
                                origin: { lat: stops[i].lat, lng: stops[i].lng },
                                destination: { lat: stops[i + 1].lat, lng: stops[i + 1].lng },
                                path,
                                distance,
                                duration
                            });
                        } else {
                            console.warn(`No se pudo cargar segmento ${i} de ${routeName}:`, status);
                            // Fallback: línea recta
                            segments.push({
                                origin: { lat: stops[i].lat, lng: stops[i].lng },
                                destination: { lat: stops[i + 1].lat, lng: stops[i + 1].lng },
                                path: [origin, destination],
                                distance: google.maps.geometry.spherical.computeDistanceBetween(origin, destination),
                                duration: 0
                            });
                        }

                        completed++;
                        if (completed === stops.length - 1) {
                            routeSegmentsRef.current.set(routeName, segments);
                            resolve();
                        }
                    }
                );
            }

            if (stops.length === 1) {
                resolve();
            }
        });
    };

    const drawAllRoutesAndStops = (map: google.maps.Map) => {
        for (const [routeName, stops] of Object.entries(ROUTES_CONFIG)) {
            const color = routeName === 'Ruta Original' ? '#4285F4' : '#0F9D58';

            // Dibujar paraderos con AdvancedMarkerElement
            stops.forEach(stop => {
                const pin = new window.google.maps.marker.PinElement({
                    background: color,
                    borderColor: '#fff',
                    glyphColor: '#fff',
                    scale: 0.8
                });

                const marker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: new window.google.maps.LatLng(stop.lat, stop.lng),
                    map,
                    title: `${stop.name} (${routeName})`,
                    content: pin.element
                });

                marker.addListener('click', () => {
                    if (!infoWindowRef.current) {
                        infoWindowRef.current = new window.google.maps.InfoWindow();
                    }
                    const estimatedTime = calculateEstimatedTimeForStop(stop, routeName);
                    infoWindowRef.current.setContent(`
                        <div style="padding: 8px; min-width: 200px;">
                            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${stop.name}</h4>
                            <p style="margin: 0; color: #666;">Próximo bus: ${estimatedTime} min</p>
                            <p style="margin: 0; color: #666; font-size: 0.9em;">Ruta: ${routeName}</p>
                        </div>
                    `);
                    infoWindowRef.current.open({ map, anchor: marker });
                });

                markersRef.current.push(marker);
            });

            // Dibujar rutas reales
            const segments = routeSegmentsRef.current.get(routeName);
            if (segments) {
                segments.forEach(segment => {
                    const polyline = new window.google.maps.Polyline({
                        path: segment.path,
                        strokeColor: color,
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                        map
                    });
                    polylinesRef.current.push(polyline);
                });
            }
        }
    };

    // Función mejorada para encontrar el paradero más cercano usando rutas de caminata reales
    const findOptimalNearestStop = async (userLocation: { lat: number; lng: number }, allStops: any[]): Promise<any> => {
        const directionsService = new window.google.maps.DirectionsService();
        let bestStop = null;
        let minWalkingTime = Infinity;

        console.log('🔍 Buscando paradero más cercano para:', userLocation);
        console.log('📍 Evaluando', allStops.length, 'paraderos disponibles');

        // Usar Promise.allSettled para manejar errores individuales mejor
        const walkingTimePromises = allStops.map(async (stop, index) => {
            return new Promise<{ stop: any; walkingTime: number; index: number }>((resolve) => {
                directionsService.route(
                    {
                        origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                        destination: new window.google.maps.LatLng(stop.lat, stop.lng),
                        travelMode: window.google.maps.TravelMode.WALKING
                    },
                    (result, status) => {
                        if (status === 'OK' && result && result.routes[0] && result.routes[0].legs[0]) {
                            const walkingTime = result.routes[0].legs[0].duration.value; // en segundos
                            const walkingDistance = result.routes[0].legs[0].distance.value; // en metros

                            console.log(`🚶 ${stop.name}: ${Math.round(walkingTime/60)} min (${Math.round(walkingDistance)} m)`);

                            resolve({ stop, walkingTime, index });
                        } else {
                            console.warn(`❌ No se pudo calcular ruta a ${stop.name}, usando distancia recta`);
                            // Fallback: usar distancia recta si la API de Directions falla
                            const straightDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                                new window.google.maps.LatLng(stop.lat, stop.lng)
                            );
                            // Estimar tiempo de caminata: velocidad promedio 5 km/h = 1.39 m/s
                            const estimatedWalkingTime = straightDistance / 1.39;

                            console.log(`🚶 ${stop.name}: ~${Math.round(estimatedWalkingTime/60)} min (estimado, ${Math.round(straightDistance)} m)`);

                            resolve({ stop, walkingTime: estimatedWalkingTime, index });
                        }
                    }
                );
            });
        });

        try {
            const results = await Promise.all(walkingTimePromises);

            // Encontrar el paradero con menor tiempo de caminata
            for (const result of results) {
                if (result.walkingTime < minWalkingTime) {
                    minWalkingTime = result.walkingTime;
                    bestStop = result.stop;
                }
            }

            if (bestStop) {
                console.log(`✅ Mejor paradero encontrado: ${bestStop.name} (${Math.round(minWalkingTime/60)} min caminando)`);
            } else {
                console.warn('❌ No se encontró ningún paradero válido');
            }

        } catch (error) {
            console.error('Error al calcular rutas de caminata:', error);

            // Fallback final: usar el paradero más cercano por distancia recta
            let minDistance = Infinity;
            for (const stop of allStops) {
                const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                    new window.google.maps.LatLng(stop.lat, stop.lng)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    bestStop = stop;
                }
            }
            console.log(`🔄 Usando fallback: ${bestStop?.name} (${Math.round(minDistance)} m en línea recta)`);
        }

        return bestStop;
    };

    const showRouteForSelected = async (routeData: RouteResultData, map: google.maps.Map) => {
        cleanup(map);

        const { userLocation, destinationStop, finalDestination, routeName } = routeData;

        // Recalcular el paradero más cercano usando rutas de caminata precisas
        console.log('🔄 Recalculando paradero más cercano...');
        const routeStops = ROUTES_CONFIG[routeName as keyof typeof ROUTES_CONFIG];
        if (!routeStops) {
            console.error("Ruta no encontrada:", routeName);
            return;
        }

        // Encontrar el paradero más cercano con rutas de caminata reales
        const actualNearestStop = await findOptimalNearestStop(userLocation, routeStops);

        if (!actualNearestStop) {
            console.error("No se pudo encontrar un paradero cercano válido");
            return;
        }

        // Usar el paradero recalculado en lugar del original
        const nearestStop = actualNearestStop;

        const directionsService = new window.google.maps.DirectionsService();

        const colors = {
            walking1: '#FF6B35',
            bus: routeName === 'Ruta Original' ? '#4285F4' : '#30f15c',
            walking2: '#baa53a'
        };

        // 1. Ruta caminando mejorada: Usuario → Paradero más cercano REAL
        console.log(`🚶 Calculando ruta de caminata precisa a: ${nearestStop.name}`);
        const request1 = {
            origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
            destination: new window.google.maps.LatLng(nearestStop.lat, nearestStop.lng),
            travelMode: window.google.maps.TravelMode.WALKING
        };

        directionsService.route(request1, (result, status) => {
            if (status === 'OK' && result) {
                console.log(`✅ Ruta de caminata calculada: ${result.routes[0].legs[0].duration.text} (${result.routes[0].legs[0].distance.text})`);

                const renderer = new window.google.maps.DirectionsRenderer({
                    map: map,
                    directions: result,
                    polylineOptions: {
                        strokeColor: colors.walking1,
                        strokeWeight: 5,
                        strokeOpacity: 0.9
                    },
                    suppressMarkers: true
                });
                directionsRenderersRef.current.push(renderer);
            } else {
                console.error('Error al calcular ruta de caminata:', status);
            }
        });

        // 2. Ruta del bus: Paradero origen → Paradero destino
        const startIndex = routeStops.findIndex(stop =>
            Math.abs(stop.lat - nearestStop.lat) < 0.001 && Math.abs(stop.lng - nearestStop.lng) < 0.001
        );
        const endIndex = routeStops.findIndex(stop =>
            Math.abs(stop.lat - destinationStop.lat) < 0.001 && Math.abs(stop.lng - destinationStop.lng) < 0.001
        );

        if (startIndex === -1 || endIndex === -1) {
            console.error("No se encontraron los paraderos en la ruta");
            return;
        }

        // Si no está cargada la ruta, cargarla
        if (!routeSegmentsRef.current.has(routeName)) {
            await loadRouteSegments(routeName, routeStops);
        }

        // Dibujar toda la ruta del bus con un grosor normal
        const fullRouteSegments = routeSegmentsRef.current.get(routeName);
        if (fullRouteSegments) {
            fullRouteSegments.forEach(segment => {
                const polyline = new window.google.maps.Polyline({
                    path: segment.path,
                    strokeColor: colors.bus,
                    strokeWeight: 4,
                    strokeOpacity: 0.5, // Menor opacidad para la ruta completa
                    map
                });
                polylinesRef.current.push(polyline);
            });
        }

        // Dibujar paraderos del segmento
        const segmentStops = startIndex <= endIndex
            ? routeStops.slice(startIndex, endIndex + 1)
            : [...routeStops.slice(startIndex), ...routeStops.slice(0, endIndex + 1)];

        const color = routeName === 'Ruta Original' ? '#4285F4' : '#0F9D58';
        segmentStops.forEach(stop => {
            const pin = new window.google.maps.marker.PinElement({
                background: color,
                borderColor: '#fff',
                glyphColor: '#fff',
                scale: 0.9
            });
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                position: new window.google.maps.LatLng(stop.lat, stop.lng),
                map,
                title: stop.name,
                content: pin.element
            });

            marker.addListener('click', () => {
                if (!infoWindowRef.current) {
                    infoWindowRef.current = new window.google.maps.InfoWindow();
                }
                const estimatedTime = calculateEstimatedTimeForStop(stop, routeName);
                infoWindowRef.current.setContent(`
                    <div style="padding: 8px; min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; font-weight: bold;">${stop.name}</h4>
                        <p style="margin: 0; color: #666;">Próximo bus: ${estimatedTime} min</p>
                        <p style="margin: 0; color: #666; font-size: 0.9em;">Ruta: ${routeName}</p>
                    </div>
                `);
                infoWindowRef.current.open({ map, anchor: marker });
            });

            markersRef.current.push(marker);
        });

        // Dibujar ruta real del bus con mayor grosor para el segmento seleccionado
        const segments = routeSegmentsRef.current.get(routeName);
        if (segments) {
            const fullStartIndex = routeStops.findIndex(stop =>
                Math.abs(stop.lat - nearestStop.lat) < 0.001 && Math.abs(stop.lng - nearestStop.lng) < 0.001
            );
            const fullEndIndex = routeStops.findIndex(stop =>
                Math.abs(stop.lat - destinationStop.lat) < 0.001 && Math.abs(stop.lng - destinationStop.lng) < 0.001
            );

            if (fullStartIndex !== -1 && fullEndIndex !== -1) {
                const startSeg = fullStartIndex;
                const endSeg = fullEndIndex > fullStartIndex ? fullEndIndex : segments.length;

                for (let i = startSeg; i < endSeg && i < segments.length; i++) {
                    const polyline = new window.google.maps.Polyline({
                        path: segments[i].path,
                        strokeColor: colors.bus,
                        strokeWeight: 6,
                        strokeOpacity: 0.9,
                        map
                    });
                    polylinesRef.current.push(polyline);
                }
            }
        }

        // 3. Ruta caminando: Paradero destino → Destino final
        const request3 = {
            origin: new window.google.maps.LatLng(destinationStop.lat, destinationStop.lng),
            destination: new window.google.maps.LatLng(finalDestination.lat, finalDestination.lng),
            travelMode: window.google.maps.TravelMode.WALKING
        };

        directionsService.route(request3, (result, status) => {
            if (status === 'OK') {
                const renderer = new window.google.maps.DirectionsRenderer({
                    map: map,
                    directions: result,
                    polylineOptions: {
                        strokeColor: colors.walking2,
                        strokeWeight: 4,
                        strokeOpacity: 0.8
                    },
                    suppressMarkers: true
                });
                directionsRenderersRef.current.push(renderer);

                // Marcadores especiales
                const userPin = new window.google.maps.marker.PinElement({
                    background: '#FF0000',
                    borderColor: '#fff',
                    glyph: '🚶',
                });
                const userMarker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                    map: map,
                    title: "Tu ubicación",
                    content: userPin.element
                });
                markersRef.current.push(userMarker);

                const startPin = new window.google.maps.marker.PinElement({
                    background: colors.walking1,
                    borderColor: '#fff',
                    glyph: '🚌',
                    scale: 1.2
                });
                const startMarker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: new window.google.maps.LatLng(nearestStop.lat, nearestStop.lng),
                    map: map,
                    title: `Subir aquí: ${nearestStop.name}`,
                    content: startPin.element
                });
                markersRef.current.push(startMarker);

                const endPin = new window.google.maps.marker.PinElement({
                    background: colors.bus,
                    borderColor: '#d30c0c',
                    glyph: '🚏',
                });
                const endMarker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: new window.google.maps.LatLng(destinationStop.lat, destinationStop.lng),
                    map: map,
                    title: `Bajar aquí: ${destinationStop.name}`,
                    content: endPin.element
                });
                markersRef.current.push(endMarker);

                const finalPin = new window.google.maps.marker.PinElement({
                    background: colors.walking2,
                    borderColor: '#1441b3',
                    glyph: '🏁',
                });
                const finalMarker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: new window.google.maps.LatLng(finalDestination.lat, finalDestination.lng),
                    map: map,
                    title: finalDestination.name,
                    content: finalPin.element
                });
                markersRef.current.push(finalMarker);

                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
                bounds.extend(new window.google.maps.LatLng(finalDestination.lat, finalDestination.lng));
                map.fitBounds(bounds);
            }
        });

        // Iniciar simulación SOLO para esta ruta
        startBusSimulation(map, routeName);
    };

    const startBusSimulation = (map: google.maps.Map, targetRoute: string | null) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        busesRef.current.clear();

        const routesToSimulate = targetRoute ? [targetRoute] : Array.from(routeSegmentsRef.current.keys());

        routesToSimulate.forEach(routeName => {
            const segments = routeSegmentsRef.current.get(routeName);
            if (!segments || segments.length === 0) return;

            for (let i = 0; i < 2; i++) {
                const busId = `${routeName}-bus-${i}`;
                // Bus 0 empieza en el primer segmento, Bus 1 en la mitad
                const initialSegment = i === 0 ? 0 : Math.floor(segments.length / 2);

                busesRef.current.set(busId, {
                    routeName,
                    currentSegment: initialSegment,
                    progress: 0,
                    isWaiting: false,
                    waitStartTime: 0,
                    segments
                });
            }
        });

        animateBuses(map);
    };

    const animateBuses = (map: google.maps.Map) => {
        const now = Date.now();

        busesRef.current.forEach((bus, busId) => {
            if (bus.isWaiting) {
                if (now - bus.waitStartTime >= STOP_WAIT_TIME) {
                    bus.isWaiting = false;
                } else {
                    return;
                }
            }

            const segments = bus.segments;
            if (bus.currentSegment >= segments.length) {
                bus.currentSegment = 0;
                bus.progress = 0;
            }

            const currentSegment = segments[bus.currentSegment];
            const path = currentSegment.path;

            if (path.length < 2) {
                bus.currentSegment++;
                bus.progress = 0;
                return;
            }

            // Calcular distancia total del segmento actual
            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                totalDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
            }

            // Distancia recorrida en este segmento
            const distanceCovered = bus.progress * totalDistance;
            const timeStep = 0.1; // segundos
            const newDistanceCovered = distanceCovered + BUS_SPEED_MPS * timeStep;

            if (newDistanceCovered >= totalDistance) {
                // Llegó al final del segmento
                bus.currentSegment++;
                bus.progress = 0;
                bus.isWaiting = true;
                bus.waitStartTime = now;

                // Si es el último segmento, volver al inicio
                if (bus.currentSegment >= segments.length) {
                    bus.currentSegment = 0;
                }
            } else {
                bus.progress = newDistanceCovered / totalDistance;
            }

            // Calcular posición real en el path
            let accumulatedDistance = 0;
            let position = path[0];

            for (let i = 0; i < path.length - 1; i++) {
                const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
                if (accumulatedDistance + segmentDistance >= newDistanceCovered) {
                    const ratio = (newDistanceCovered - accumulatedDistance) / segmentDistance;
                    position = interpolateLatLng(path[i], path[i + 1], ratio);
                    break;
                }
                accumulatedDistance += segmentDistance;
            }

            // Actualizar marcador del bus
            let busMarker = busesRef.current.get(busId)?.marker;
            if (!busMarker) {
                const busPin = new window.google.maps.marker.PinElement({
                    background: bus.routeName === 'Ruta Original' ? '#4285F4' : '#0F9D58',
                    borderColor: 'white',
                    glyph: '🚌',
                    scale: 1.2
                });
                busMarker = new window.google.maps.marker.AdvancedMarkerElement({
                    position: position,
                    map: map,
                    content: busPin.element,
                    title: `Bus ${bus.routeName}`
                });
                busesRef.current.set(busId, { ...bus, marker: busMarker });
            } else {
                busMarker.position = position;
            }
        });

        animationRef.current = requestAnimationFrame(() => animateBuses(map));
    };

    const interpolateLatLng = (start: google.maps.LatLng, end: google.maps.LatLng, ratio: number): google.maps.LatLng => {
        return new google.maps.LatLng(
            start.lat() + (end.lat() - start.lat()) * ratio,
            start.lng() + (end.lng() - start.lng()) * ratio
        );
    };

    const calculateEstimatedTimeForStop = (targetStop: { lat: number; lng: number; name: string }, routeName: string): number => {
        let minTime = Infinity;

        busesRef.current.forEach((bus) => {
            if (bus.routeName !== routeName) return;

            const segments = bus.segments;
            let totalTime = 0;
            let foundTarget = false;

            for (let segIndex = bus.currentSegment; segIndex < bus.currentSegment + segments.length; segIndex++) {
                const currentSegIndex = segIndex % segments.length;
                const segment = segments[currentSegIndex];

                const isDestination = Math.abs(segment.destination.lat - targetStop.lat) < 0.001 && Math.abs(segment.destination.lng - targetStop.lng) < 0.001;
                const isOrigin = Math.abs(segment.origin.lat - targetStop.lat) < 0.001 && Math.abs(segment.origin.lng - targetStop.lng) < 0.001;

                if (segIndex === bus.currentSegment) {
                    if (isOrigin) {
                        minTime = Math.min(minTime, totalTime);
                        foundTarget = true;
                        break;
                    }
                    const remainingRatio = 1 - bus.progress;
                    const remainingTime = (segment.duration * remainingRatio) / 60;
                    totalTime += remainingTime;
                    if (bus.isWaiting) totalTime += STOP_WAIT_TIME / 60000;

                    if (isDestination) {
                        minTime = Math.min(minTime, totalTime);
                        foundTarget = true;
                        break;
                    }
                } else {
                    const segmentTime = segment.duration > 0 ? segment.duration / 60 : (segment.distance / 1000) / 20 * 60;
                    totalTime += segmentTime + (STOP_WAIT_TIME / 60000);

                    if (isDestination) {
                        minTime = Math.min(minTime, totalTime);
                        foundTarget = true;
                        break;
                    }
                }
            }
        });

        return minTime === Infinity ? 5 : Math.ceil(minTime);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-bold">🚍 Tu Ruta</CardTitle>
                <CardDescription>Visualización completa de tu trayecto</CardDescription>
                {routeInfo && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="flex items-center bg-orange-100 px-2 py-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                                Caminar al bus
                            </span>
                            <span className="flex items-center bg-blue-100 px-2 py-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                Ruta del bus
                            </span>
                            <span className="flex items-center bg-green-100 px-2 py-1 rounded">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                Caminar al destino
                            </span>
                        </div>
                    </div>
                )}
                {userLocation && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => {
                            if (mapRef.current && window.google?.maps) {
                                const map = new window.google.maps.Map(mapRef.current, {
                                    center: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                                    zoom: 16
                                });
                                if (routeInfo) {
                                    showRouteForSelected(routeInfo, map);
                                } else {
                                    loadAndShowAllRoutes(map);
                                }
                            }
                        }}
                    >
                        📍 Centrar en mí
                    </Button>
                )}
            </CardHeader>
            <CardContent className="relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
                        <div className="text-center p-6">
                            <p className="text-gray-600 mb-2">Cargando rutas y paraderos...</p>
                            <p className="text-sm text-gray-500">Por favor espera unos segundos</p>
                        </div>
                    </div>
                )}
                <div
                    ref={mapRef}
                    style={{
                        width: "100%",
                        height: "500px",
                        borderRadius: "8px",
                    }}
                />
            </CardContent>
        </Card>
    );
}