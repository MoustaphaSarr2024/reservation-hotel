import { useLoaderData, Link, useSearchParams } from "react-router";
import { API_URL } from "~/config";
import type { Route } from "./+types/rooms";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Room {
    id: number;
    name: string;
    description: string;
    capacity: number;
    price: string;
    imageUrl: string | null;
    isAvailable?: boolean;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    let apiUrl = `${API_URL}/api/rooms`;
    if (dateFrom && dateTo) {
        apiUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const rooms: Room[] = await response.json();
        return { rooms, dateFrom, dateTo };
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return { rooms: [], dateFrom: null, dateTo: null };
    }
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Nos Chambres - Hôtel Kaay dalou" },
        { name: "description", content: "Découvrez nos chambres confortables et luxueuses." },
    ];
}

export default function Rooms({ loaderData }: Route.ComponentProps) {
    const { rooms, dateFrom, dateTo } = loaderData;
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("success") === "true") {
            const previewUrl = searchParams.get("previewUrl");
            toast.success(
                (t) => (
                    <span>
                        Réservation effectuée !<br />
                        {previewUrl && (
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                                Voir l'email
                            </a>
                        )}
                    </span>
                ),
                { duration: 5000 }
            );

            const newParams = new URLSearchParams(searchParams);
            newParams.delete("success");
            newParams.delete("previewUrl");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(e.target.name, e.target.value);
        setSearchParams(newParams);
    };

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Nos Chambres
                    </h2>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        Choisissez l'hébergement parfait pour votre séjour.
                    </p>
                </div>

                <div className="mt-8 max-w-xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vérifier la disponibilité</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Arrivée</label>
                            <input
                                type="date"
                                name="dateFrom"
                                id="dateFrom"
                                defaultValue={dateFrom || ""}
                                onChange={handleDateChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Départ</label>
                            <input
                                type="date"
                                name="dateTo"
                                id="dateTo"
                                defaultValue={dateTo || ""}
                                onChange={handleDateChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div key={room.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
                            {dateFrom && dateTo && (
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-md ${room.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                    {room.isAvailable ? "Disponible" : "Indisponible"}
                                </div>
                            )}

                            <div className="flex-shrink-0">
                                <img
                                    className="h-48 w-full object-cover"
                                    src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                    alt={room.name}
                                />
                            </div>
                            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {room.name}
                                        </h3>
                                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {room.capacity} Pers.
                                        </span>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        {room.description}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-lg font-bold text-gray-900">
                                        {room.price}€ <span className="text-sm font-normal text-gray-500">/ nuit</span>
                                    </div>
                                    <Link
                                        to={room.isAvailable !== false ? `/rooms/${room.id}?dateFrom=${dateFrom || ""}&dateTo=${dateTo || ""}` : "#"}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${room.isAvailable === false ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                                        onClick={(e) => { if (room.isAvailable === false) e.preventDefault(); }}
                                    >
                                        {room.isAvailable === false ? "Indisponible" : "Réserver"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
