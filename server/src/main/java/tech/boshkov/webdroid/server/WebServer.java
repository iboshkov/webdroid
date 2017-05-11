package tech.boshkov.webdroid.server;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.error.PebbleException;
import com.mitchellbosecke.pebble.loader.StringLoader;
import com.mitchellbosecke.pebble.template.PebbleTemplate;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.ServerSocket;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.StringTokenizer;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.WebServerPlugin;
import fi.iki.elonen.WebServerPluginInfo;
import fi.iki.elonen.util.ServerRunner;
import tech.boshkov.webdroid.server.annotations.RequestHandler;
import tech.boshkov.webdroid.server.interfaces.WebApplication;

public class WebServer extends NanoHTTPD implements Runnable {

    private static final String TAG = "SimpleWebServer";

    private final int mPort;

    private ServerSocket mServerSocket;
    /**
     * Default Index file names.
     */
    @SuppressWarnings("serial")
    public static final List<String> INDEX_FILE_NAMES = new ArrayList<String>() {

        {
            add("index.html");
            add("index.htm");
        }
    };

    private Context mContext;
    private ArrayList<WebApplication> mApplications;
    private AssetManager mAssetMgr;

    public WebServer(Context ctx, int port) throws IOException {
        super(port);
        mContext = ctx;
        mPort = port;
        mAssetMgr = ctx.getAssets();
        this.mApplications = new ArrayList<>();
    }
    private static Map<String, WebServerPlugin> mimeTypeHandlers = new HashMap<String, WebServerPlugin>();

    public void start() throws IOException {

        Map<String, String> options = new HashMap<String, String>();

        ServiceLoader<WebServerPluginInfo> serviceLoader = ServiceLoader.load(WebServerPluginInfo.class);
        for (WebServerPluginInfo info : serviceLoader) {
            String[] mimeTypes = info.getMimeTypes();
            for (String mime : mimeTypes) {
                String[] indexFiles = info.getIndexFilesForMimeType(mime);
                Log.i(TAG, "# Found plugin for Mime type: \"" + mime + "\"");
                if (indexFiles != null) {
                    System.out.print(" (serving index files: ");
                    for (String indexFile : indexFiles) {
                        System.out.print(indexFile + " ");
                    }
                }
                System.out.println(").");
                registerPluginForMimeType(indexFiles, mime, info.getWebServerPlugin(mime), options);
            }
        }
//        ServerRunner.executeInstance(this);
        this.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);

    }

    protected static void registerPluginForMimeType(String[] indexFiles, String mimeType, WebServerPlugin plugin, Map<String, String> commandLineOptions) {
        if (mimeType == null || plugin == null) {
            return;
        }

        if (indexFiles != null) {
            for (String filename : indexFiles) {
                int dot = filename.lastIndexOf('.');
                if (dot >= 0) {
                    String extension = filename.substring(dot + 1).toLowerCase();
                    mimeTypes().put(extension, mimeType);
                }
            }
            INDEX_FILE_NAMES.addAll(Arrays.asList(indexFiles));
        }
        mimeTypeHandlers.put(mimeType, plugin);
        plugin.initialize(commandLineOptions);
    }



    /**
     * URL-encodes everything between "/"-characters. Encodes spaces as '%20'
     * instead of '+'.
     */
    private String encodeUri(String uri) {
        String newUri = "";
        StringTokenizer st = new StringTokenizer(uri, "/ ", true);
        while (st.hasMoreTokens()) {
            String tok = st.nextToken();
            if ("/".equals(tok)) {
                newUri += "/";
            } else if (" ".equals(tok)) {
                newUri += "%20";
            } else {
                try {
                    newUri += URLEncoder.encode(tok, "UTF-8");
                } catch (UnsupportedEncodingException ignored) {
                }
            }
        }
        return newUri;
    }

    private InputStream findIndexFileInDirectory(String directory) throws IOException {
        String[] list = mAssetMgr.list(directory);
        for (String fileName : list) {
            if (INDEX_FILE_NAMES.contains(fileName)) {
                return mAssetMgr.open(fileName);
            }
        }
        return null;
    }


    @Override
    public Response serve(IHTTPSession session) {
        Map<String, String> header = session.getHeaders();
        Map<String, String> parms = session.getParms();
        String uri = session.getUri();
        Log.i(TAG, session.getMethod() + " '" + uri + "' ");

        Iterator<String> e = header.keySet().iterator();
        while (e.hasNext()) {
            String value = e.next();
            Log.i(TAG, "  HDR: '" + value + "' = '" + header.get(value) + "'");
        }
        e = parms.keySet().iterator();
        while (e.hasNext()) {
            String value = e.next();
            Log.i(TAG, "  PRM: '" + value + "' = '" + parms.get(value) + "'");
        }

        return defaultRespond(Collections.unmodifiableMap(header), session, uri);
    }
    private Response defaultRespond(Map<String, String> headers, IHTTPSession session, String uri) {
        // Remove URL arguments
        uri = uri.trim().replace(File.separatorChar, '/');
        if (uri.indexOf('?') >= 0) {
            uri = uri.substring(0, uri.indexOf('?'));
        }

        // Prohibit getting out of current directory
        if (uri.contains("../")) {
            return getForbiddenResponse("Won't serve ../ for security reasons.");
        }

        String path = "web/build" + uri;
        String response = "";
        InputStream stream = null;
        try {
            stream = mAssetMgr.open(path);
            StringBuilder inputStringBuilder = new StringBuilder();
            BufferedReader reader = null;
            reader = new BufferedReader(
                    new InputStreamReader(stream));

            // do reading, usually loop until end of file reading
            String l;
            while ((l = reader.readLine()) != null) {
                response += l;
            }
            stream.reset();
        } catch (IOException e) {
            e.printStackTrace();
            return getNotFoundResponse();
        }
        if (stream == null) {
            return getNotFoundResponse();
        }
        int size = 0;

        try {
            while (stream.read() >= 0) {
                size += 1;
            }
            stream.reset();
        } catch (IOException e) {
            e.printStackTrace();
        }
        String mime = this.getMimeTypeForFile(path);
        Log.i(TAG, "Trying to serve " + uri);
        return newFixedLengthResponse(Response.Status.ACCEPTED, mime, stream, size);
//
//        return newFixedLengthResponse(response);
    }

    public int getPort() {
        return mPort;
    }


    protected Response getForbiddenResponse(String s) {
        return newFixedLengthResponse(Response.Status.FORBIDDEN, NanoHTTPD.MIME_PLAINTEXT, "FORBIDDEN: " + s);
    }

    protected Response getInternalErrorResponse(String s) {
        return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, NanoHTTPD.MIME_PLAINTEXT, "INTERNAL ERROR: " + s);
    }

    protected Response getNotFoundResponse() {
        return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "Error 404, file not found.");
    }


    public static List<java.lang.reflect.Method> getRequestHandlerMethodsY(final Class<?> type) {
        List<java.lang.reflect.Method> methods = new ArrayList<java.lang.reflect.Method>();
        Class<?> klass = type;
        while (klass != Object.class) {
            ArrayList<java.lang.reflect.Method> allMethods = new ArrayList<java.lang.reflect.Method>();
            for (java.lang.reflect.Method method : allMethods) {

                if (method.isAnnotationPresent(RequestHandler.class)) {
                    //RequestHandler annotInstance = method.getAnnotation(RequestHandler.class);
                    methods.add(method);
                }
            }
            // move to the upper class in the hierarchy in search for more methods
            klass = klass.getSuperclass();
        }
        return methods;
    }

    @Override
    public void run() {

    }

    public void registerApplication(WebApplication app) {
        this.mApplications.add(app);
    }
}
