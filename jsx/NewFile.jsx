var _jsxFolder = Folder.selectDialog ("Select a JSX folder");

var jsxFiles = ["btMain.jsx", "btBook.jsx"];

//,"btThumbnails.jsx","btBook.jsx","btPageFlows.jsx","btFrames.jsx","btEncodeDecode.jsx","btUtils.jsx","btCaptionTags.jsx","btTagSelection.jsx","btPortraitManager.jsx","portraitFiles.jsx","portraitUtilities.jsx","activityLog.jsx","portraitPrint.jsx","btIndexer.jsx","indexUtilities.jsx","idUtilities.jsx","indexPreferences.jsx","btGenerate.jsx","btShipping.jsx","btLocking.jsx","btFlipping.jsx","btEvents.jsx","btAutoIndex.jsx","btXMP.jsx","btCoverage.jsx", "packages.jsx", "btByline.jsx", "btCMfoundation.jsx","libraries/json2.js","btDictionary.jsx"

if (_jsxFolder.exists) {
    for (var i = 0; i < jsxFiles.length; i++) {
        var jsxFile = new File ( _jsxFolder+"/"+jsxFiles[i] );
        if (jsxFile.exists==false) {
            alert ("btLoadJsx : error - cant find "+_jsxFolderPath+jsxFiles[i]);
        }
        try{
            $.evalFile (jsxFile, 100);
        }
        catch (e)
        {
            alert (i+" Failed to load library at \r"+jsxFile+"\r error = "+e);
           exit();
        }
   }

}else {
    alert(_jsxFolderPath + " goes not exist");
}
