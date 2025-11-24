import { useLoaderData, Link, useSearchParams } from "react-router";
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
}

export async function loader() {
    try {
        const response = await fetch("http://localhost:3000/api/rooms");
        if (!response.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const rooms: Room[] = await response.json();
        return { rooms };
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return { rooms: [] };
    }
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Nos Chambres - Hôtel Kaay dalou" },
        { name: "description", content: "Découvrez nos chambres confortables et luxueuses." },
    ];
}

export default function Rooms({ loaderData }: Route.ComponentProps) {
    const { rooms } = loaderData;
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("success") === "true") {
            toast.success("Réservation effectuée avec succès !");
        }
    }, [searchParams]);

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

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div key={room.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                                        to={`/rooms/${room.id}`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Réserver
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
