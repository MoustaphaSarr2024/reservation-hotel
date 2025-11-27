import { useLoaderData, Form, useNavigation, redirect, Link } from "react-router";
import { API_URL } from "~/config";
import type { Route } from "./+types/reservation-edit";
import { useState } from "react";
import toast from "react-hot-toast";

interface Reservation {
    id: number;
    guestName: string;
    guestEmail: string;
    phoneNumber: string;
    dateFrom: string;
    dateTo: string;
    roomName: string;
    roomId: number;
    status: string;
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    try {
        const response = await fetch(`${API_URL}/api/reservations/${params.id}`);
        if (!response.ok) {
            throw new Error("Réservation non trouvée");
        }
        const reservation: Reservation = await response.json();
        return { reservation };
    } catch (error) {
        throw new Response("Réservation non trouvée", { status: 404 });
    }
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        await fetch(`${API_URL}/api/reservations/${params.id}`, { method: "DELETE" });
        return redirect("/rooms?deleted=true");
    }

    if (intent === "update") {
        const dateFrom = formData.get("dateFrom");
        const dateTo = formData.get("dateTo");

        const response = await fetch(`${API_URL}/api/reservations/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dateFrom, dateTo }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.message || "Erreur lors de la mise à jour" };
        }

        return { success: true, message: "Réservation mise à jour avec succès" };
    }

    return null;
}

export default function ReservationEdit({ loaderData, actionData }: Route.ComponentProps) {
    const { reservation } = loaderData;
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    if (actionData?.success) {
        toast.success(actionData.message);
    }
    if (actionData?.error) {
        toast.error(actionData.error);
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-blue-600">
                    <h3 className="text-lg leading-6 font-medium text-white">
                        Gérer ma réservation
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-blue-100">
                        #{reservation.id} - {reservation.roomName}
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Client</dt>
                            <dd className="mt-1 text-sm text-gray-900">{reservation.guestName} ({reservation.guestEmail})</dd>
                        </div>

                        <div className="sm:col-span-2">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Modifier les dates</h4>
                            <Form method="post" className="space-y-4">
                                <input type="hidden" name="intent" value="update" />
                                <div>
                                    <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Arrivée</label>
                                    <input
                                        type="date"
                                        name="dateFrom"
                                        id="dateFrom"
                                        defaultValue={reservation.dateFrom}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Départ</label>
                                    <input
                                        type="date"
                                        name="dateTo"
                                        id="dateTo"
                                        defaultValue={reservation.dateTo}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isSubmitting ? "Mise à jour..." : "Mettre à jour les dates"}
                                </button>
                            </Form>
                        </div>

                        <div className="sm:col-span-2 border-t pt-4 mt-4">
                            <h4 className="text-md font-medium text-red-600 mb-4">Zone de danger</h4>
                            <Form method="post" onSubmit={(e) => !confirm("Êtes-vous sûr de vouloir annuler cette réservation ?") && e.preventDefault()}>
                                <input type="hidden" name="intent" value="delete" />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Annuler la réservation
                                </button>
                            </Form>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-center">
                    <Link to="/rooms" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Retour aux chambres
                    </Link>
                </div>
            </div>
        </div>
    );
}
