package tech.boshkov.webdroid.server

import android.content.Context
import android.content.res.AssetManager
import android.util.Log

import com.mitchellbosecke.pebble.PebbleEngine
import com.mitchellbosecke.pebble.error.PebbleException
import com.mitchellbosecke.pebble.loader.StringLoader
import com.mitchellbosecke.pebble.template.PebbleTemplate

import java.io.BufferedReader
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.io.StringWriter
import java.io.UnsupportedEncodingException
import java.io.Writer
import java.lang.reflect.Method
import java.net.ServerSocket
import java.net.URLEncoder
import java.util.ArrayList
import java.util.Arrays
import java.util.Collections
import java.util.HashMap
import java.util.ServiceLoader
import java.util.StringTokenizer

import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.WebServerPlugin
import fi.iki.elonen.WebServerPluginInfo
import fi.iki.elonen.util.ServerRunner
import tech.boshkov.webdroid.server.annotations.RequestHandler
import tech.boshkov.webdroid.server.interfaces.WebApplication

open class WebServer @Throws(IOException::class)
constructor(private val mContext: Context, val port: Int) : NanoHTTPD(port), Runnable {

    private val mServerSocket: ServerSocket? = null
    private val mApplications: ArrayList<WebApplication>
    private val mAssetMgr: AssetManager

    init {
        mAssetMgr = mContext.assets
        this.mApplications = ArrayList<WebApplication>()
    }

    @Throws(IOException::class)
    override fun start() {

        val options = HashMap<String, String>()

        val serviceLoader = ServiceLoader.load(WebServerPluginInfo::class.java)
        for (info in serviceLoader) {
            val mimeTypes = info.mimeTypes
            for (mime in mimeTypes) {
                val indexFiles = info.getIndexFilesForMimeType(mime)
                Log.i(TAG, "# Found plugin for Mime type: \"" + mime + "\"")
                if (indexFiles != null) {
                    print(" (serving index files: ")
                    for (indexFile in indexFiles) {
                        print(indexFile + " ")
                    }
                }
                println(").")
                registerPluginForMimeType(indexFiles, mime, info.getWebServerPlugin(mime), options)
            }
        }
        //        ServerRunner.executeInstance(this);
        this.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)

    }


    /**
     * URL-encodes everything between "/"-characters. Encodes spaces as '%20'
     * instead of '+'.
     */
    private fun encodeUri(uri: String): String {
        var newUri = ""
        val st = StringTokenizer(uri, "/ ", true)
        while (st.hasMoreTokens()) {
            val tok = st.nextToken()
            if ("/" == tok) {
                newUri += "/"
            } else if (" " == tok) {
                newUri += "%20"
            } else {
                try {
                    newUri += URLEncoder.encode(tok, "UTF-8")
                } catch (ignored: UnsupportedEncodingException) {
                }

            }
        }
        return newUri
    }

    @Throws(IOException::class)
    private fun findIndexFileInDirectory(directory: String): InputStream? {
        val list = mAssetMgr.list(directory)
        for (fileName in list) {
            if (INDEX_FILE_NAMES.contains(fileName)) {
                return mAssetMgr.open(fileName)
            }
        }
        return null
    }

    override fun serve(session: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        val header = session.headers
        val parms = session.parms

        var uri = session.uri
        Log.i(TAG, session.method.toString() + " '" + uri + "' ")

        uri = uri.trim { it <= ' ' }.replace(File.separatorChar, '/')
        if (uri.indexOf('?') >= 0) {
            uri = uri.substring(0, uri.indexOf('?'))
        }

        var e = header.keys.iterator()
        while (e.hasNext()) {
            val value = e.next()
            Log.i(TAG, "  HDR: '" + value + "' = '" + header[value] + "'")
        }
        e = parms.keys.iterator()
        while (e.hasNext()) {
            val value = e.next()
            Log.i(TAG, "  PRM: '" + value + "' = '" + parms[value] + "'")
        }

        val sessMethod = session.method.name.toUpperCase()

        for (app in mApplications) {
            val routeMethodMap = getRequestHandlersForClass(app.javaClass)

            for (handler in routeMethodMap.keys) {
                val route = handler.route
                val methods = handler.methods
                if (!methods.contains(sessMethod)) {
                    continue
                }

                Log.d(TAG, "Checking if $route == $uri")
                if (route != uri) {
                    continue
                }

                var handlerMethod = routeMethodMap[handler]

                var res = handlerMethod?.invoke(app, session) as Response;
                res.addHeader("Access-Control-Allow-Origin", "*"); // TODO: Not this.
                return res;
            }

        }

        return defaultRespond(Collections.unmodifiableMap(header), session, uri)
    }

    private fun defaultRespond(headers: Map<String, String>, session: NanoHTTPD.IHTTPSession, uri: String): NanoHTTPD.Response {
        var uri = uri
        // Remove URL arguments
        uri = uri.trim { it <= ' ' }.replace(File.separatorChar, '/')
        if (uri.indexOf('?') >= 0) {
            uri = uri.substring(0, uri.indexOf('?'))
        }

        // Prohibit getting out of current directory
        if (uri.contains("../")) {
            return getForbiddenResponse("Won't serve ../ for security reasons.")
        }

        val path = "web/build" + uri
        var response = ""
        var stream: InputStream? = null
        try {
            stream = mAssetMgr.open(path)
            val inputStringBuilder = StringBuilder()
            var reader: BufferedReader? = null
            reader = BufferedReader(
                    InputStreamReader(stream!!))

            var l: String
            reader.lineSequence().forEach {
                response += it
            }
            stream.reset()
        } catch (e: IOException) {
            e.printStackTrace()
            return notFoundResponse
        }

        var size = 0

        try {
            while (stream.read() >= 0) {
                size += 1
            }
            stream.reset()
        } catch (e: IOException) {
            e.printStackTrace()
        }


        val mime = NanoHTTPD.getMimeTypeForFile(path)
        Log.i(TAG, "Trying to serve " + uri)
        return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.ACCEPTED, mime, stream, size.toLong())
    }


    public fun getForbiddenResponse(s: String): NanoHTTPD.Response {
        return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.FORBIDDEN, NanoHTTPD.MIME_PLAINTEXT, "FORBIDDEN: " + s)
    }

    public fun getInternalErrorResponse(s: String): NanoHTTPD.Response {
        return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.INTERNAL_ERROR, NanoHTTPD.MIME_PLAINTEXT, "INTERNAL ERROR: " + s)
    }

    public val notFoundResponse: NanoHTTPD.Response
        get() = NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "Error 404, file not found.")

    override fun run() {

    }

    fun registerApplication(app: WebApplication) {
        this.mApplications.add(app)
    }


    private val TAG = "SimpleWebServer"
    /**
     * Default Index file names.
     */
    val INDEX_FILE_NAMES: MutableList<String> = object : ArrayList<String>() {

        init {
            add("index.html")
            add("index.htm")
        }
    }
    private val mimeTypeHandlers = HashMap<String, WebServerPlugin>()

    protected fun registerPluginForMimeType(indexFiles: Array<String>?, mimeType: String?, plugin: WebServerPlugin?, commandLineOptions: Map<String, String>) {
        if (mimeType == null || plugin == null) {
            return
        }

        if (indexFiles != null) {
            for (filename in indexFiles) {
                val dot = filename.lastIndexOf('.')
                if (dot >= 0) {
                    val extension = filename.substring(dot + 1).toLowerCase()
                    NanoHTTPD.mimeTypes().put(extension, mimeType)
                }
            }
            INDEX_FILE_NAMES.addAll(Arrays.asList(*indexFiles))
        }
        mimeTypeHandlers.put(mimeType, plugin)
        plugin.initialize(commandLineOptions)
    }

    fun getRequestHandlersForClass(type: Class<*>): Map<RequestHandler, java.lang.reflect.Method> {
        val routeMethodMap = HashMap<RequestHandler, java.lang.reflect.Method>()
        var klass = type
        while (klass != Any::class.java) {
            val allMethods = klass.declaredMethods

            for (method in allMethods) {

                if (method.isAnnotationPresent(RequestHandler::class.java)) {
                    val annotInstance = method.getAnnotation(RequestHandler::class.java)
                    routeMethodMap.put(annotInstance, method)
                }
            }
            // move to the upper class in the hierarchy in search for more methods
            klass = klass.superclass
        }
        return routeMethodMap
    }
}
