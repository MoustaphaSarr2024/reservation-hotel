import { useLoaderData, Form, useActionData, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/room-details";

interface Room {
    id: number;
    name: string;
    description: string;
    capacity: number;
    price: string;
    imageUrl: string | null;
}

export async function loader({ params }: Route.LoaderArgs) {
    try {
        const response = await fetch(`http://localhost:3000/api/rooms`);
        if (!response.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const rooms: Room[] = await response.json();
        const room = rooms.find((r) => r.id === parseInt(params.id));

        if (!room) {
            throw new Response("Not Found", { status: 404 });
        }

        return { room };
    } catch (error) {
        throw new Response("Error fetching room", { status: 500 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const guestName = formData.get("guestName");
    const guestEmail = formData.get("guestEmail");
    const phoneNumber = formData.get("phoneNumber");
    const dateOfBirth = formData.get("dateOfBirth");
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const roomId = params.id;

    try {
        const response = await fetch("http://localhost:3000/api/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                guestName,
                guestEmail,
                phoneNumber,
                dateOfBirth,
                roomId: parseInt(roomId!),
                dateFrom,
                dateTo,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.message || "Erreur lors de la réservation" };
        }

        const responseData = await response.json();
        const previewUrl = responseData.previewUrl;
        return redirect(`/rooms?success=true${previewUrl ? `&previewUrl=${encodeURIComponent(previewUrl)}` : ""}`);
    } catch (error) {
        return { error: "Erreur de connexion au serveur" };
    }
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: `${data?.room.name} - Réserver - Hôtel Kaay dalou` },
        { name: "description", content: `Réservez la chambre ${data?.room.name}` },
    ];
}

export default function RoomDetails({ loaderData, actionData }: Route.ComponentProps) {
    const { room } = loaderData;
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image Gallery */}
                    <div className="flex flex-col">
                        <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                            <img
                                src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                alt={room.name}
                                className="w-full h-full object-center object-cover"
                            />
                        </div>
                    </div>

                    {/* Room Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{room.name}</h1>
                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-gray-900">{room.price}€ <span className="text-lg text-gray-500">/ nuit</span></p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                <p>{room.description}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span className="ml-2 text-sm text-gray-500">Capacité : {room.capacity} personnes</span>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <h3 className="text-lg font-medium text-gray-900">Réserver cette chambre</h3>

                            {actionData?.error && (
                                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{actionData.error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Form method="post" className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                                        Nom complet
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="guestName"
                                            id="guestName"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="email"
                                            name="guestEmail"
                                            id="guestEmail"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Numéro de téléphone
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                        Date de naissance
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            id="dateOfBirth"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
                                        Date d'arrivée
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="date"
                                            name="dateFrom"
                                            id="dateFrom"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
                                        Date de départ
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="date"
                                            name="dateTo"
                                            id="dateTo"
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                    >
                                        {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
