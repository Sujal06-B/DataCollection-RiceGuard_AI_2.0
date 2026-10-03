/**
 * =========================================================================
 * RICE GUARD AI - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * 
 * This serverless backend runs inside Google Drive via Google Apps Script.
 * It receives rice crop photos sent from your GitHub Pages frontend,
 * automatically organizes them into folders named after each village,
 * and saves them directly into your Google Drive storage.
 * 
 * -------------------------------------------------------------------------
 * SETUP INSTRUCTIONS:
 * 1. Open Google Drive (drive.google.com) and create or choose a folder
 *    (e.g., "Rice Guard AI Data Collection").
 * 2. Open that folder and copy the Folder ID from the address bar URL:
 *    https://drive.google.com/drive/folders/PASTE_THIS_PART_HERE
 * 3. Replace "PASTE_YOUR_FOLDER_ID_HERE" below with your copied Folder ID.
 * 4. Click the blue 'Deploy' button -> 'New deployment'.
 * 5. Select type 'Web app'.
 * 6. Set Description: "Rice Guard AI v2.4"
 * 7. Set 'Execute as': "Me (your email)"
 * 8. Set 'Who has access': "Anyone" (CRITICAL: Must be Anyone so students can upload without logging into your Google account).
 * 9. Click Deploy, Authorize access, and Copy the 'Web app URL'.
 * 10. Paste the Web App URL into your frontend index.html or in the Settings modal.
 * =========================================================================
 */

// REPLACE WITH YOUR GOOGLE DRIVE MASTER FOLDER ID
var MASTER_FOLDER_ID = "1YGGCYyCe9pfqZR1Ged-71Mj9er1SqU5B";

/**
 * Handles GET requests:
 * Used for connection health checks, testing the endpoint, and verifying
 * that the Google Drive Master Folder is accessible.
 */
function doGet(e) {
  try {
    var folderName = "Not Configured";
    var folderValid = false;
    var folderMessage = "";
    
    if (MASTER_FOLDER_ID && MASTER_FOLDER_ID !== "PASTE_YOUR_FOLDER_ID_HERE") {
      try {
        var folder = DriveApp.getFolderById(MASTER_FOLDER_ID);
        folderName = folder.getName();
        folderValid = true;
        folderMessage = "Successfully connected to master folder: " + folderName;
      } catch (fErr) {
        folderName = "Error: Folder ID not accessible (" + fErr.message + ")";
        folderMessage = "Failed to access folder. Please check MASTER_FOLDER_ID permissions.";
      }
    } else {
      folderMessage = "MASTER_FOLDER_ID has not been set yet. Please paste your Google Drive folder ID in line 28 of Code.gs.";
    }
    
    var response = {
      status: "online",
      service: "Rice Guard AI Backend API",
      version: "2.4",
      masterFolderConfigured: folderValid,
      masterFolderName: folderName,
      message: folderMessage,
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests:
 * Receives the base64-encoded image and village metadata from the frontend,
 * creates or locates the village subfolder, and saves the file to Drive.
 */
function doPost(e) {
  try {
    // Validate incoming payload
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received in request body. Ensure data is sent via fetch POST with JSON payload.");
    }

    if (!MASTER_FOLDER_ID || MASTER_FOLDER_ID === "PASTE_YOUR_FOLDER_ID_HERE") {
      throw new Error("MASTER_FOLDER_ID has not been configured in Code.gs. Please paste your Google Drive folder ID in Code.gs.");
    }

    // Parse the JSON data sent from GitHub Pages
    var params = JSON.parse(e.postData.contents);
    var base64Data = params.base64Data;
    var fileName = params.fileName || ("rice_leaf_" + new Date().getTime() + ".jpg");
    var mimeType = params.mimeType || "image/jpeg";
    var villageName = params.villageName || "Unknown Village";
    var surveyorName = params.surveyorName || "";
    var notes = params.notes || "";

    if (!base64Data) {
      throw new Error("base64Data is missing in the payload.");
    }

    // Access master Google Drive folder
    var masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);

    // Clean and sanitize the village name
    var cleanVillageName = villageName.trim().replace(/[\\/:*?"<>|]/g, "_");
    if (cleanVillageName === "") {
      cleanVillageName = "Unknown Village";
    }

    // Check if the village folder already exists inside Master Folder
    var folders = masterFolder.getFoldersByName(cleanVillageName);
    var villageFolder;
    if (folders.hasNext()) {
      villageFolder = folders.next();
    } else {
      villageFolder = masterFolder.createFolder(cleanVillageName);
    }

    // Strip Data URI scheme if present (e.g., "data:image/jpeg;base64,...")
    var splitBase = base64Data.split(',');
    var rawBase64 = splitBase.length > 1 ? splitBase[1] : base64Data;

    // Decode base64 to binary blob
    var decoded = Utilities.base64Decode(rawBase64);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);

    // Create the image file inside the village folder
    var createdFile = villageFolder.createFile(blob);

    // Attach descriptive metadata for easy search and cataloging
    var fileDescription = "Rice Guard AI Data Collection Submission\n" +
                          "Village: " + cleanVillageName + "\n" +
                          (surveyorName ? "Surveyor: " + surveyorName + "\n" : "") +
                          (notes ? "Notes: " + notes + "\n" : "") +
                          "Upload Timestamp: " + new Date().toISOString();
    createdFile.setDescription(fileDescription);

    // Return JSON success response
    var result = {
      success: true,
      fileId: createdFile.getId(),
      fileName: createdFile.getName(),
      fileUrl: createdFile.getUrl(),
      villageFolder: cleanVillageName,
      folderId: villageFolder.getId()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error JSON response
    var errResult = {
      success: false,
      error: error.toString()
    };

    return ContentService.createTextOutput(JSON.stringify(errResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
