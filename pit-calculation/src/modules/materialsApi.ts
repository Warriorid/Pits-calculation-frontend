import { MATERIALS_MOCK } from './mock';

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
        
        const response = await fetch(`http://localhost:8080/api/materials?${params}`)
        
        if (!response.ok) {
            throw new Error('Failed to fetch materials')
        }
        
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching materials, using mock data:', error)
        if (materialTitle.trim() === '') {
            return MATERIALS_MOCK.filter(material => !material.is_deleted)
        }
        
        return MATERIALS_MOCK.filter(material => 
            !material.is_deleted && 
            material.title.toLowerCase().includes(materialTitle.toLowerCase())
        )
    }
}

export const getMaterialById = async (id: number): Promise<Material> => {
    try {
        const response = await fetch(`http://localhost:8080/api/materials/${id}`)
        
        if (!response.ok) {
            throw new Error('Failed to fetch material')
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