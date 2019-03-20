function resizeWithFocusPoint(image, originalSize, focusPoint, size, quality = 90) {
    const STORYBLOK_IMAGE_SIZE_LIMIT = 2000
    let maxOriginalSize = originalSize

    if (image === undefined || image.length === 0)
        return { url: '', size: { width: 0, height: 0 } }

    // as the service only allows images up to 2000x2000 we do some math to make sure the resize is correct
    if (size.width > STORYBLOK_IMAGE_SIZE_LIMIT) {
        size.height = Math.round(
            (STORYBLOK_IMAGE_SIZE_LIMIT * size.height) / size.width
        )
        size.width = STORYBLOK_IMAGE_SIZE_LIMIT
    }
    if (size.height > STORYBLOK_IMAGE_SIZE_LIMIT) {
        size.width = Math.round(
            (STORYBLOK_IMAGE_SIZE_LIMIT * size.width) / size.height
        )
        size.height = STORYBLOK_IMAGE_SIZE_LIMIT
    }
    //--

    // this bit is to deal with resize coordinates if image original image is bigger than STORYBLOK_IMAGE_SIZE_LIMIT
    if (originalSize.width > STORYBLOK_IMAGE_SIZE_LIMIT) {
        maxOriginalSize.height = Math.round(
            (STORYBLOK_IMAGE_SIZE_LIMIT * originalSize.height) / originalSize.width
        )
        maxOriginalSize.width = STORYBLOK_IMAGE_SIZE_LIMIT
    }

    if (originalSize.height > STORYBLOK_IMAGE_SIZE_LIMIT) {
        maxOriginalSize.width = Math.round(
            (STORYBLOK_IMAGE_SIZE_LIMIT * originalSize.width) / originalSize.height
        )
        maxOriginalSize.height = STORYBLOK_IMAGE_SIZE_LIMIT
    }

    const sizeOption = `${size.width}x${size.height}/`
    const focusInPx = {
        x: Math.round((maxOriginalSize.width * focusPoint.x) / 100),
        y: Math.round((maxOriginalSize.height * focusPoint.y) / 100),
    }

    // https://www.storyblok.com/docs/image-service
    // filters:focal(<left>x<top>:<right>x<bottom>)
    const focusPointOption = `filters:focal(${focusInPx.x}x${
        focusInPx.y
        }:${focusInPx.x + 1}x${focusInPx.y + 1}):quality(${quality})`

    const imageService = '//img2.storyblok.com/'
    const path = image.replace('//a.storyblok.com', '')
    return {
        url: imageService + sizeOption + focusPointOption + path,
        size: size,
    }
}

export { resizeWithFocusPoint }
