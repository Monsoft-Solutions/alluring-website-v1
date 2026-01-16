export type ImageGalleryImage = {
    url: string
    name: string
    description?: string
}

export type ImageGallerySchemaProps = {
    name: string
    description: string
    url: string
    numberOfItems: number
    images: ImageGalleryImage[]
}
