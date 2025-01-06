import { useState, useCallback } from 'react';
import { getUserBookings, updateBookingStatus } from '@/lib/appwrite';
import { Booking, BookingStatus } from '@/types/booking';

export const useBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async (status?: BookingStatus) => {
        setLoading(true);
        setError(null);
        try {
            const userBookings = await getUserBookings(status);
            setBookings(userBookings);
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
            // Refresh bookings after update
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
}
