import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

if (typeof window !== "undefined") {
  throw new Error("R2 storage module cannot be imported in client-side code.");
}

function getR2Config() {
  return {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
  };
}

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    const { endpoint, accessKeyId, secretAccessKey } = getR2Config();
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing Cloudflare R2 server credentials in environment variables.");
    }

    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return r2ClientInstance;
}

/**
 * Server-side R2 connectivity check.
 * Uses HeadBucketCommand to verify credentials and bucket existence without writing files.
 */
export async function checkR2Connection(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const { endpoint, accessKeyId, secretAccessKey, bucketName } = getR2Config();
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      return { ok: false, message: "R2 environment variables are incomplete." };
    }

    const client = getR2Client();
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    const latencyMs = Date.now() - start;

    return {
      ok: true,
      message: `Connected to Cloudflare R2 bucket (${bucketName})`,
      latencyMs,
    };
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    const msg = error instanceof Error ? error.message : "Unknown R2 connection error";
    return {
      ok: false,
      message: msg,
      latencyMs,
    };
  }
}

/**
 * Upload an asset buffer to Cloudflare R2.
 */
export async function uploadToR2(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  const { bucketName } = getR2Config();
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        Metadata: params.metadata,
      })
    );
  } catch (error: unknown) {
    const errName = error && typeof error === "object" && "name" in error ? String(error.name) : "";
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errName === "AccessDenied" || errMsg.includes("Access Denied")) {
      throw new Error(
        "Cloudflare R2 Access Denied. Your R2 API Token is configured for Read-Only. Please update or recreate your R2 API Token with 'Object Read & Write' permission in Cloudflare."
      );
    }
    throw error;
  }

  const url = getR2PublicUrl(params.key);
  return { key: params.key, url };
}

/**
 * Delete an asset from Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const { bucketName } = getR2Config();
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Retrieve an object from Cloudflare R2 by key.
 */
export async function getObjectFromR2(key: string) {
  const client = getR2Client();
  const { bucketName } = getR2Config();
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  return await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Constructs a public or CDN media URL for a given R2 storage key.
 */
export function getR2PublicUrl(key: string): string {
  const publicBase = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_URL;
  if (publicBase) {
    const cleanBase = publicBase.replace(/\/$/, "");
    return `${cleanBase}/${key.replace(/^\//, "")}`;
  }
  // Fallback to internal media proxy route
  return `/api/media/${key.replace(/^\//, "")}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Server-side calculation of Cloudflare R2 storage usage and limits.
 */
export async function getR2StorageStats(limitGb = 10): Promise<{
  totalObjects: number;
  usedBytes: number;
  usedFormatted: string;
  totalBytes: number;
  totalFormatted: string;
  availableBytes: number;
  availableFormatted: string;
  usagePercent: number;
}> {
  const limitBytes = limitGb * 1024 * 1024 * 1024;
  try {
    const client = getR2Client();
    const { bucketName } = getR2Config();
    if (!bucketName) {
      throw new Error("R2_BUCKET_NAME is not configured.");
    }

    let totalBytes = 0;
    let totalObjects = 0;
    let continuationToken: string | undefined = undefined;

    do {
      const response: ListObjectsV2CommandOutput = await client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
      );

      if (response.Contents) {
        for (const item of response.Contents) {
          totalBytes += item.Size || 0;
          totalObjects++;
        }
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken && totalObjects < 5000);

    const availableBytes = Math.max(0, limitBytes - totalBytes);
    const usagePercent = Math.min(100, Number(((totalBytes / limitBytes) * 100).toFixed(2)));

    return {
      totalObjects,
      usedBytes: totalBytes,
      usedFormatted: formatBytes(totalBytes),
      totalBytes: limitBytes,
      totalFormatted: formatBytes(limitBytes),
      availableBytes,
      availableFormatted: formatBytes(availableBytes),
      usagePercent,
    };
  } catch (error) {
    console.error("Error retrieving R2 storage stats:", error);
    return {
      totalObjects: 0,
      usedBytes: 0,
      usedFormatted: "0 Bytes",
      totalBytes: limitBytes,
      totalFormatted: formatBytes(limitBytes),
      availableBytes: limitBytes,
      availableFormatted: formatBytes(limitBytes),
      usagePercent: 0,
    };
  }
}

