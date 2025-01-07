import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { createBooking, checkTimeSlotAvailability, getPropertyById } from '@/lib/appwrite';
import { BOOKING_TYPES, TIME_SLOTS, BookingType, PropertyStatus, PropertyStatusColors } from '@/types/booking';
import * as Haptics from 'expo-haptics';

// Define the props for the BookingForm component
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

    // Define the function to handle the booking submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Validate user inputs
            if (!selectedDate || !selectedTimeSlot) {
                Alert.alert('Error', 'Please select both date and time');
                return;
            }

            // Check the availability of the selected time slot
            const isAvailable = await checkTimeSlotAvailability(
                propertyId,
                selectedDate,
                selectedTimeSlot
            );

            if (!isAvailable) {
                Alert.alert('Error', 'This time slot is no longer available');
                return;
            }

            // Check the status of the property
            const property = await getPropertyById({ id: propertyId });
            if (
                property?.status === 'Rented' ||
                property?.status === 'Sold' ||
                property?.status === 'Under-Contract'
            ) {
                Alert.alert(
                    'Error',
                    `The accommodation cannot be booked as it is currently ${property?.status}.`
                );
                return;
            }

            // Create the booking
            await createBooking({
                property_id: propertyId,
                agent_id: agentId,
                booking_type: bookingType,
                date: selectedDate,
                time_slot: selectedTimeSlot,
                notes
            });

            // Display a success message
            Alert.alert('Success', 'Booking request sent successfully');
            onSuccess?.();
        } catch (error) {
            // Display a generic error message
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
                    className="flex-1 py-3 rounded-full bg-[#F0F0F0]"
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
                            Submit
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BookingForm;