"use client"

import { useState, useEffect, useRef, useCallback  } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, CreditCard, Smartphone, Route, Clock } from "lucide-react"
import MapaRutas from "@/components/mapa-rutas";
import { Wallet, Ticket } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { QRCodeCanvas } from 'qrcode.react';
import { Plane } from "lucide-react";

interface Stop {
    lat: number
    lng: number
    name: string
    routes: string[]
    estimatedTime?: number
}

interface Route {
    id: string
    name: string
    fare: number
    color: string
}

interface RouteResult {
    nearestStop: Stop
    destinationStop: Stop
    walkingToStopDistance: number
    walkingFromStopDistance: number
    totalTime: number
    routeName: string
    destination: {
        lat: number
        lng: number
        name: string
    }
}

const API_URL = "https://sendero.clean-air-chicago.com/pasaje/1";
const QR_BASE_URL = "https://sendero.clean-air-chicago.com/pago";

export default function PassengerPanel() {
    const [destination, setDestination] = useState("")
    const [nearestStop, setNearestStop] = useState<Stop | null>(null)
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
    const [activeTab, setActiveTab] = useState("search")
    const [isSearching, setIsSearching] = useState(false)
    const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
    

    const [tickets, setTickets] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [qrValue, setQrValue] = useState("");

    // Definimos las paradas y rutas
    const stops: Stop[] = [
        // Ruta Original
        { lat: 4.119962, lng: -73.565602, name: "Paradero San Antonio 📌", routes: ["Ruta Original"], estimatedTime: 5 },
        { lat: 4.128293, lng: -73.568883, name: "Paradero Camino Ganadero 📌", routes: ["Ruta Original"], estimatedTime: 8 },
        { lat: 4.132105, lng: -73.565558, name: "Paradero Hotel Campanario 📌", routes: ["Ruta Original"], estimatedTime: 12 },
        { lat: 4.138859, lng: -73.594127, name: "Paradero Avenida Catama 📌", routes: ["Ruta Original"], estimatedTime: 15 },
        { lat: 4.149229, lng: -73.628838, name: "Paradero Hotel Rosada 📌", routes: ["Ruta Original"], estimatedTime: 18 },
        { lat: 4.149168, lng: -73.635393, name: "Paradero Parque del Hacha 📌", routes: ["Ruta Original"], estimatedTime: 20 },
        { lat: 4.146900, lng: -73.636694, name: "Paradero Parque de los estudiantes 📌", routes: ["Ruta Original"], estimatedTime: 22 },
        { lat: 4.145042, lng: -73.637872, name: "Paradero La Fiscalia 📌", routes: ["Ruta Original"], estimatedTime: 25 },
        { lat: 4.143898, lng: -73.637490, name: "Paradero Clinica Meta 📌", routes: ["Ruta Original"], estimatedTime: 27 },
        { lat: 4.146778, lng: -73.639070, name: "Paradero Clinica Martha 📌", routes: ["Ruta Original"], estimatedTime: 30 },
        { lat: 4.149314, lng: -73.639233, name: "Paradero Clinica San Ignacio 📌", routes: ["Ruta Original"], estimatedTime: 32 },
        { lat: 4.145893, lng: -73.642111, name: "Paradero Unillanos 📌", routes: ["Ruta Original"], estimatedTime: 35 },
        { lat: 4.144452, lng: -73.643401, name: "Paradero Hospital de Departamental 📌", routes: ["Ruta Original"], estimatedTime: 38 },

        // Ruta Nueva
        { lat: 4.144452, lng: -73.643401, name: "Paradero Hospital de Departamental 📌", routes: ["Ruta Nueva"], estimatedTime: 5 },
        { lat: 4.145995, lng: -73.639693, name: "Paradero JamesTown 📌", routes: ["Ruta Nueva"], estimatedTime: 8 },
        { lat: 4.145807, lng: -73.635663, name: "Paradero La Bascula 📌", routes: ["Ruta Nueva"], estimatedTime: 12 },
        { lat: 4.143342, lng: -73.633646, name: "Paradero Unicentro 📌", routes: ["Ruta Nueva"], estimatedTime: 15 },
        { lat: 4.128320, lng: -73.622222, name: "Paradero Makro 📌", routes: ["Ruta Nueva"], estimatedTime: 18 },
        { lat: 4.124150, lng: -73.619062, name: "Paradero La Alborada 📌", routes: ["Ruta Nueva"], estimatedTime: 20 },
        { lat: 4.115587, lng: -73.609647, name: "Paradero Universidad Cooperativa de Colombia 📌", routes: ["Ruta Nueva"], estimatedTime: 22 },
        { lat: 4.116238, lng: -73.597437, name: "Paradero Gaviotas 📌", routes: ["Ruta Nueva"], estimatedTime: 25 },
        { lat: 4.116759, lng: -73.587668, name: "Paradero Kirpas 📌", routes: ["Ruta Nueva"], estimatedTime: 27 },
        { lat: 4.124877, lng: -73.575490, name: "Paradero Malocas 📌", routes: ["Ruta Nueva"], estimatedTime: 30 },
        { lat: 4.128078, lng: -73.569144, name: "Paradero Camino Ganadero 📌", routes: ["Ruta Nueva"], estimatedTime: 32 },
        { lat: 4.125908, lng: -73.564518, name: "Paradero San Antonio 📌", routes: ["Ruta Nueva"], estimatedTime: 35 },
    ]

    const routes: Route[] = [
        { id: "1", name: "Ruta Original", fare: 2500, color: "blue" },
        { id: "2", name: "Ruta Nueva", fare: 2000, color: "green" },
    ]

    // Obtener ubicación del usuario (solo una vez)
    useEffect(() => {
        getUserLocation().catch(console.error);
    }, []);

    // Inicializar Autocompletado de Google Places
    useEffect(() => {
        if (!window.google?.maps?.places) {
            const timer = setTimeout(() => {
                if (window.google?.maps?.places) {
                    initAutocomplete();
                }
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            initAutocomplete();
        }
    }, []);

    const initAutocomplete = () => {
        const input = document.getElementById("destination") as HTMLInputElement;
        if (!input) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(input, {
            types: ["establishment", "address"],
            componentRestrictions: { country: "co" },
            fields: ["formatted_address", "geometry", "name"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place?.geometry?.location) {
                setDestination(place.formatted_address || place.name || "");
            }
        });
    };

    // Obtener ubicación del usuario
    const getUserLocation = (): Promise<{lat: number, lng: number}> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocalización no soportada"))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setUserLocation(location)
                    resolve(location)
                },
                (error) => {
                    reject(new Error(`Error obteniendo ubicación: ${error.message}`))
                }
            )
        })
    }

    // Calcular distancia entre dos puntos
    const calculateDistance = (pos1: {lat: number, lng: number}, pos2: {lat: number, lng: number}): number => {
        const R = 6371
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c * 1000
    }

    // Geocodificar dirección
    const geocodeAddress = async (address: string): Promise<{lat: number, lng: number, name: string}> => {
        return new Promise((resolve, reject) => {
            if (!window.google?.maps?.Geocoder) {
                reject(new Error("Google Maps API no está disponible"))
                return
            }

            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode(
                {
                    address: address + ", Villavicencio, Meta, Colombia",
                    region: "CO"
                },
                (results, status) => {
                    if (status === "OK" && results && results[0]) {
                        const location = results[0].geometry.location
                        resolve({
                            lat: location.lat(),
                            lng: location.lng(),
                            name: results[0].formatted_address
                        })
                    } else {
                        reject(new Error("No se pudo encontrar la dirección"))
                    }
                }
            )
        })
    }

    // Encontrar el paradero más cercano
    const findNearestStop = (location: {lat: number, lng: number}): Stop => {
        return stops.reduce((nearest, stop) => {
            const currentDistance = calculateDistance(location, stop)
            const nearestDistance = calculateDistance(location, nearest)
            return currentDistance < nearestDistance ? stop : nearest
        }, stops[0])
    }

    // Encontrar el mejor paradero para bajarse (solo paraderos posteriores)
    const findBestDestinationStop = (destination: {lat: number, lng: number}, userStop: Stop, routeName: string): Stop | null => {
        const routeStops = stops.filter(stop => stop.routes.includes(routeName))
        const userStopIndex = routeStops.findIndex(stop =>
            stop.name === userStop.name &&
            Math.abs(stop.lat - userStop.lat) < 0.0001 &&
            Math.abs(stop.lng - userStop.lng) < 0.0001
        )

        if (userStopIndex === -1) return null

        const forwardStops = routeStops.slice(userStopIndex + 1)
        if (forwardStops.length === 0) return null

        return forwardStops.reduce((best, stop) => {
            const currentDistance = calculateDistance(destination, stop)
            const bestDistance = calculateDistance(destination, best)
            return currentDistance < bestDistance ? stop : best
        }, forwardStops[0])
    }

    // Buscar ruta
    const handleSearchRoute = async () => {
        if (!destination.trim()) {
            alert("Por favor ingresa un destino")
            return
        }

        if (!userLocation) {
            alert("Obteniendo tu ubicación... Intenta de nuevo en unos segundos.")
            return
        }

        setIsSearching(true)

        try {
            const destinationCoords = await geocodeAddress(destination)
            const nearestUserStop = findNearestStop(userLocation)
            const availableRoutes = nearestUserStop.routes

            let bestRoute: RouteResult | null = null
            let shortestWalkingDistance = Infinity

            for (const routeName of availableRoutes) {
                const bestDestStop = findBestDestinationStop(destinationCoords, nearestUserStop, routeName)
                if (!bestDestStop) continue

                const walkingToStop = calculateDistance(userLocation, nearestUserStop)
                const walkingFromStop = calculateDistance(bestDestStop, destinationCoords)
                const totalWalking = walkingToStop + walkingFromStop

                if (totalWalking < shortestWalkingDistance) {
                    shortestWalkingDistance = totalWalking
                    bestRoute = {
                        nearestStop: nearestUserStop,
                        destinationStop: bestDestStop,
                        walkingToStopDistance: walkingToStop,
                        walkingFromStopDistance: walkingFromStop,
                        totalTime: Math.ceil((walkingToStop + walkingFromStop) / 83) + 15,
                        routeName: routeName,
                        destination: destinationCoords
                    }
                }
            }

            if (bestRoute) {
                setRouteResult(bestRoute)
                setActiveTab("map")

                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('showCompleteRoute', {
                        detail: {
                            userLocation,
                            nearestStop: bestRoute.nearestStop,
                            destinationStop: bestRoute.destinationStop,
                            finalDestination: bestRoute.destination,
                            routeName: bestRoute.routeName
                        }
                    }))
                }, 500)
            } else {
                alert("No se encontró una ruta válida. El destino podría estar antes del paradero más cercano en la dirección de la ruta.")
            }

        } catch (error) {
            console.error("Error buscando ruta:", error)
        }

        setIsSearching(false)
    }

    const handleRouteSelect = (route: Route) => {
        setSelectedRoute(route)
    }

//// PAGOS ////

interface FareZone {
    id: string;
    name: string;
    fare: number;
}


const [balance, setBalance] = useState(0);
    const [selectedFareZone, setSelectedFareZone] = useState('1');
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // --- DATOS Y VARIABLES ---
    const fareZones: FareZone[] = [
        { id: '1', name: 'Zona Urbana', fare: 3000 },
        { id: '2', name: 'Zona Puerto Lopez', fare: 3100 }
    ];
    
    const currentZone = fareZones.find(z => z.id === selectedFareZone);
    const totalCost = (currentZone?.fare || 0) * ticketQuantity;

    // --- LÓGICA DE PETICIONES (HOOKS) ---

    // Función para obtener el saldo (GET)
    const fetchBalance = useCallback(async () => {
        try {
            const response = await fetch('https://sendero.clean-air-chicago.com/usuario/1');
            if (!response.ok) {
                throw new Error('No se pudo obtener el saldo del usuario.');
            }
            const data = await response.json();
            setBalance(data.saldo);
        } catch (error) {
            console.error("Error al obtener el saldo:", error);
            alert("No se pudo conectar con el servidor para obtener el saldo.");
        }
    }, []);

    // Efecto para llamar a fetchBalance una vez al cargar el componente
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // --- FUNCIONES MANEJADORAS (HANDLERS) ---

    // Abre el modal de confirmación
    const handlePurchase = async () => {
    if (balance < totalCost) {
        alert("Saldo insuficiente. Por favor, recargue su cuenta.");
        setShowConfirmation(false);
        return;
    }

    // Create a list of purchaseData objects
    const purchaseDataList = Array.from({ length: ticketQuantity }, () => ({
        estado: true,
        usuario: { usuarioId: "1" },
        tarifa: { tarifaId: selectedFareZone }
    }));

    try {
        const response = await fetch('https://sendero.clean-air-chicago.com/pasaje/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseDataList), // Send the list
        });

        if (!response.ok) {
            throw new Error('La compra falló en el servidor.');
        }

        alert('¡Compra realizada con éxito!');
        await fetchBalance();

    } catch (error) {
        console.error("Error al realizar la compra:", error);
        alert("No se pudo completar la compra. Inténtelo de nuevo.");
    } finally {
        setShowConfirmation(false);
    }
};



// Pasajes


useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('No se pudo obtener la información de los pasajes.');
                }
                const data = await response.json();
                setTickets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Función para manejar el botón "Ver QR"
    const handleViewQR = (pasajeId, token) => {
        const qrLink = `${QR_BASE_URL}?conductorId=1&pasajeId=${pasajeId}&token=${token}`;
        setQrValue(qrLink);
        setModalOpen(true);
    };

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Cargando pasajes...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-destructive">Error: {error}</div>;
    }

    const ticketZones = Object.keys(tickets);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Panel del Pasajero</h2>
                    <p className="text-muted-foreground">Encuentra tu ruta y realiza pagos digitales</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="search">Buscar Ruta</TabsTrigger>
                    <TabsTrigger value="map">Mapa</TabsTrigger>
                    <TabsTrigger value="payment">Pago</TabsTrigger>
                    <TabsTrigger value="tickets">Pasajes</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                    {routeResult && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-green-800">
                                    <Route className="h-5 w-5" />
                                    <span>Ruta Encontrada</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">1. Caminar al paradero</h4>
                                        <p className="text-sm">{routeResult.nearestStop.name}</p>
                                        <p className="text-xs text-gray-600">
                                            📍 {Math.round(routeResult.walkingToStopDistance)}m - {Math.ceil(routeResult.walkingToStopDistance / 83)} min
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">2. Tomar bus</h4>
                                        <p className="text-sm font-medium text-blue-600">{routeResult.routeName}</p>
                                        <p className="text-xs text-gray-600">🚌 Bajar en: {routeResult.destinationStop.name}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">3. Caminar al destino</h4>
                                        <p className="text-sm">{routeResult.destination.name}</p>
                                        <p className="text-xs text-gray-600">
                                            📍 {Math.round(routeResult.walkingFromStopDistance)}m - {Math.ceil(routeResult.walkingFromStopDistance / 83)} min
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">Tiempo total</h4>
                                        <p className="text-lg font-bold text-green-600 flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {routeResult.totalTime} minutos
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setActiveTab("map")}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    Ver Ruta en Mapa
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>¿A dónde quieres ir?</CardTitle>
                            <CardDescription>Ingresa tu destino para encontrar la mejor ruta</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destino</Label>
                                <Input
                                    id="destination"
                                    placeholder="Ej: Centro Comercial, Hospital..."
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchRoute()}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleSearchRoute}
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Buscar Ruta
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {nearestStop && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Navigation className="h-5 w-5 text-primary" />
                                    <span>Rutas Disponibles</span>
                                </CardTitle>
                                <CardDescription>Desde {nearestStop.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {nearestStop.routes.map((routeName) => {
                                    const route = routes.find((r) => r.name === routeName)
                                    return route ? (
                                        <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full bg-${route.color}-500`}></div>
                                                <div>
                                                    <span className="font-medium">{route.name}</span>
                                                    <p className="text-sm text-muted-foreground">
                                                        Próximo bus en {nearestStop.estimatedTime} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-muted-foreground">${route.fare.toLocaleString()}</span>
                                                <Button size="sm" onClick={() => handleRouteSelect(route)}>
                                                    Seleccionar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null
                                })}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="map" className="space-y-4">
                    <MapaRutas userLocation={userLocation} />
                </TabsContent>

                
                <TabsContent value="payment" className="space-y-4">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Wallet className="h-5 w-5" />
                        <span>Recargar Saldo y Comprar Pasajes</span>
                    </CardTitle>
                    <CardDescription>Gestiona tu saldo y compra tus pasajes aquí.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    {/* Saldo y Botón de Recarga */}
                    <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                        <Button onClick={() => alert('Funcionalidad de recarga no implementada.')}>
                        Recargar Cuenta
                        </Button>
                        <div className="text-right">
                        <Label className="text-xs text-muted-foreground">Saldo Actual</Label>
                        <p className="text-xl font-bold">
                            {balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </p>
                        </div>
                    </div>
                    
                    {/* Selector de Tarifa */}
                    <div className="space-y-2">
                        <Label htmlFor="fare-zone">Selecciona la zona</Label>
                        <div className="flex items-center gap-4">
                        <select
                            id="fare-zone"
                            value={selectedFareZone}
                            onChange={(e) => setSelectedFareZone(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            {fareZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                                {zone.name}
                            </option>
                            ))}
                        </select>
                        {currentZone && (
                            <div className="p-2 border rounded-md whitespace-nowrap bg-secondary">
                            <span className="font-semibold text-secondary-foreground">
                                Tarifa: {currentZone.fare.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                            </span>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Selector de Cantidad */}
                    <div className="space-y-2">
                        <Label htmlFor="ticket-quantity">Cantidad de Pasajes</Label>
                        <Input
                        id="ticket-quantity"
                        type="number"
                        min="1"
                        value={ticketQuantity}
                        onChange={(e) => setTicketQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full"
                        />
                    </div>

                    {/* Resumen y Botón de Compra */}
                    <div className="p-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total a Pagar:</span>
                        <span className="text-2xl font-bold text-primary">
                            {totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </span>
                        </div>
                        <div className="flex justify-end">
                        {/* El botón ahora abre el modal */}
                        <Button size="lg" onClick={() => setShowConfirmation(true)} disabled={!currentZone}>
                            <Ticket className="mr-2 h-5 w-5" /> Comprar
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                {/* Modal de Confirmación de Pago */}
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Compra</DialogTitle>
                        <DialogDescription>
                        Estás a punto de comprar **{ticketQuantity}** pasaje(s) por un total de **{totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}**.
                        <br />
                        Tu saldo actual es de **{balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}**.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                        Cancelar
                        </Button>
                        <Button onClick={handlePurchase} disabled={balance < totalCost}>
                        Confirmar Pago
                        </Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
                </TabsContent>
                
                

                <TabsContent value="tickets" className="space-y-4">
            <h1 className="text-2xl font-bold">Mis Pasajes</h1>
            
            {ticketZones.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                    No tienes pasajes disponibles.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ticketZones.map(zone => (
                        <Card key={zone}>
                            <CardHeader>
                                <CardTitle className="capitalize flex items-center space-x-2">
                                    <Plane className="h-5 w-5" />
                                    <span>Pasajes para {zone}</span>
                                </CardTitle>
                                <CardDescription>
                                    Pasajes disponibles para la zona de {zone}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <div className="text-4xl font-extrabold text-primary">
                                    {tickets[zone].cantidad}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Pasaje(s) restante(s)
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleViewQR(tickets[zone].pasajeId, tickets[zone].token)}
                                >
                                    <Ticket className="mr-2 h-4 w-4" />
                                    Ver QR
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal para el código QR */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[350px] p-6 text-center">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Código QR del Pasaje</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center my-4">
                        <QRCodeCanvas
                            value={qrValue}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                        {qrValue}
                    </div>
                </DialogContent>
            </Dialog>
        </TabsContent>
            </Tabs>
        </div>
    )
}