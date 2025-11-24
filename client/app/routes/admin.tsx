import { useLoaderData, Form, useActionData, useNavigation, useSubmit, useNavigate } from "react-router";
import { useState, useEffect } from "react";
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

    if (intent === "create" || intent === "update") {
        const name = formData.get("name");
        const description = formData.get("description");
        const capacity = formData.get("capacity");
        const price = formData.get("price");
        const imageUrl = formData.get("imageUrl");

        const body = JSON.stringify({ name, description, capacity: Number(capacity), price: Number(price), imageUrl });
        const headers = { "Content-Type": "application/json" };

        if (intent === "create") {
            await fetch("http://localhost:3000/api/rooms", {
                method: "POST",
                headers,
                body,
            });
        } else {
            const id = formData.get("id");
            await fetch(`http://localhost:3000/api/rooms/${id}`, {
                method: "PUT",
                headers,
                body,
            });
        }
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
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        if (!isSubmitting) {
            setIsCreating(false);
            setEditingRoom(null);
        }
    }, [isSubmitting]);

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingRoom(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gestion des Chambres</h1>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Ajouter une chambre
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingRoom ? "Modifier la Chambre" : "Nouvelle Chambre"}
                    </h2>
                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value={editingRoom ? "update" : "create"} />
                        {editingRoom && <input type="hidden" name="id" value={editingRoom.id} />}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingRoom?.name}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                                <input
                                    type="number"
                                    name="price"
                                    defaultValue={editingRoom?.price}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Capacité</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    defaultValue={editingRoom?.capacity}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    defaultValue={editingRoom?.imageUrl || ""}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    defaultValue={editingRoom?.description}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                {editingRoom ? "Mettre à jour" : "Sauvegarder"}
                            </button>
                        </div>
                    </Form>
                </div>
            )}

            <ul className="space-y-4">
                {rooms.map((room) => (
                    <li key={room.id} className="bg-white shadow sm:rounded-md px-4 py-6 flex items-center justify-between">
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
                            <button
                                onClick={() => handleEdit(room)}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                Modifier
                            </button>
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
    );
}
