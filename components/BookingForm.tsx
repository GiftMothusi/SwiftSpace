import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '@/lib/global-provider';
import { createBooking, checkTimeSlotAvailability, getPropertyById } from '@/lib/appwrite';
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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [notes, setNotes] = useState('');

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Validate date and time selection
            if (!selectedDate || !selectedTimeSlot) {
                Alert.alert('Error', 'Please select both date and time');
                return;
            }

            // Check if date is in the past
            if (new Date(selectedDate) < new Date(new Date().setHours(0,0,0,0))) {
                Alert.alert('Error', 'Please select a future date');
                return;
            }

            // Check time slot availability
            const isAvailable = await checkTimeSlotAvailability(
                propertyId,
                selectedDate,
                selectedTimeSlot
            );

            if (!isAvailable) {
                Alert.alert('Error', 'This time slot is no longer available');
                return;
            }

            // Check property status
            const property = await getPropertyById({ id: propertyId });
            if (
                property?.status === 'Rented' ||
                property?.status === 'Sold' ||
                property?.status === 'Under-Contract'
            ) {
                Alert.alert(
                    'Error',
                    `The property cannot be booked as it is currently ${property?.status}.`
                );
                return;
            }

            // Create booking
            await createBooking({
                property_id: propertyId,
                agent_id: agentId,
                booking_type: bookingType,
                date: selectedDate,
                time_slot: selectedTimeSlot,
                notes: notes.trim()
            });

            Alert.alert('Success', 'Booking request sent successfully');
            onSuccess?.();
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
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
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text className="font-rubik text-black-300">
                        {selectedDate || 'Select a date'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate ? new Date(selectedDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
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

            {/* Buttons */}
            <View className="flex-row gap-4">
                <TouchableOpacity
                    onPress={onCancel}
                    className="flex-1 py-3 rounded-full bg-gray-100"
                >
                    <Text className="text-center font-rubik-bold text-black-300">
                        Cancel
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading || !selectedDate || !selectedTimeSlot}
                    className={`flex-1 py-3 rounded-full ${
                        loading || !selectedDate || !selectedTimeSlot
                            ? 'bg-gray-300'
                            : 'bg-primary-300'
                    }`}
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