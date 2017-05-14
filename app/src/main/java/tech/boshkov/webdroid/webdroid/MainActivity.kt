package tech.boshkov.webdroid.webdroid

import android.Manifest
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.util.Log

import com.mitchellbosecke.pebble.PebbleEngine
import com.mitchellbosecke.pebble.error.PebbleException
import com.mitchellbosecke.pebble.loader.StringLoader
import com.mitchellbosecke.pebble.template.PebbleTemplate

import java.util.HashMap

import fi.iki.elonen.NanoHTTPD
import tech.boshkov.webdroid.server.*
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.WebApplication
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Environment
import com.github.salomonbrys.kotson.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import org.zeroturnaround.zip.*
import org.zeroturnaround.zip.FileSource
import org.zeroturnaround.zip.commons.IOUtils
import org.zeroturnaround.zip.extra.AsiExtraField
import org.zeroturnaround.zip.extra.ExtraFieldUtils
import java.io.*
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


class MainActivity : AppCompatActivity(), WebApplication {
    internal lateinit var server: WebServer
    internal lateinit var batteryStatus: Intent

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
        if (basePath.isNullOrEmpty()) {
            val absPath = folder.absolutePath
            newBasePath = absPath.substring(0, absPath.length - folder.name.length)
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val permissionCheck = ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE)

        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE), 0)
        try {
            server = WebServer(this, 3000)
            server.registerApplication(this)
            server.start()

        } catch (e: IOException) {
            e.printStackTrace()
        }

        var selection = listOf<String>("/storage/emulated/0/pics", "/storage/emulated/0/pics.zip")
        var path = File("/storage/emulated/0/pics")
        var out = "/storage/emulated/0/out.zip"
        var zip = File(out)
        if (zip.exists()) {
            zip.delete()
        }

        val outZip = ZipOutputStream(FileOutputStream(zip))

        selection.forEach {
            addToZip(File(it), outZip)
        }

        outZip.close()
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
        batteryStatus = this.registerReceiver(null, ifilter)

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
        var fsFile = File(Environment.getExternalStorageDirectory().toURI())
        return File(fsFile, relative)
    }

    @RequestHandler(route = "/rest/filesystem/serve/")
    fun downloadResource(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        var additionalPath  : String? = sess.parameters["path"]?.get(0) ?: ""

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

    fun zipPath(path: File, target: File) {
        ZipUtil.pack(path, target);
    }

    @RequestHandler(route = "/rest/filesystem/zip/")
    fun zipResource(sess: NanoHTTPD.IHTTPSession) : NanoHTTPD.Response {
        var additionalPath  : String? = sess.parameters["path"]?.get(0) ?: ""

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

        var fileList = path.list().map {
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

        var response = NanoHTTPD.newFixedLengthResponse(obj.toString())
        response.mimeType = "application/json";
        return response;
    }

    override fun id(): String {
        return "WebDroid"
    }
}
