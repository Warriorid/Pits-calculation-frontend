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

    export const getMaterials = async (materialTitle = ''): Promise<Material[]> => {
        try {
        
        const params = new URLSearchParams()
        if (materialTitle) {
            params.append('materialTitle', materialTitle)
        }
        
        const apiUrl = isTauri 
            ? `${API_BASE_URL}/materials?${params}`
            : `/api/materials?${params}`;
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`Failed to fetch materials: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Successfully fetched materials:', data.length, 'items');
        return data
    } catch (error) {
        console.error(' Error fetching materials, using mock data:', error)
        
        if (materialTitle.trim() === '') {
            const mockData = MATERIALS_MOCK.filter(material => !material.is_deleted)
            return mockData
        }
        
        const filteredMockData = MATERIALS_MOCK.filter(material => 
            !material.is_deleted && 
            material.title.toLowerCase().includes(materialTitle.toLowerCase())
        )
        return filteredMockData
    }
}

export const getMaterialById = async (id: number): Promise<Material> => {
    try {
        const apiUrl = isTauri 
            ? `${API_BASE_URL}/materials/${id}`
            : `/api/materials/${id}`;
        
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`Failed to fetch material: ${response.status}`)
        }
        
        const data = await response.json()
        return data
    } catch (error) {
       
        const mockMaterial = MATERIALS_MOCK.find(material => material.id === id && !material.is_deleted)
        
        if (!mockMaterial) {
            throw new Error('Material not found')
        }
        
        return mockMaterial
    }
}