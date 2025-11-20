import { useLoaderData, Form, useActionData, useNavigation, useSubmit } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin";

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
        if (!response.ok) throw new Error("Failed to fetch rooms");
        const rooms: Room[] = await response.json();
        return { rooms };
    } catch (error) {
        return { rooms: [] };
    }
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        const id = formData.get("id");
        await fetch(`http://localhost:3000/api/rooms/${id}`, { method: "DELETE" });
        return { success: true };
    }

    if (intent === "create") {
        const name = formData.get("name");
        const description = formData.get("description");
        const capacity = formData.get("capacity");
        const price = formData.get("price");
        const imageUrl = formData.get("imageUrl");

        await fetch("http://localhost:3000/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, capacity: Number(capacity), price: Number(price), imageUrl }),
        });
        return { success: true };
    }

    return null;
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Administration - Hôtel Kaay dalou" }];
}

export default function Admin({ loaderData }: Route.ComponentProps) {
    const { rooms } = loaderData;
    const [isCreating, setIsCreating] = useState(false);
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Chambres</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    {isCreating ? "Annuler" : "Ajouter une chambre"}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Nouvelle Chambre</h2>
                    <Form method="post" className="space-y-4" onSubmit={() => setIsCreating(false)}>
                        <input type="hidden" name="intent" value="create" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                                <input type="number" name="price" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Capacité</label>
                                <input type="number" name="capacity" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input type="url" name="imageUrl" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="https://..." />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                Sauvegarder
                            </button>
                        </div>
                    </Form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {rooms.map((room) => (
                        <li key={room.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                    <img className="h-12 w-12 rounded-full object-cover" src={room.imageUrl || "https://via.placeholder.com/150"} alt="" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-blue-600">{room.name}</div>
                                    <div className="text-sm text-gray-500">{room.price}€ - {room.capacity} pers.</div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Form method="post" onSubmit={(e) => !confirm("Êtes-vous sûr ?") && e.preventDefault()}>
                                    <input type="hidden" name="intent" value="delete" />
                                    <input type="hidden" name="id" value={room.id} />
                                    <button type="submit" className="text-red-600 hover:text-red-900">Supprimer</button>
                                </Form>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
