package tech.boshkov.webdroid.webdroid.REST

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Environment
import com.github.salomonbrys.kotson.fromJson
import com.github.salomonbrys.kotson.jsonArray
import com.github.salomonbrys.kotson.jsonObject
import com.github.salomonbrys.kotson.set
import com.google.gson.Gson
import com.google.gson.JsonObject
import fi.iki.elonen.NanoHTTPD
import org.apache.commons.fileupload.disk.DiskFileItemFactory
import org.zeroturnaround.zip.ZipUtil
import org.zeroturnaround.zip.commons.IOUtils
import tech.boshkov.webdroid.server.NanoFileUpload
import tech.boshkov.webdroid.server.WebServer
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.WebApplication
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream


class FSFile {
    var name: String = "";
    var absolutePath: String = "";
}

class ZipPayload {
    var outFile: String = ""
    var files = listOf<String>()
}


class FileListPayload {
    var files = listOf<String>()
}


class MkdirPayload {
    var name: String = ""
}

/**
 * Created by iboshkov on 5/17/2017.
 */
class RESTApp(private val mContext: Context, private val server: WebServer):  WebApplication {
    internal lateinit var batteryStatus: Intent
    internal var uploadStatus = jsonObject()

    private fun addFileToZip(file: File, zip: ZipOutputStream, basePath: String = "") {
        var name = file.name
        if (!basePath.isEmpty()) {
            name = file.absolutePath.substring(basePath.length)
        }
        val zipEntry = ZipEntry(name)
        zip.putNextEntry(zipEntry)
        IOUtils.copy(FileInputStream(file), zip)
        zip.closeEntry()
    }

    @Throws(IOException::class)
    private fun addFolderToZip(folder: File, zip: ZipOutputStream, basePath: String? = null) {
        val files = folder.listFiles()
        var newBasePath = basePath
        // TODO: Fix this when not tired.
        if (basePath.isNullOrEmpty()) {
            val absPath = folder.absolutePath
            newBasePath = absPath.substring(0, absPath.length - folder.name.length)
        }

        if (!newBasePath.isNullOrEmpty()) {
            // Add the folder itself to the zip
            // Add "/" at the end to force java to treat the path as a directory.
            var name = folder.absolutePath.substring(newBasePath!!.length) + "/"
            val zipEntry = ZipEntry(name)
            zip.putNextEntry(zipEntry)
            zip.closeEntry()
        }

        for (file in files) {
            if (file.isDirectory) {
                addFolderToZip(file, zip, newBasePath)
            } else {
                addFileToZip(file, zip, newBasePath!!)
            }
        }
    }

    private fun addToZip(file: File, zip: ZipOutputStream, basePath: String = "") {
        if (file.isDirectory) {
            addFolderToZip(file, zip, basePath)
        } else {
            addFileToZip(file, zip, basePath)
        }
    }


    @RequestHandler(route = "/rest/filesystem/zip/", methods = arrayOf("POST"))
    fun filesystemZip(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val body = server.parseTextBody(sess)
        val gson = Gson()

        val files = gson.fromJson<ZipPayload>(body);
        var response = jsonObject(
                "status" to "success"
        )
        return NanoHTTPD.newFixedLengthResponse(response.toString());
    }


    @RequestHandler(route = "/rest/filesystem/upload/status/")
    fun filesystemUploadStatus(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        return NanoHTTPD.newFixedLengthResponse(uploadStatus.toString());
    }

    fun update(sessionId: String, bytesRead: Long, contentLength: Long, itemIdx: Int) {
        var sessionObj = uploadStatus.getAsJsonObject(sessionId)
        if (sessionObj == null) {
            sessionObj = jsonObject()
        }
        var itemIdxStr = itemIdx.toString()

        var itemObj = sessionObj.getAsJsonObject(itemIdxStr)
        if (itemObj == null) {
            itemObj = jsonObject()
        }

        println("We are currently reading item " + itemIdx)
        if (contentLength == -1L) {
            println("So far, $bytesRead bytes have been read.")
        } else {
            println("So far, " + bytesRead + " of " + contentLength
                    + " bytes have been read.")
        }

        itemObj.set("read", bytesRead);
        itemObj.set("length", contentLength);

        sessionObj.set(itemIdxStr, itemObj)
        uploadStatus.set(sessionId, sessionObj)
    }

    @RequestHandler(route = "/rest/filesystem/upload/", methods = arrayOf("POST"))
    fun filesystemUpload(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val params = sess.parameters
        val sessionId = params.get("sess")!!.get(0)
        val up = NanoFileUpload(DiskFileItemFactory())
        up.setProgressListener { pBytesRead, pContentLength, pItems ->  update(sessionId, pBytesRead, pContentLength, pItems)}
        try {
            val items = up.parseRequest(sess)
            val destPath = items.find { it.isFormField && it.fieldName == "destPath" }!!.string
            val destFile = getAbsoluteFile(destPath)

            for (item in items) {
                val name = item.name
                if (item.isFormField) {
                    continue
                }

                val upDestFile = File(destFile, name)
                item.write(upDestFile)
                println("Found file $name")
            }
        } finally {
            uploadStatus.remove(sessionId);
        }

        val response = jsonObject(
                "status" to "success"
        )
        return NanoHTTPD.newFixedLengthResponse(response.toString());
    }

    @RequestHandler(route = "/rest/filesystem/zipAndDownload/", methods = arrayOf("POST"))
    fun filesystemZipAndDownload(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val body = server.parseTextBody(sess)
        val gson = Gson()

        val payload = gson.fromJson<ZipPayload>(body);

        var tempFile = File.createTempFile("WebDroidArchive", ".zip");

        val outZip = ZipOutputStream(FileOutputStream(tempFile))

        payload.files.forEach {
            addToZip(File(it), outZip)
        }

        outZip.close()

        var response = jsonObject(
                "status" to "success",
                "absolutePath" to tempFile.absolutePath
        )

        return NanoHTTPD.newFixedLengthResponse(response.toString())
    }

    @RequestHandler(route = "/rest/filesystem/delete/", methods = arrayOf("DELETE"))
    fun filesystemDelete(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val body = server.parseTextBody(sess)
        val gson = Gson()
        val payload = gson.fromJson<FileListPayload>(body);

        var success = true;
        var failCount = 0;
        var deleteCount = 0;
        for (path in payload.files ) {
            val file = File(path)
            println("DELETING $file")
            success = success && file.deleteRecursively()
            if (success) {
                println("Deleted")
                deleteCount++
            } else {
                println("Failed")
                failCount++
            }
        }

        var resBody = jsonObject(
                "successful" to success,
                "count" to deleteCount,
                "failCount" to failCount
        )

        var response = NanoHTTPD.newFixedLengthResponse(resBody.toString())

        return response;
    }

    @RequestHandler(route = "/rest/filesystem/mkdir/", methods = arrayOf("POST"))
    fun filesystemMkdir(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val body = server.parseTextBody(sess)
        val gson = Gson()
        val payload = gson.fromJson<MkdirPayload>(body);
        payload.name = payload.name.trim() // TODO: Figure out how spaces at beginning and end of path should be handled

        var status = 0
        var message = ""
        val fsFile = getAbsoluteFile(payload.name)

        if (fsFile.exists()) {
            message = "Folder already exists"
            status = 1
        } else if (fsFile.mkdir()) {
            message = "Folder created successfully"
            status = 0
        } else {
            message = "Failed to create folder"
            status = 2
        }

        var resBody = jsonObject(
                "status" to status,
                "message" to message
        )

        var response = NanoHTTPD.newFixedLengthResponse(resBody.toString())

        return response;
    }


    @RequestHandler(route = "/rest/phone/status")
    fun testRequest(sess: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        // Are we charging / charged?
        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        batteryStatus = mContext.registerReceiver(null, ifilter)

        val status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
        val chargePlug = batteryStatus.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
        val usbCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_USB
        val acCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_AC
        val level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1)

        val batteryPct = level / scale.toFloat()

        val obj: JsonObject = jsonObject(
                "charging" to chargePlug,
                "chargeMode" to (if (usbCharge) "usb" else (if (chargePlug == 1) "ac" else "discharging")),
                "level" to level,
                "scale" to scale,
                "percent" to batteryPct
        )

        return NanoHTTPD.newFixedLengthResponse(obj.toString())
    }

    @RequestHandler(route = "/rest/phone/info")
    fun phoneInfo(sess: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        // Are we charging / charged?
        var name = android.os.Build.MODEL;

        val obj: JsonObject = jsonObject(
                "model" to android.os.Build.MODEL,
                "brand" to android.os.Build.BRAND,
                "device" to android.os.Build.DEVICE,
                "manufacturer" to android.os.Build.MANUFACTURER,
                "product" to android.os.Build.PRODUCT,
                "host" to android.os.Build.HOST,
                "os" to jsonObject(
                        "base_os" to android.os.Build.VERSION.BASE_OS,
                        "release" to android.os.Build.VERSION.RELEASE,
                        "incremental" to android.os.Build.VERSION.INCREMENTAL,
                        "codename" to android.os.Build.VERSION.CODENAME
                )
        )
        var response = NanoHTTPD.newFixedLengthResponse(obj.toString())
        response.mimeType = "application/json";
        return response;
    }

    fun getAbsoluteFile(relative: String? = "") : File {
        val fsFile = File(Environment.getExternalStorageDirectory().toURI())
        return File(fsFile, relative)
    }

    fun serveFile(file: File): WebServer.Response {
        val mime = NanoHTTPD.getMimeTypeForFile(file.absolutePath)
        val fileName = file.name;
        val response = WebServer.Response(NanoHTTPD.Response.Status.OK, mime, file.inputStream(), -1)
        response.addHeader("Content-disposition", "attachement; filename=$fileName")

        return response;
    }

    class PostDownloadDelete (val mFile: File) : WebServer.Response.ResponseEventListener {

        override fun responseDelivered(Response: WebServer.Response) {
            if (mFile.delete()) {
                println("Successfully deleted the temp file");
            } else {
                println("Failed to delete the temp file");
            }
        }

    }

    @RequestHandler(route = "/rest/filesystem/serve/")
    fun downloadResource(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        var additionalPath  : String? = sess.parameters["path"]?.get(0) ?: ""

        println("Path: $additionalPath")

        var path = getAbsoluteFile(additionalPath)
        if (!path.exists()) {
            return server.notFoundResponse;
        }

        val res = serveFile(path)
        return res;
    }

    @RequestHandler(route = "/rest/filesystem/serveAndDelete/")
    fun downloadAbsolute(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        var absPath : String? = sess.parameters["path"]?.get(0) ?: ""
        var path = File(absPath)
        if (!path.exists()) {
            return server.notFoundResponse;
        }

        val res = serveFile(path)
        val listener = PostDownloadDelete(path)
        res.listeners.add(listener);
        return res
    }

    fun zipPath(path: File, target: File) {
        ZipUtil.pack(path, target);
    }

    @RequestHandler(route = "/rest/filesystem/zip/")
    fun zipResource(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        val additionalPath  : String? = sess.parameters["path"]?.get(0) ?: ""

        println("Path: $additionalPath")
        var path = getAbsoluteFile(additionalPath)
        if (!path.exists()) {
            return server.notFoundResponse;
        }

        var fileName = path.name;

        var mime = NanoHTTPD.getMimeTypeForFile(path.absolutePath)


        var response = NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mime, path.inputStream())
        response.addHeader("Content-disposition", "attachement; filename=$fileName")

        return response;
    }


    @RequestHandler(route = "/rest/filesystem/list/")
    fun fileSystemList(sess: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        var additionalPath  : String? = sess.parameters["path"]?.get(0) ?: ""

        println("Path: $additionalPath")
        var path = getAbsoluteFile(additionalPath)
        println("Serving $path")
        if (!path.exists()) {
            return server.notFoundResponse;
        }

        val fileList = path.list().map {
            val f = File(path, it.toString())
            jsonObject(
                    "name" to f.name,
                    "path" to f.path,
                    "absolutePath" to f.absolutePath,
                    "cannonicalPath" to f.canonicalPath,
                    "isDirectory" to f.isDirectory,
                    "isFile" to f.isFile
            )
        }

        val obj: JsonObject = jsonObject(
                "files" to jsonArray(fileList)
        )

        val response = NanoHTTPD.newFixedLengthResponse(obj.toString())
        response.mimeType = "application/json";
        return response;
    }

    override fun id(): String {
        return "WebDroid"
    }
}