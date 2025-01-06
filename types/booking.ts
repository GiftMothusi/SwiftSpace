// types/booking.ts
import { Models } from 'react-native-appwrite';

export type BookingType = 'viewing' | 'rental' | 'purchase';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking extends Models.Document {
    property_id: string;
    user_id: string;
    agent_id: string;
    booking_type: BookingType;
    status: BookingStatus;
    date: string;
    time_slot: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export const TIME_SLOTS = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
] as const;

export const BOOKING_TYPES = {
    VIEWING: 'viewing' as BookingType,
    RENTAL: 'rental' as BookingType,
    PURCHASE: 'purchase' as BookingType
};

export const BOOKING_STATUS = {
    PENDING: 'pending' as BookingStatus,
    CONFIRMED: 'confirmed' as BookingStatus,
    COMPLETED: 'completed' as BookingStatus,
    CANCELLED: 'cancelled' as BookingStatus
};