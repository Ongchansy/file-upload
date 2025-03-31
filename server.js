const express = require('express');
const multer = require('multer');
const sdk = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const path = require('path');

// Initialize Appwrite client
const client = new sdk.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')  // Replace with your Appwrite endpoint
    .setProject('67ea4cc0000053c36417')  // Replace with your Appwrite project ID
    .setKey('standard_b75287a16a735098b8d286f97b34eec2eb13ac34e44d565c81444aedc689ae79ed80473547e0abc37db3b53049268a603a8e261c9826fccd6fb4a6007ce056e33e02d2a4442d4deb05e4cf8be09ad793cd179561fa8597907147ef2464c13dc25865098fd5e41aa1f4107878f37416e3675bd029fac496b41adcc98715e14500');  // Replace with your Appwrite API key

const storage = new sdk.Storage(client);

// Initialize Express app
const app = express();
const port = 3000;

// Set up Multer to handle file uploads
const upload = multer();

// Define route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create an InputFile from the buffer
        const nodeFile = InputFile.fromBuffer(req.file.buffer, req.file.originalname);

        // Upload the file to Appwrite
        const response = await storage.createFile(
            '67ea509b00250444eff6',  // Replace with your Appwrite bucket ID
            sdk.ID.unique(), // Unique ID for the file
            nodeFile
        );

        // Send the response
        res.status(200).json({
            message: 'File uploaded successfully',
            file: response
        });
    } catch (error) {
        console.error('Appwrite upload error:', error);
        res.status(500).json({ error: 'Failed to upload file to Appwrite' });
    }
});

app.get('/file/:fileId', async (req, res) => {
    const { fileId } = req.params; // Get the file ID from the URL parameter

    try {
        // Retrieve the file from Appwrite storage
        const file = await storage.getFile('67ea509b00250444eff6', fileId);

        res.status(200).json({
            success: true,
            file: file.name, // You can send more details or the file data if needed
        });
    } catch (error) {
        console.error('Appwrite getFile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve file',
            error: error.message,
        });
    }
});

app.get('/files', async (req, res) => {
    try {
        // Fetch all files from Appwrite storage
        const result = await storage.listFiles(
            '67ea509b00250444eff6'
        );

        // Return the result (list of files) as JSON response
        res.status(200).json({
            success: true,
            files: result.files,
        });
    } catch (error) {
        // Handle any errors
        console.error('Appwrite listFiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message,
        });
    }
});

// Delete file (Delete)
app.delete('/file/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        // Delete file from Appwrite
        const response = await storage.deleteFile('67ea509b00250444eff6', fileId);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            response,
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ success: false, message: 'Failed to delete file', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
