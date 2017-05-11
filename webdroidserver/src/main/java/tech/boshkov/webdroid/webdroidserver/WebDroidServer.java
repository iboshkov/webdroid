package tech.boshkov.webdroid.webdroidserver;

import android.content.Context;

import java.io.IOException;

import tech.boshkov.webdroid.server.WebServer;

/**
 * Created by mindc on 5/11/2017.
 */

public class WebDroidServer extends WebServer {
    public WebDroidServer(Context ctx, int port) throws IOException {
        super(ctx, port);

    }

}
