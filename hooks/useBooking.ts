// hooks/useBooking.ts
import { useState, useCallback } from 'react';
import { getUserBookings, updateBookingStatus, getPropertyById } from '@/lib/appwrite';
import { Booking, BookingStatus } from '@/types/booking';
import { Models } from 'react-native-appwrite';

export const useBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async (status?: BookingStatus) => {
        setLoading(true);
        setError(null);
        try {
            const userBookings = await getUserBookings(status);
            
            // For each booking, get the property details
            const typedBookings = await Promise.all(userBookings.map(async (doc) => {
                const property = await getPropertyById({ id: doc.property_id });
                return {
                    ...doc,
                    property_id: doc.property_id,
                    user_id: doc.user_id,
                    agent_id: doc.agent_id,
                    booking_type: doc.booking_type,
                    status: doc.status,
                    date: doc.date,
                    time_slot: doc.time_slot,
                    notes: doc.notes,
                    property
                } as unknown as Booking;
            }));
            
            setBookings(typedBookings);
        } catch (err) {
            setError('Failed to fetch bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
        setLoading(true);
        setError(null);
        try {
            await updateBookingStatus(bookingId, status);
            await fetchBookings();
        } catch (err) {
            setError('Failed to update booking status');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchBookings]);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        updateStatus,
    };
};