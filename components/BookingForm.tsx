import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { createBooking, checkTimeSlotAvailability } from '@/lib/appwrite';
import { BOOKING_TYPES, TIME_SLOTS, BookingType } from '@/types/booking';
import * as Haptics from 'expo-haptics';

interface BookingFormProps {
    propertyId: string;
    agentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const BookingForm = ({ propertyId, agentId, onSuccess, onCancel }: BookingFormProps) => {
    const { user } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [bookingType, setBookingType] = useState<BookingType>(BOOKING_TYPES.VIEWING);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Validate inputs
            if (!selectedDate || !selectedTimeSlot) {
                Alert.alert('Error', 'Please select both date and time');
                return;
            }

            // Check availability
            const isAvailable = await checkTimeSlotAvailability(
                propertyId,
                selectedDate,
                selectedTimeSlot
            );

            if (!isAvailable) {
                Alert.alert('Error', 'This time slot is no longer available');
                return;
            }

            // Create booking
            await createBooking({
                property_id: propertyId,
                agent_id: agentId,
                booking_type: bookingType,
                date: selectedDate,
                time_slot: selectedTimeSlot,
                notes
            });

            Alert.alert('Success', 'Booking request sent successfully');
            onSuccess?.();
        } catch (error) {
            Alert.alert('Error', 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="p-4 bg-white rounded-lg">
            {/* Booking Type Selection */}
            <View className="mb-4">
                <Text className="text-lg font-rubik-bold mb-2">Booking Type</Text>
                <View className="flex-row gap-2">
                    {Object.values(BOOKING_TYPES).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setBookingType(type)}
                            className={`px-4 py-2 rounded-full ${
                                bookingType === type ? 'bg-primary-300' : 'bg-primary-100'
                            }`}
                        >
                            <Text
                                className={`font-rubik-medium ${
                                    bookingType === type ? 'text-white' : 'text-black-300'
                                }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Date Selection */}
            <View className="mb-4">
                <Text className="text-lg font-rubik-bold mb-2">Select Date</Text>
                <TouchableOpacity
                    className="border border-primary-200 rounded-lg p-3"
                    onPress={() => {
                        // Date picker to be implemented
                        setSelectedDate('2024-01-10');
                    }}
                >
                    <Text className="font-rubik text-black-300">
                        {selectedDate || 'Select a date'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Time Slot Selection */}
            <View className="mb-4">
                <Text className="text-lg font-rubik-bold mb-2">Select Time</Text>
                <View className="flex-row flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                        <TouchableOpacity
                            key={slot}
                            onPress={() => setSelectedTimeSlot(slot)}
                            className={`px-4 py-2 rounded-full ${
                                selectedTimeSlot === slot ? 'bg-primary-300' : 'bg-primary-100'
                            }`}
                        >
                            <Text
                                className={`font-rubik-medium ${
                                    selectedTimeSlot === slot ? 'text-white' : 'text-black-300'
                                }`}
                            >
                                {slot}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
                <Text className="text-lg font-rubik-bold mb-2">Notes</Text>
                <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any special requests or notes"
                    className="border border-primary-200 rounded-lg p-3 font-rubik text-black-300"
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Submit Button */}
            <View className="flex-row gap-4">
                <TouchableOpacity
                    onPress={onCancel}
                    className="flex-1 py-3 rounded-full bg-primary-100"
                >
                    <Text className="text-center font-rubik-bold text-black-300">
                        Cancel
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 rounded-full bg-primary-300"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-center font-rubik-bold text-white">
                            Book Now
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BookingForm;