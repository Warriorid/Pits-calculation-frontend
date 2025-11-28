import { MATERIALS_MOCK } from './mock';
import { API_BASE_URL, isTauri } from '../networkConfig';

export interface Material {
    id: number
    title: string
    coefficient: number
    image_url: string
    description: string
    is_deleted: boolean
}
let fetchAttempts = 0;
const MAX_FETCH_ATTEMPTS = 3;

export const getMaterials = async (): Promise<Material[]> => {
  if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
    console.log('Too many failed attempts, using mock data');
    return MATERIALS_MOCK;
  }

  try {
    const url = `${API_BASE_URL}/materials`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch materials: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched materials:', data.length);
    fetchAttempts = 0;
    return data;
  } catch (error) {
    fetchAttempts++;
    console.log(`Error fetching materials (attempt ${fetchAttempts}), using mock data:`, error);
    return MATERIALS_MOCK;
  }
};
export const getMaterialById = async (id: number): Promise<Material> => {
    try {
        const apiUrl = isTauri 
            ? `${API_BASE_URL}/materials/${id}`
            : `/api/materials/${id}`;
        
        console.log('Fetching material from:', apiUrl);
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`Failed to fetch material: ${response.status}`)
        }
        
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching material, using mock data:', error)
       
        const mockMaterial = MATERIALS_MOCK.find(material => material.id === id && !material.is_deleted)
        
        if (!mockMaterial) {
            throw new Error('Material not found')
        }
        
        return mockMaterial
    }
}