// modules/materialsApi.ts
export interface Material {
    id: number
    title: string
    coefficient: number
    image_url: string
    description: string
    is_deleted: boolean
}

export const getMaterials = async (materialTitle = ''): Promise<Material[]> => {
    const params = new URLSearchParams()
    if (materialTitle) {
        params.append('materialTitle', materialTitle)
    }
    
    return fetch(`http://localhost:8080/api/materials?${params}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch materials')
            }
            return response.json()
        })
        .catch((error) => {
            console.error('Error fetching materials:', error)
            return []
        })
}

export const getMaterialById = async (id: number): Promise<Material> => {
    return fetch(`http://localhost:8080/api/materials/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch material')
            }
            return response.json()
        })
        .catch((error) => {
            console.error('Error fetching material:', error)
            throw error
        })
}