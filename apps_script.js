/**
 * DISTINTA DINAMICA - Google Apps Script
 * =======================================
 * Questo script va incollato in Google Apps Script (script.google.com)
 * e deployato come Web App. Serve per leggere la lista dei PDF
 * dalla cartella Google Drive.
 *
 * ISTRUZIONI:
 * 1. Vai su https://script.google.com
 * 2. Crea un nuovo progetto
 * 3. Incolla TUTTO questo codice al posto del contenuto predefinito
 * 4. Salva (Ctrl+S)
 * 5. Deploy > Nuova distribuzione > Tipo: App web
 *    - Esegui come: Me
 *    - Chi ha accesso: Chiunque
 * 6. Copia l'URL della distribuzione e incollalo nella web app
 */

function doGet(e) {
  // Gestisci la richiesta CORS preflight
  var output;

  try {
    var folderId = e.parameter.folderId;

    if (!folderId) {
      output = ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Parametro folderId mancante. Passa ?folderId=ID_DELLA_CARTELLA'
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }

    var folder = DriveApp.getFolderById(folderId);
    var folderName = folder.getName();
    var files = folder.getFiles();
    var result = [];

    while (files.hasNext()) {
      var file = files.next();
      var name = file.getName();

      if (name.toLowerCase().endsWith('.pdf')) {
        result.push({
          name: name,
          id: file.getId(),
          url: 'https://drive.google.com/file/d/' + file.getId() + '/view'
        });
      }
    }

    // Cerca anche nelle sottocartelle (1 livello)
    var subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      var subfolder = subfolders.next();
      var subName = subfolder.getName();
      var subFiles = subfolder.getFiles();

      while (subFiles.hasNext()) {
        var file = subFiles.next();
        var name = file.getName();

        if (name.toLowerCase().endsWith('.pdf')) {
          result.push({
            name: name,
            id: file.getId(),
            url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
            subfolder: subName
          });
        }
      }
    }

    output = ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      folderName: folderName,
      fileCount: result.length,
      files: result
    }));

  } catch (err) {
    output = ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }));
  }

  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
