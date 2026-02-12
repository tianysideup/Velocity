import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Vehicle {
  id?: string;
  name: string;
  type: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  available: boolean;
}

const COLLECTION_NAME = 'vehicles';

// Helper to convert relative image paths to full URLs
const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL (starts with http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path (starts with /), prepend the deployed web app URL
  if (imagePath.startsWith('/')) {
    // TODO: Update this URL to match your deployed web app
    // Firebase Hosting: https://velocity-769e6.web.app
    // Or your Vercel deployment URL
    const WEB_APP_URL = 'https://velocity-769e6.web.app';
    
    // encodeURI preserves slashes but encodes spaces and special characters
    const encodedPath = encodeURI(imagePath);
    
    return `${WEB_APP_URL}${encodedPath}`;
  }
  
  return imagePath;
};

// Get all vehicles
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const allVehicles = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const originalImage = data.image || data.imageUrl || '';
      const fullImageUrl = getFullImageUrl(originalImage);
      
      console.log(`[Vehicle] ${data.name} - original: ${originalImage} -> full URL: ${fullImageUrl}`);
      
      return {
        id: doc.id,
        ...data,
        // Convert relative paths to full URLs
        image: fullImageUrl,
      } as Vehicle;
    });

    // Get reserved vehicle IDs (vehicles with pending or active rentals)
    try {
      const rentalsQuery = query(
        collection(db, 'rentals'),
        where('status', 'in', ['pending', 'active'])
      );
      const rentalsSnapshot = await getDocs(rentalsQuery);
      const reservedVehicleIds = new Set(
        rentalsSnapshot.docs.map(doc => doc.data().vehicleId)
      );

      // Filter out reserved vehicles
      return allVehicles.filter(vehicle => !reservedVehicleIds.has(vehicle.id));
    } catch (rentalsError) {
      console.log('Could not access rentals, returning all vehicles:', rentalsError);
      return allVehicles;
    }
  } catch (error) {
    console.error('Error getting vehicles:', error);
    throw error;
  }
};
