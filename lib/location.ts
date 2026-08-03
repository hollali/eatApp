import * as Location from "expo-location";

export interface GeocodedAddress {
    street: string;
    city: string;
    latitude: number;
    longitude: number;
}

export const getAddressFromCurrentLocation = async (): Promise<GeocodedAddress> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        throw new Error("Location permission is required to detect your address");
    }

    const location = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync(location.coords);

    const street = place?.street
        ? [place.streetNumber, place.street].filter(Boolean).join(" ")
        : place?.name
        ? place.name
        : `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`;

    const city = place?.city || place?.region || place?.subregion || "Unknown";

    return {
        street,
        city,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
};
