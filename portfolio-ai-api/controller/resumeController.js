import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Resume from "../models/resumeModel.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const fileName = "LouisYangga-Resume.pdf"; // Default file name for the resume

export const uploadResume = async (req, res) => {
  try {
    const file = req.file; // Get the file from the request
    console.log("File received:", file); // Log the file for debugging
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Create a new PutObjectCommand for uploading to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer, // Use the buffer from the uploaded file
      ContentType: file.mimetype, // Set the content type based on the file's MIME type
    });

    // Upload file to S3 directly
    await s3.send(uploadCommand);

    // Now update MongoDB with the new file name and URL
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    await Resume.findOneAndUpdate(
      {},
      { fileName: fileName, url: fileUrl, uploadedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: "Resume uploaded successfully", url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate signed URL for resume download
async function generatePresignedUrl(disposition = 'attachment') {
  const resume = await Resume.findOne().sort({ uploadedAt: -1 });
  if (!resume) {
    throw new Error("Resume not found.");
  }
  const downloadCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: resume.fileName,
    ResponseContentDisposition: `${disposition}; filename="${resume.fileName}"`,
  });

  return getSignedUrl(s3, downloadCommand, { expiresIn: 60 });
} 

// Download resume - API endpoint handler
export const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found." });
    }

    // Direct streaming for /api/resume/download endpoint
    if (req.path === '/resume/download') {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: resume.fileName,
      });

      try {
        const { Body, ContentType } = await s3.send(command);
        res.setHeader('Content-Type', ContentType);
        res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
        return Body.pipe(res);
      } catch (error) {
        console.error('Error streaming file:', error);
        throw error;
      }
    }

    // Presigned URL for /resume/view (chat interface)
    const disposition = req.query.disposition || 'inline';
    const downloadUrl = await generatePresignedUrl(disposition);
    return res.json({ downloadUrl });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Failed to process download request." });
  }
};

// Download resume - Chat handler
export const getResumeUrl = async () => {
  try {
    return await generatePresignedUrl('inline');
  } catch (error) {
    console.error('Error getting resume URL:', error);
    throw error;
  }
};
