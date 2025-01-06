// app/(tabs)/bookings.tsx
import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings } from '@/hooks/useBooking';
import { BOOKING_STATUS, BookingStatus } from '@/types/booking';
import { useGlobalContext } from '@/lib/global-provider';
import NoResults from '@/components/NoResults';
import icons from '@/constants/icon';
import { formatDate } from '@/lib/utils';

const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'confirmed':
                return 'bg-green-500';
            case 'completed':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <View className={`px-3 py-1 rounded-full ${getStatusColor()}`}>
            <Text className="text-white text-xs font-rubik-bold capitalize">
                {status}
            </Text>
        </View>
    );
};

const BookingCard = ({ item }) => {
    const { updateStatus } = useBookings();

    const handleCancel = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: () => updateStatus(item.$id, BOOKING_STATUS.CANCELLED),
                },
            ]
        );
    };

    return (
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-lg font-rubik-bold text-black-300">
                        {item.property.name}
                    </Text>
                    <Text className="text-sm font-rubik text-black-200 mt-1">
                        {item.property.address}
                    </Text>
                </View>
                <BookingStatusBadge status={item.status} />
            </View>

            <View className="flex-row items-center mt-4">
                <Image source={icons.calendar} className="w-5 h-5" />
                <Text className="ml-2 font-rubik text-black-200">
                    {formatDate(item.date)} • {item.time_slot}
                </Text>
            </View>

            {item.notes && (
                <Text className="mt-2 font-rubik text-black-200">
                    Notes: {item.notes}
                </Text>
            )}

            {item.status === 'pending' && (
                <TouchableOpacity
                    onPress={handleCancel}
                    className="mt-4 px-4 py-2 bg-danger rounded-full"
                >
                    <Text className="text-white text-center font-rubik-bold">
                        Cancel Booking
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const BookingsScreen = () => {
    const { bookings, loading, error, fetchBookings } = useBookings();

    useEffect(() => {
        fetchBookings();
    }, []);

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-danger font-rubik-medium">{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-4">
                <Text className="text-xl font-rubik-bold text-black-300">
                    My Bookings
                </Text>
                <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <FlatList
                data={bookings}
                renderItem={({ item }) => <BookingCard item={item} />}
                keyExtractor={(item) => item.$id}
                contentContainerClassName="px-5 pb-32"
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={fetchBookings}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" className="mt-10" />
                    ) : (
                        <NoResults />
                    )
                }
            />
        </SafeAreaView>
    );
};

export default BookingsScreen;