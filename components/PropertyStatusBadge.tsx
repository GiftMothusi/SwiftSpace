import React from 'react';
import { View, Text } from 'react-native';
import { PropertyStatus, PropertyStatusColors } from '@/types/property';

interface PropertyStatusBadgeProps {
    status: PropertyStatus;
    className?: string;
}

const PropertyStatusBadge = ({ status, className = '' }: PropertyStatusBadgeProps) => {
    return (
        <View className={`rounded-full px-3 py-1 ${PropertyStatusColors[status]} ${className}`}>
            <Text className="text-white text-xs font-rubik-bold">
                {status}
            </Text>
        </View>
    );
};

export default PropertyStatusBadge;