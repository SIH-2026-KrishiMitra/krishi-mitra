const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
    throw new Error(
      `"${file.name}" is not a supported image type. Use JPG, PNG, or WebP.`
    )
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is 5 MB.`
    )
  }
}

export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  validateImageFile(file)

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as {
            secure_url: string
            public_id: string
            error?: { message: string }
          }
          if (res.error) {
            reject(new Error(res.error.message))
          } else {
            resolve({ secure_url: res.secure_url, public_id: res.public_id })
          }
        } catch {
          reject(new Error('Unexpected response from Cloudinary.'))
        }
      } else {
        let message = `Upload failed (HTTP ${xhr.status}).`
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message: string } }
          if (err.error?.message) message = err.error.message
        } catch { /* ignore */ }
        reject(new Error(message))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed: network error.')))
    xhr.addEventListener('abort', () => reject(new Error('Upload was aborted.')))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.send(formData)
  })
}
