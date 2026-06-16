import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  // Avoid throwing at import-time in case code paths don't use Cloudinary.
  // Actual upload will throw with a clearer message.
  console.warn('[cloudinary] Missing env vars: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET')
}

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
  secure: true,
})

const cloudinaryDebugId = `cloudinary:${Math.random().toString(16).slice(2)}`
console.info('[cloudinary] init', {
  debugId: cloudinaryDebugId,
  cloud_name: cloudName ? '[set]' : '[missing]',
  api_key: apiKey ? '[set]' : '[missing]',
  api_secret: apiSecret ? '[set]' : '[missing]',
})


export type CloudinaryUploadOptions = {
  folder?: string
  useUniquePublicId?: boolean
  resourceType?: 'image' | 'video' | 'raw'
}

function assertConfigured() {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[cloudinary] missing env vars', {
      cloud_name: cloudName ? '[set]' : '[missing]',
      api_key: apiKey ? '[set]' : '[missing]',
      api_secret: apiSecret ? '[set]' : '[missing]',
    })
    throw new Error('Cloudinary is not configured. Check .env variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  }
}


export async function uploadBufferToCloudinary(
  file: Buffer,
  fileName: string,
  options: CloudinaryUploadOptions = {}
): Promise<{ secureUrl: string; publicId: string }> {
  const correlationId = `upload:${Date.now()}:${Math.random().toString(16).slice(2)}`
  assertConfigured()

  const resourceType = options.resourceType ?? (fileName.match(/\.(mp4|mov|mkv)$/i)
    ? 'video'
    : fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)
      ? 'raw'
      : 'image')

  console.info('[cloudinary] upload start', {
    correlationId,
    fileName,
    resourceType,
    folder: options.folder ?? null,
    fileSizeBytes: file?.length ?? null,
    secure: true,
    useUniquePublicId: options.useUniquePublicId ?? false,
    cloud_name: cloudName,
  })

  const uploadResult = await new Promise<{
    secure_url: string
    public_id: string
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder,
          resource_type: resourceType,
          public_id: options.useUniquePublicId ? undefined : undefined,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error('[cloudinary] upload error', {
              correlationId,
              name: (error as any)?.name,
              message: (error as any)?.message,
              stack: (error as any)?.stack,
            })
            return reject(error)
          }
          if (!result) {
            const e = new Error('Cloudinary upload returned empty result')
            console.error('[cloudinary] upload empty result', { correlationId })
            return reject(e)
          }
          resolve({
            secure_url: (result as any).secure_url,
            public_id: (result as any).public_id,
          })
        }
      )
      .end(file)
  })

  console.info('[cloudinary] upload success', {
    correlationId,
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url ? uploadResult.secure_url.slice(0, 80) + '...' : null,
  })

  return {
    secureUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}


